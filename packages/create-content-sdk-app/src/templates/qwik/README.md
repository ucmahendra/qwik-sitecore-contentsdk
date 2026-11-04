# Sitecore Content SDK — Qwik City (exploratory)

Node SSR starter using `@sitecore-content-sdk/qwik`.

## Quick start (connect to Sitecore)

1. Copy env and fill checklist values (see comments in the file):

```bash
cp .env.example .env
```

Required for delivery:

- `SITECORE_EDGE_CONTEXT_ID` / `PUBLIC_SITECORE_EDGE_CONTEXT_ID`
- `PUBLIC_DEFAULT_SITE_NAME`
- `PUBLIC_DEFAULT_LANGUAGE` (usually `en`)

2. Install and run:

```bash
npm install   # or yarn install inside the monorepo samples/
npm run dev
```

3. Open the URL Vite prints (often `http://localhost:5173/`).

### Content prerequisites

- Headless site whose main placeholder is `headless-main`
- Published page at `/`
- A `ContentBlock` rendering on that page — or change `src/.sitecore/component-map.ts` to match your rendering names

## Editing (Pages)

1. Set `SITECORE_EDITING_SECRET` in `.env` (same value on the Sitecore rendering host)
2. Expose localhost (ngrok / Cloudflare tunnel) and set that URL as the editing/rendering host
3. Open the page in Pages — editor calls `/api/editing/render` → rewrite → `getPreview`

Optional: `JSS_ALLOWED_ORIGINS` if CORS blocks the Pages iframe.

## What this starter includes

- `sitecore.config.ts` via `defineConfig`
- `routeLoader$` → `SitecoreClient.getPage` / `getPreview` (editing)
- `SitecoreProvider` + `Placeholder` for `headless-main`
- `EditingScripts` + `/api/editing/config` + `/api/editing/render` rewrite
- Sample `ContentBlock` using `Text` / `RichText`
- Manual `.sitecore/component-map.ts`

## Not included yet

Personalize/redirects/multisite proxies, Design Library, FEAAS/BYOC, sitemap/robots, component-map codegen.

## Vite note

`vite.config.ts` sets `ssr.noExternal` for `@sitecore-content-sdk/*` so Qwik can process the SDK package.

## Monorepo note

When scaffolded under `samples/`, Yarn workspaces resolve `@sitecore-content-sdk/qwik` from `packages/qwik`. Build that package first:

```bash
yarn workspace @sitecore-content-sdk/qwik build
```
