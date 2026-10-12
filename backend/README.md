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

## Painting API

Authenticated owner routes: GET /paintings, GET /deployments, POST /deployments
with JSON {"paintingId":"mona-lisa"}, GET /deployments/:id,
GET /deployments/:id/logs. Close painting only hides the browser detail view;
it does not stop the Railway container.

Configure PROJECT_TOKEN, PROJECT_ID, ENVIRONMENT_ID, SERVICE_ID locally.
SERVICE_ID must point to the dedicated container-runner using
kmilo8346/painting-runner:v3. OWNER_GITHUB_ID restricts access to the owner.
POST requests require the WEB_URL Origin header.

No deployment database is used. The browser stores its deployment ID and painting
selection; the API queries Railway for status and recent deployments. A process
lock serializes starts in this single-instance prototype; multiple API replicas
would need a shared lock. Logs refresh every 30 seconds; use fewer open tabs or
a longer interval on restrictive Railway rate-limit plans.

## Remote image URLs

The catalog includes imageUrl. Start sets IMAGE_URL with skipDeploys=true before
serviceInstanceDeploy. v3 requires no PAINTING_ID. Default public Wikimedia
download URLs are configured for the ten paintings. Replace any with a Cloudinary
delivery URL using PAINTING_URL_MONA_LISA, PAINTING_URL_PEARL_EARRING, etc.
Never use Cloudinary console/dashboard URLs. Secrets are not needed for public
image downloads. Restart the API after changing URL overrides.

Browser rendering interprets ANSI true-color output between generic
PAINTING_START and PAINTING_END markers. Recovery cannot infer the artwork name
from generic markers if the browser's deployment record was lost.
