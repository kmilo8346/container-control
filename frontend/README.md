# Container Control Web

React + TypeScript painting gallery, using Vite, Tailwind CSS and shadcn/ui.
The gallery loads the API catalog, starts Railway deployments, and renders
Chafa ANSI artwork from runtime logs. Closing the detail view does not stop
its container. GitHub login protects the gallery and logs routes.

## Development

Before changing the frontend, read the [implementation guide](docs/implementation-guide.md).

```sh
npm install
npm run dev
```

Set VITE_API_URL if the API is not at http://localhost:3000.

## Checks

```sh
npm run lint
npm run build
```
