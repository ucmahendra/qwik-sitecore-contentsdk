# Sitecore Content SDK for Qwik

Exploratory package providing Qwik / Qwik City integration for the Sitecore Content SDK.

## Scope

### MVP (layout)
- `defineConfig` with Vite/`PUBLIC_*` env fallbacks
- `SitecoreProvider` + `useSitecore`
- Field components: `Text`, `Image`, `Link`, `RichText`
- `Placeholder` + component map rendering

### Editing slice
- `@sitecore-content-sdk/qwik/editing` — config + render middleware (Angular-style rewrite)
- `EditingScripts` for Pages chrome hydration
- Preview via `sharedMap` / `x-sitecore-editing-params` → `SitecoreClient.getPreview`

Not included yet: personalize/redirects/multisite proxies, Design Library, FEAAS/BYOC, sitemap/robots, codegen.

## Installation

```bash
npm install @sitecore-content-sdk/qwik @builder.io/qwik @builder.io/qwik-city
```

## Editing setup (template)

1. Set `SITECORE_EDITING_SECRET` in `.env` (must match SitecoreAI Deploy)
2. Render route: `src/routes/api/editing/render` → `createEditingRenderMiddleware()`
3. Config route: `src/routes/api/editing/config` → `createEditingConfigHandlers({ components })`
4. Set `qwikCity({ trailingSlash: false })` and `qwikVite({ experimental: ['enableRequestRewrite'] })` so `ev.rewrite()` works for Pages editing
5. Page loaders call `getEditingPreviewData({ sharedMap, headers })` then `getPreview` / `getPage`
6. Render `<EditingScripts />` inside `SitecoreProvider`

## Vite note

`component$` in this package must be processed by the app's Qwik optimizer.
The starter aliases `@sitecore-content-sdk/qwik` to package **source** and sets
`ssr.noExternal` / `optimizeDeps.exclude` accordingly. Do not import the plain
`tsc` `dist/` output from a Qwik City app.

## Build (developers)

```bash
yarn install
yarn workspace @sitecore-content-sdk/qwik build
yarn workspace @sitecore-content-sdk/qwik test
```
