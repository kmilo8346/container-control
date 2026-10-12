import { Controller, Get, Post, Req, Res, UnauthorizedException, ServiceUnavailableException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response, CookieOptions } from 'express';

export const webUrl = process.env.WEB_URL ?? 'http://localhost:5173';
const callback = process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:3000/auth/github/callback';
const options: CookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' };
const sessionOptions: CookieOptions = { ...options, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' };
const sessionCookie = 'container_session';
const flowCookie = 'github_flow';

type User = { id: number; login: string; name: string | null; avatarUrl: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Get('github')
  async github(@Res() res: Response) {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return res.redirect(`${webUrl}/login?error=not_configured`);
    }
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(32).toString('base64url');
    const flow = await this.jwt.signAsync({ state, verifier }, { audience: 'github-flow', expiresIn: '10m' });
    res.cookie(flowCookie, flow, { ...options, maxAge: 600_000 });
    const url = new URL('https://github.com/login/oauth/authorize');
    url.search = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID, redirect_uri: callback, state, scope: 'read:user', code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' }).toString();
    return res.redirect(url.toString());
  }

  @Get('github/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    res.clearCookie(flowCookie, options);
    try {
      const { state, verifier } = await this.jwt.verifyAsync<{ state: string; verifier: string }>(req.cookies?.[flowCookie] ?? '', { audience: 'github-flow', algorithms: ['HS256'] });
      const supplied = req.query.state;
      if (typeof supplied !== 'string' || supplied.length !== state.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(state)) || typeof req.query.code !== 'string' || req.query.error) throw new UnauthorizedException();
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code: req.query.code, redirect_uri: callback, code_verifier: verifier }),
      });
      const token = await response.json() as { access_token?: string };
      if (!response.ok || !token.access_token) throw new ServiceUnavailableException();
      const profileResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'container-control' }, signal: AbortSignal.timeout(10_000) });
      const profile = await profileResponse.json() as { id: number; login: string; name: string | null; avatar_url: string };
      if (!profileResponse.ok || !Number.isInteger(profile.id) || typeof profile.login !== 'string') throw new UnauthorizedException();
      const user: User = { id: profile.id, login: profile.login, name: profile.name, avatarUrl: profile.avatar_url };
      const session = await this.jwt.signAsync({ sub: String(user.id), user }, { audience: 'container-control', expiresIn: '8h' });
      res.cookie(sessionCookie, session, { ...sessionOptions, maxAge: 8 * 60 * 60 * 1000 });
      return res.redirect(webUrl);
    } catch {
      return res.redirect(`${webUrl}/login?error=github_failed`);
    }
  }

  @Get('me')
  async me(@Req() req: Request) {
    try {
      const payload = await this.jwt.verifyAsync<{ user: User }>(req.cookies?.[sessionCookie] ?? '', { audience: 'container-control', algorithms: ['HS256'] });
      return payload.user;
    } catch { throw new UnauthorizedException(); }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.headers.origin !== new URL(webUrl).origin) throw new ForbiddenException();
    res.clearCookie(sessionCookie, sessionOptions);
    return { status: 'ok' };
  }
}
