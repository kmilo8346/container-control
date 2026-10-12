import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    let id: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(req.cookies?.container_session ?? '', { audience: 'container-control', algorithms: ['HS256'] });
      id = payload.sub;
    } catch { throw new UnauthorizedException(); }
    if (id !== (process.env.OWNER_GITHUB_ID ?? '18169079')) throw new ForbiddenException('Only the owner may control this Railway account.');
    return true;
  }
}
