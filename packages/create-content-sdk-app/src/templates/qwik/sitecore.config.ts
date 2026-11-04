import { defineConfig } from '@sitecore-content-sdk/qwik/config';

/**
 * Sitecore configuration for the Qwik City app.
 * Client-safe values use PUBLIC_* env vars (Vite); server values use process.env.
 * @see https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 */
export default defineConfig(
  {},
  import.meta.env as unknown as Record<string, string | undefined>
);
