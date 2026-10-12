# Container Control API

Minimal NestJS + TypeScript API. Railway integration will be added later.

## Run locally

```sh
npm install
npm run start:dev
```

Default port: `3000`. Override with the `PORT` environment variable.

- `GET /` — starter greeting
- `GET /health` — `{ "status": "ok" }`

## Checks

```sh
npm run build
npm test
npm run test:e2e
npm run lint
```

## Production

```sh
npm run build
npm run start:prod
```

## GitHub login setup

Create a GitHub OAuth App at https://github.com/settings/developers with:

- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:3000/auth/github/callback`

Copy `.env.example` to `.env`. Fill in `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and a random `JWT_SECRET` of at least 32 characters. Restart the API after changing configuration. Without credentials, login shows a setup message. Development can use an ephemeral signing secret; sessions then expire when the API restarts. Production requires a stable secret and HTTPS.

Flow: `/auth/github` → GitHub → `/auth/github/callback` → web app. The API validates state and PKCE, exchanges the code, reads the GitHub profile, and issues an eight-hour application JWT in an HttpOnly cookie. The GitHub token is used only to read the profile and is not stored or sent to the browser. `/auth/me` validates the session; `POST /auth/logout` clears the cookie. Logout does not revoke copies of an issued JWT; server-side revocation is not implemented.

For production, use web/API domains on the same site with HTTPS and update both callback URLs in GitHub and environment configuration. The frontend supports `VITE_API_URL`. GitHub login does not authorize access to Railway.
