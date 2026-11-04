import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * When developing against the monorepo, resolve the Qwik SDK to source so
 * qwikVite can optimize component$. Outside the monorepo, remove these aliases
 * once @sitecore-content-sdk/qwik publishes a .qwik.mjs library build.
 */
const monorepoQwikSrc = path.resolve(__dirname, '../../../../packages/qwik/src');

/**
 * Vite 6 defaults CORS to localhost only. Sitecore Pages preflight comes from
 * pages.sitecorecloud.io — without these origins OPTIONS has no ACAO header.
 * Extra origins: comma-separated JSS_ALLOWED_ORIGINS in `.env`.
 */
const LOCALHOST_ORIGIN = /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;
const EDITING_CORS_ORIGINS: (string | RegExp)[] = [
  'https://pages.sitecorecloud.io',
  'https://xmapps.sitecorecloud.io',
  'https://designlibrary.sitecorecloud.io',
  'https://app.sitecorecloud.io',
  LOCALHOST_ORIGIN,
  ...(process.env.JSS_ALLOWED_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean) ?? []),
];

export default defineConfig(() => {
  return {
    // trailingSlash: false — required for editing render rewrite. With the default
    // true, fixTrailingSlash still uses originalUrl (/api/editing/render) after
    // rewrite() to the page and 301s the Pages iframe away from the SSR result.
    // enableRequestRewrite — required for ev.rewrite() during SSR (Pages editing).
    plugins: [
      mkcert(),
      qwikCity({ trailingSlash: false }),
      qwikVite({ experimental: ['enableRequestRewrite'] }),
      tsconfigPaths({ root: '.' }),
    ],
    server: {
      https: true,
      port: 3000,
      strictPort: true,
      host: true,
      cors: {
        origin: EDITING_CORS_ORIGINS,
      },
    },
    resolve: {
      alias: [
        {
          find: '@sitecore-content-sdk/qwik/editing',
          replacement: path.join(monorepoQwikSrc, 'editing/index.ts'),
        },
        {
          find: '@sitecore-content-sdk/qwik/config',
          replacement: path.join(monorepoQwikSrc, 'config/index.ts'),
        },
        {
          find: '@sitecore-content-sdk/qwik',
          replacement: path.join(monorepoQwikSrc, 'index.ts'),
        },
      ],
    },
    optimizeDeps: {
      exclude: ['@sitecore-content-sdk/qwik'],
    },
    ssr: {
      noExternal: [
        '@sitecore-content-sdk/qwik',
        '@sitecore-content-sdk/content',
        '@sitecore-content-sdk/core',
      ],
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
