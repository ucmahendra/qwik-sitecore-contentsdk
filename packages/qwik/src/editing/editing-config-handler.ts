import type { RequestHandler, RequestEvent } from '@builder.io/qwik-city';
import {
  EDITING_ALLOWED_ORIGINS,
  QUERY_PARAM_EDITING_SECRET,
} from '@sitecore-content-sdk/content/editing';
import { EditMode } from '@sitecore-content-sdk/content/layout';
import { getEnforcedCorsHeaders } from '@sitecore-content-sdk/core/tools';
import type { Metadata } from '@sitecore-content-sdk/core/node-tools';
import type { ComponentMap } from '../sharedTypes';
import { DEFAULT_EDITING_CONFIG_ENDPOINT } from './constants';
import { flattenQuery, resolveConfiguredEditingSecret } from './utils';

const EMPTY_METADATA: Metadata = { packages: {} };

/**
 * Factory that dynamically imports application metadata.
 * @public
 */
export type MetadataImportFn = () => Promise<{ default: Metadata } | Metadata>;

/**
 * Options for {@link createEditingConfigHandlers}.
 * @public
 */
export interface CreateEditingConfigHandlersOptions {
  /**
   * Component map registered with the Qwik app.
   */
  components: ComponentMap;
  /**
   * Inline metadata. When set, {@link metadataImport} is ignored.
   */
  metadata?: Metadata;
  /**
   * Optional dynamic import for metadata (e.g. `.sitecore/metadata.json`).
   */
  metadataImport?: MetadataImportFn;
  /**
   * Editing secret to validate. Defaults to `SITECORE_EDITING_SECRET`.
   */
  editingSecret?: string;
  /**
   * Endpoint path used only for documentation / matching when used as plugin.
   * Route files typically mount handlers at the path itself.
   * @default /api/editing/config
   */
  endpoint?: string;
}

/**
 * Normalizes a dynamic import result into Metadata.
 * @param {unknown} module Imported module value
 * @returns {Metadata} Parsed metadata or empty packages
 * @public
 */
export function normalizeImportedMetadata(module: unknown): Metadata {
  if (!module || typeof module !== 'object') {
    return EMPTY_METADATA;
  }
  const record = module as { default?: Metadata; packages?: Metadata['packages'] };
  const data = record.default ?? record;
  return {
    packages: { ...(data.packages ?? {}) },
  };
}

/**
 * Resolve CORS headers for the request. Returns null when the origin is rejected.
 * Empty object (no Origin header) is treated as a non-CORS request.
 * @param {RequestEvent} ev Request event
 * @returns {Record<string, string> | null} CORS headers or null when rejected
 */
function resolveCorsHeaders(ev: RequestEvent): Record<string, string> | null {
  const corsHeaders = getEnforcedCorsHeaders({
    requestMethod: ev.request.method,
    headers: ev.request.headers,
    allowedOrigins: EDITING_ALLOWED_ORIGINS,
  });

  // getEnforcedCorsHeaders returns {} when Origin is absent — allow non-CORS callers
  if (!corsHeaders) {
    return null;
  }

  // Echo Access-Control-Request-Headers on preflight when present
  if (ev.request.method === 'OPTIONS') {
    const requested = ev.request.headers.get('access-control-request-headers');
    if (requested) {
      corsHeaders['Access-Control-Allow-Headers'] = requested;
    }
  }

  return corsHeaders;
}

/**
 * Apply CORS headers onto the Qwik City response.
 * @param {RequestEvent} ev Request event
 * @param {Record<string, string>} corsHeaders Headers to set
 */
function setCorsHeaders(ev: RequestEvent, corsHeaders: Record<string, string>): void {
  Object.keys(corsHeaders).forEach((key) => {
    ev.headers.set(key, corsHeaders[key]);
  });
}

/**
 * Creates Qwik City request handlers for the editing config endpoint.
 * Returns registered component names, package metadata, and edit mode.
 * @param {CreateEditingConfigHandlersOptions} options Handler options
 * @returns Handlers for onGet / onOptions (and onRequest fallback)
 * @public
 */
export function createEditingConfigHandlers(options: CreateEditingConfigHandlersOptions): {
  onGet: RequestHandler;
  onOptions: RequestHandler;
  onRequest: RequestHandler;
  endpoint: string;
} {
  const { components, metadata: inlineMetadata, metadataImport } = options;
  const endpoint = options.endpoint ?? DEFAULT_EDITING_CONFIG_ENDPOINT;

  let cachedMetadata: Metadata | undefined = inlineMetadata;
  let metadataLoadPromise: Promise<Metadata> | undefined;

  const resolveMetadata = (): Promise<Metadata> => {
    if (cachedMetadata) {
      return Promise.resolve(cachedMetadata);
    }
    if (!metadataLoadPromise) {
      metadataLoadPromise = (async () => {
        if (!metadataImport) {
          cachedMetadata = EMPTY_METADATA;
          return cachedMetadata;
        }
        try {
          const loaded = await metadataImport();
          cachedMetadata = normalizeImportedMetadata(loaded);
        } catch {
          cachedMetadata = EMPTY_METADATA;
        }
        return cachedMetadata;
      })();
    }
    return metadataLoadPromise;
  };

  /**
   * CORS preflight — no secret check (matches Next.js OPTIONS handler).
   * Note: Vite may answer OPTIONS itself in `yarn dev`; configure `server.cors`
   * so Pages origins receive Access-Control-Allow-Origin.
   */
  const onOptions: RequestHandler = async (ev) => {
    const corsHeaders = resolveCorsHeaders(ev);
    if (!corsHeaders) {
      throw ev.json(401, { message: 'Invalid origin' });
    }
    setCorsHeaders(ev, corsHeaders);
    throw ev.send(204, '');
  };

  const onGet: RequestHandler = async (ev) => {
    const corsHeaders = resolveCorsHeaders(ev);
    if (!corsHeaders) {
      throw ev.json(401, { message: 'Invalid origin' });
    }
    setCorsHeaders(ev, corsHeaders);

    const query = flattenQuery(ev.url.searchParams);
    const secret = query[QUERY_PARAM_EDITING_SECRET];
    const configuredSecret = resolveConfiguredEditingSecret(options.editingSecret);

    if (!configuredSecret || secret !== configuredSecret) {
      throw ev.json(401, { message: 'Missing or invalid editing secret' });
    }

    const metadata = await resolveMetadata();

    throw ev.json(200, {
      components: Array.from(components.keys()),
      packages: { ...metadata.packages },
      editMode: EditMode.Metadata,
    });
  };

  /** Fallback for methods without a dedicated export (kept for compatibility). */
  const onRequest: RequestHandler = async (ev) => {
    if (ev.request.method === 'OPTIONS') {
      await onOptions(ev);
    }
  };

  return { onGet, onOptions, onRequest, endpoint };
}
