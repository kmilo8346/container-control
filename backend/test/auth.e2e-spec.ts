import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('GitHub authentication', () => {
  let app: INestApplication;
  let jwt: JwtService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.use(cookieParser());
    await app.init();
    jwt = module.get(JwtService);
  });
  afterAll(async () => { await app.close(); });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('rejects missing, tampered, expired and wrong-audience sessions', async () => {
    const expired = await jwt.signAsync({ user: { login: 'test' } }, { audience: 'container-control', expiresIn: -1 });
    const wrong = await jwt.signAsync({ user: { login: 'test' } }, { audience: 'github-flow' });
    for (const token of ['', 'tampered', expired, wrong]) {
      await request(app.getHttpServer()).get('/auth/me').set('Cookie', `container_session=${token}`).expect(401);
    }
  });

  it('rejects a callback without matching state before calling GitHub', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const flow = await jwt.signAsync({ state: 'expected', verifier: 'verifier' }, { audience: 'github-flow' });
    await request(app.getHttpServer()).get('/auth/github/callback?state=invalid&code=test').set('Cookie', `github_flow=${flow}`).expect(302).expect('Location', 'http://localhost:5173/login?error=github_failed');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('adds state and PKCE to authorization', async () => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'test-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'test-secret');
    const response = await request(app.getHttpServer()).get('/auth/github').expect(302);
    const url = new URL(response.headers.location);
    expect(url.origin).toBe('https://github.com');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('state')).toHaveLength(43);
    expect(url.searchParams.get('scope')).toBe('read:user');
  });

  it('exchanges the code, issues our cookie and returns the user', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'github-test-token' }))).mockResolvedValueOnce(new Response(JSON.stringify({ id: 42, login: 'test-user', name: 'Test', avatar_url: 'https://example.com/avatar' })));
    vi.stubGlobal('fetch', fetchMock);
    const flow = await jwt.signAsync({ state: 'expected', verifier: 'test-verifier' }, { audience: 'github-flow' });
    const result = await request(app.getHttpServer()).get('/auth/github/callback?state=expected&code=test').set('Cookie', `github_flow=${flow}`).expect(302).expect('Location', 'http://localhost:5173');
    const cookies = result.headers['set-cookie'] as unknown as string[];
    const session = cookies.find(cookie => cookie.startsWith('container_session='))!;
    expect(session).toContain('HttpOnly');
    expect(session).not.toContain('github-test-token');
    const exchange = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(exchange.body as string).code_verifier).toBe('test-verifier');
    await request(app.getHttpServer()).get('/auth/me').set('Cookie', session.split(';')[0]).expect(200).expect(({ body }) => { expect(body.login).toBe('test-user'); });
  });

  it('requires our web origin to clear the session cookie', async () => {
    await request(app.getHttpServer()).post('/auth/logout').set('Origin', 'https://other.example').expect(403);
    const result = await request(app.getHttpServer()).post('/auth/logout').set('Origin', 'http://localhost:5173').expect(201);
    expect(String(result.headers['set-cookie'])).toContain('container_session=;');
  });
});
