import { EditingPreviewData } from '@sitecore-content-sdk/content/editing';
import { DEFAULT_VARIANT } from '@sitecore-content-sdk/content/personalize';
import { EDITING_ALLOWED_ORIGINS, getAllowedOriginsFromEnv } from './cors-utils';

/**
 * Specification for an additional query parameter to forward into editing preview data.
 * @public
 */
export interface AllowedQueryParam {
  name: string;
  required?: boolean;
}

/**
 * Resolver function for additional query parameters to forward.
 * @public
 */
export type AllowedQueryParamsResolver = (
  queryParams: string[]
) => Array<AllowedQueryParam | string>;

/**
 * Allowed query parameters configuration.
 * @public
 */
export type AllowedQueryParams = Array<AllowedQueryParam | string> | AllowedQueryParamsResolver;

/**
 * Required editing render query parameters.
 * @public
 */
export const REQUIRED_EDITING_PARAMS = ['sc_site', 'sc_itemid', 'sc_lang', 'route', 'mode'] as const;

/**
 * Reads `process.env` when running under Node; otherwise returns undefined for the key.
 * @param {string} key env var name
 * @returns {string | undefined} value
 */
export function readProcessEnv(key: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  return env?.[key];
}

/**
 * Resolves the configured editing secret with fallback to env.
 * @param {string | undefined} option Explicit secret from options
 * @returns {string | undefined} Resolved secret
 * @public
 */
export function resolveConfiguredEditingSecret(option?: string): string | undefined {
  const raw = option !== undefined ? option : readProcessEnv('SITECORE_EDITING_SECRET');
  const trimmed = raw?.trim();
  return trimmed || undefined;
}

/**
 * Build EditingPreviewData from the request query string.
 * @param {Record<string, string | undefined>} query Query parameters
 * @param {Record<string, unknown>} allowedQueryParams Extra forwarded parameters
 * @returns {EditingPreviewData} Preview data for SitecoreClient.getPreview
 * @public
 */
export function buildPreviewData(
  query: Record<string, string | undefined>,
  allowedQueryParams: Record<string, unknown> = {}
): EditingPreviewData {
  const variantId = query.sc_variant ?? DEFAULT_VARIANT;
  return {
    site: String(query.sc_site ?? ''),
    itemId: String(query.sc_itemid ?? ''),
    language: String(query.sc_lang ?? ''),
    mode: String(query.mode ?? '') as EditingPreviewData['mode'],
    variantId,
    version: query.sc_version,
    layoutKind: query.sc_layoutKind as EditingPreviewData['layoutKind'],
    ...(query.sc_previewTime && { previewTime: query.sc_previewTime }),
    ...allowedQueryParams,
  };
}

/**
 * Resolve additional query parameters to forward and any missing required ones.
 * @param {Record<string, string | string[] | undefined>} queryParams Incoming query
 * @param {AllowedQueryParams} [allowedParams] Configuration
 * @returns allowed params and missing required names
 * @public
 */
export function resolveAllowedQueryParams(
  queryParams: Record<string, string | string[] | undefined>,
  allowedParams?: AllowedQueryParams
): { allowedQueryParams: Record<string, unknown>; missingAllowedParams: string[] } {
  const list =
    typeof allowedParams === 'function'
      ? allowedParams(Object.keys(queryParams))
      : Array.isArray(allowedParams)
        ? allowedParams
        : [];

  const allowedQueryParams: Record<string, unknown> = {};
  const missingAllowedParams: string[] = [];

  for (const param of list) {
    const name = typeof param === 'string' ? param : param.name;
    const required = typeof param === 'string' ? false : param.required;
    const value = queryParams[name];
    if (value !== undefined) {
      allowedQueryParams[name] = value;
    } else if (required) {
      missingAllowedParams.push(name);
    }
  }

  return { allowedQueryParams, missingAllowedParams };
}

/**
 * Flatten query values to single strings.
 * @param {URLSearchParams | Record<string, string | string[] | undefined>} query Query source
 * @returns {Record<string, string | undefined>} Flat query map
 * @public
 */
export function flattenQuery(
  query: URLSearchParams | Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      if (!(key in flat)) {
        flat[key] = value;
      }
    });
    return flat;
  }
  for (const [key, value] of Object.entries(query)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return flat;
}

/**
 * Build Content-Security-Policy frame-ancestors for the Pages iframe.
 * @returns {string} CSP header value
 * @public
 */
export function buildEditingCSPHeader(): string {
  return `frame-ancestors 'self' ${[...getAllowedOriginsFromEnv(), ...EDITING_ALLOWED_ORIGINS].join(
    ' '
  )}`;
}

/**
 * Default page URL resolver for Qwik apps without a locale path prefix.
 * @param {string} itemPath Decoded route from the query parameter
 * @returns {string} Pathname to rewrite to
 * @public
 */
export function defaultResolvePageUrl(itemPath: string): string {
  if (!itemPath || itemPath === '/') {
    return '/';
  }
  return itemPath.startsWith('/') ? itemPath : `/${itemPath}`;
}

// Re-export for consumers that need CORS origin list
export { EDITING_ALLOWED_ORIGINS, getAllowedOriginsFromEnv } from './cors-utils';
