import type { RequestHandler, RequestEvent } from '@builder.io/qwik-city';
import {
  EDITING_ALLOWED_ORIGINS,
  EditingPreviewData,
  QUERY_PARAM_EDITING_SECRET,
} from '@sitecore-content-sdk/content/editing';
import { getEnforcedCorsHeaders } from '@sitecore-content-sdk/core/tools';
import {
  DEFAULT_EDITING_RENDER_ENDPOINT,
  EDITING_PARAMS_HEADER,
  EDITING_PREVIEW_SHARED_MAP_KEY,
} from './constants';
import {
  AllowedQueryParams,
  REQUIRED_EDITING_PARAMS,
  buildEditingCSPHeader,
  buildPreviewData,
  defaultResolvePageUrl,
  flattenQuery,
  resolveAllowedQueryParams,
  resolveConfiguredEditingSecret,
} from './utils';

/**
 * Options for {@link createEditingRenderMiddleware}.
 * @public
 */
export interface CreateEditingRenderMiddlewareOptions {
  /**
   * Editing secret to validate. Defaults to `SITECORE_EDITING_SECRET`.
   */
  editingSecret?: string;
  /**
   * Endpoint path; default `/api/editing/render`.
   */
  endpoint?: string;
  /**
   * Remap the editor `route` query parameter to the app URL shape.
   * Defaults to the route path without a locale prefix.
   * @param {string} itemPath Decoded route from the query parameter
   * @param {EditingPreviewData} previewData Preview data parsed from the request
   * @returns {string} Pathname Qwik City should render
   */
  resolvePageUrl?: (itemPath: string, previewData: EditingPreviewData) => string;
  /**
   * Extra query parameters propagated into the editing preview data.
   */
  allowedQueryParams?: AllowedQueryParams;
}

/**
 * Apply CORS headers; returns false when origin is rejected.
 * @param {RequestEvent} ev Request event
 * @returns {boolean} Whether CORS validation passed
 */
function applyCors(ev: RequestEvent): boolean {
  const corsHeaders = getEnforcedCorsHeaders({
    requestMethod: ev.request.method,
    headers: ev.request.headers,
    allowedOrigins: EDITING_ALLOWED_ORIGINS,
  });

  // null = rejected origin; {} = no Origin (non-CORS) — allow without ACAO
  if (!corsHeaders) {
    return false;
  }

  if (ev.request.method === 'OPTIONS') {
    const requested = ev.request.headers.get('access-control-request-headers');
    if (requested) {
      corsHeaders['Access-Control-Allow-Headers'] = requested;
    }
  }

  Object.keys(corsHeaders).forEach((key) => {
    ev.headers.set(key, corsHeaders[key]);
  });
  return true;
}

/**
 * Qwik City plugin middleware for the editing render endpoint.
 * Validates CORS + secret + required params, stores preview data on
 * `sharedMap`, sets CSP, then rewrites to the page route so SSR continues
 * in-process (Angular-style; no internal HTML fetch).
 * @param {CreateEditingRenderMiddlewareOptions} [options] Middleware options
 * @returns {RequestHandler} Plugin `onRequest` handler
 * @public
 */
export function createEditingRenderMiddleware(
  options?: CreateEditingRenderMiddlewareOptions
): RequestHandler {
  const endpoint = options?.endpoint ?? DEFAULT_EDITING_RENDER_ENDPOINT;

  const normalizedEndpoint = endpoint.replace(/\/$/, '') || '/';

  return async (ev) => {
    // Accept with or without trailing slash (Qwik City trailingSlash config varies)
    const pathname = ev.url.pathname.replace(/\/$/, '') || '/';
    if (pathname !== normalizedEndpoint) {
      return;
    }

    if (!applyCors(ev)) {
      const origin = ev.request.headers.get('origin');
      throw ev.json(401, { error: `Requests from origin ${origin} not allowed` });
    }

    // Preflight — no secret check (matches Next.js OPTIONS handler)
    if (ev.request.method === 'OPTIONS') {
      throw ev.send(204, '');
    }

    const flatQuery = flattenQuery(ev.url.searchParams);
    const secret = flatQuery[QUERY_PARAM_EDITING_SECRET];
    const configuredSecret = resolveConfiguredEditingSecret(options?.editingSecret);

    if (!configuredSecret || secret !== configuredSecret) {
      throw ev.json(401, { error: 'Missing or invalid secret' });
    }

    if (ev.request.method !== 'GET') {
      ev.headers.set('Allow', 'GET');
      throw ev.json(405, { error: `Invalid request method '${ev.request.method}'` });
    }

    const queryRecord: Record<string, string | string[] | undefined> = {};
    ev.url.searchParams.forEach((value, key) => {
      const existing = queryRecord[key];
      if (existing === undefined) {
        queryRecord[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        queryRecord[key] = [existing, value];
      }
    });

    const missingRequired = REQUIRED_EDITING_PARAMS.filter((p) => !flatQuery[p]);
    const { allowedQueryParams, missingAllowedParams } = resolveAllowedQueryParams(
      queryRecord,
      options?.allowedQueryParams
    );

    if (missingRequired.length || missingAllowedParams.length) {
      const missing = [...missingRequired, ...missingAllowedParams];
      throw ev.json(400, {
        error: `Missing required query parameters: ${missing.join(', ')}`,
      });
    }

    const previewData = buildPreviewData(flatQuery, allowedQueryParams);
    ev.headers.set('Content-Security-Policy', buildEditingCSPHeader());

    const decodedRoute = flatQuery.route ?? '';
    const targetRoute =
      options?.resolvePageUrl?.(decodedRoute, previewData) ?? defaultResolvePageUrl(decodedRoute);

    ev.sharedMap.set(EDITING_PREVIEW_SHARED_MAP_KEY, previewData);
    ev.headers.set(EDITING_PARAMS_HEADER, JSON.stringify(previewData));

    // rewrite() must be thrown for Qwik City to continue SSR on the target route
    throw ev.rewrite(encodeURI(targetRoute));
  };
}
