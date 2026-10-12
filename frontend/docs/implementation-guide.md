# Frontend implementation guide

Follow these rules when changing the frontend, including changes made by AI assistants.

## Components

- Keep shadcn/ui components and extensions to those components in `src/components/ui/`.
- Keep other reusable components directly in `src/components/`, outside `ui/`, with one component per file.
- Use kebab-case filenames and PascalCase component names, such as `painting-card.tsx` and `PaintingCard`.
- Reuse existing components before creating new ones.

```text
src/components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── painting-card.tsx
├── painting-thumbnail.tsx
└── error-message.tsx
```

## Pages and data

- Keep pages in `src/pages/login/`, `src/pages/gallery/`, and `src/pages/logs/`.
- Keep page-specific hooks with their page, in `hooks/index.ts` when needed.
- Keep hooks shared between pages in `src/hooks/` and providers in `src/providers/`.
- Keep API requests and their data types in `src/clients/`. Use the shared Axios base client.
- Keep deployment coordination in pages and hooks; presentation components receive data and callbacks through props.

## Making changes

- Write code that is easy to read: use clear names, consistent formatting, and small, focused functions.
- Avoid packing multiple statements or large JSX blocks onto one line.
- Use spaces around operators, consistent indentation, and line breaks for long expressions and JSX attributes.
- Use blank lines to separate imports, functions, and logical steps so the code is easy to scan.
- Add comments when needed to explain a non-obvious decision, constraint, or behavior. Explain why; do not repeat what the code already says.
- Keep changes simple and focused on the requested behavior.
- Update imports and remove unused code when moving files.
- Use Prettier for formatting: run `npm run format` after code changes and `npm run format:check` to verify formatting.
- Run `npm run build` and `npm run lint` after code changes, and report any remaining issues.
- Update this guide when the user agrees to a new convention.
