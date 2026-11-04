import {
  DeepRequired,
  defineConfig as defineConfigCore,
  SitecoreConfigInput as SitecoreConfigInputCore,
} from '@sitecore-content-sdk/content/config';
import { resolveEdgeUrl } from '@sitecore-content-sdk/core/tools';

/**
 * Reads `process.env` when running under Node; otherwise returns an empty object.
 * @returns {Record<string, string | undefined>} Environment map
 */
function getProcessEnv(): Record<string, string | undefined> {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  return env ? env : {};
}

/**
 * Provides default Qwik / Vite initial values from env variables for SitecoreConfig.
 * Prefers Vite `PUBLIC_*` client-safe vars, then falls back to shared Content SDK names.
 * @param {SitecoreConfigInput} [config] optional override values
 * @param {Record<string, string | undefined>} [clientEnv] browser-safe env (e.g. import.meta.env)
 * @returns {SitecoreConfigInput} merged input config
 */
export const getQwikFallbackConfig = (
  config?: SitecoreConfigInput,
  clientEnv: Record<string, string | undefined> = {}
): SitecoreConfigInput => {
  const env = { ...clientEnv, ...getProcessEnv() };

  return {
    ...config,
    api: {
      ...config?.api,
      edge: {
        ...config?.api?.edge,
        contextId: config?.api?.edge?.contextId || env.SITECORE_EDGE_CONTEXT_ID || '',
        clientContextId:
          config?.api?.edge?.clientContextId ||
          env.PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
          env.CSDK_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
          env.SITECORE_EDGE_CLIENT_CONTEXT_ID,
        edgeUrl: resolveEdgeUrl(
          config?.api?.edge?.edgeUrl ??
            (env.PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME ||
              env.CSDK_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME ||
              env.SITECORE_EDGE_PLATFORM_HOSTNAME)
        ),
      },
      local: {
        ...config?.api?.local,
        apiKey:
          config?.api?.local?.apiKey ||
          env.PUBLIC_SITECORE_API_KEY ||
          env.CSDK_PUBLIC_SITECORE_API_KEY ||
          env.SITECORE_API_KEY ||
          '',
        apiHost:
          config?.api?.local?.apiHost ||
          env.PUBLIC_SITECORE_API_HOST ||
          env.CSDK_PUBLIC_SITECORE_API_HOST ||
          env.SITECORE_API_HOST ||
          '',
      },
    },
    defaultSite:
      config?.defaultSite ||
      env.PUBLIC_DEFAULT_SITE_NAME ||
      env.CSDK_PUBLIC_DEFAULT_SITE ||
      env.SITECORE_DEFAULT_SITE ||
      '',
    defaultLanguage:
      config?.defaultLanguage ||
      env.PUBLIC_DEFAULT_LANGUAGE ||
      env.CSDK_PUBLIC_DEFAULT_LANGUAGE ||
      env.SITECORE_DEFAULT_LANGUAGE ||
      'en',
    personalize: {
      ...config?.personalize,
      scope:
        config?.personalize?.scope ||
        env.PUBLIC_PERSONALIZE_SCOPE ||
        env.CSDK_PUBLIC_PERSONALIZE_SCOPE ||
        env.SITECORE_PERSONALIZE_SCOPE,
    },
  };
};

/**
 * Type to be used as config input in sitecore.config for Qwik apps.
 * @public
 */
export type SitecoreConfigInput = SitecoreConfigInputCore;

/**
 * Final sitecore config type used at runtime.
 * @public
 */
export type SitecoreConfig = DeepRequired<SitecoreConfigInput>;

/**
 * Accepts a SitecoreConfigInput object and returns full Sitecore configuration for Qwik apps.
 * @param {SitecoreConfigInput} [config] override values
 * @param {Record<string, string | undefined>} [clientEnv] browser-safe env from Vite (import.meta.env)
 * @returns {SitecoreConfig} full sitecore configuration
 * @public
 */
export const defineConfig = (
  config?: SitecoreConfigInput,
  clientEnv: Record<string, string | undefined> = {}
): SitecoreConfig => {
  return defineConfigCore(getQwikFallbackConfig(config, clientEnv), {
    ...clientEnv,
    ...getProcessEnv(),
  }) as SitecoreConfig;
};
