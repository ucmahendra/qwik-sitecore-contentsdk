import type { EditingPreviewData } from '@sitecore-content-sdk/content/editing';
import {
  EDITING_PARAMS_HEADER,
  EDITING_PREVIEW_SHARED_MAP_KEY,
} from './constants';

/**
 * Read editing preview data from a Headers object or plain header map.
 * @param {Headers | Record<string, string | string[] | undefined>} headers Request headers
 * @returns {EditingPreviewData | undefined} Parsed preview data
 * @public
 */
export function getEditingPreviewDataFromHeaders(
  headers: Headers | Record<string, string | string[] | undefined>
): EditingPreviewData | undefined {
  let raw: string | null | undefined;
  if (typeof (headers as Headers).get === 'function') {
    raw = (headers as Headers).get(EDITING_PARAMS_HEADER);
  } else {
    const value = (headers as Record<string, string | string[] | undefined>)[EDITING_PARAMS_HEADER];
    raw = Array.isArray(value) ? value[0] : value;
  }
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as EditingPreviewData;
  } catch {
    return undefined;
  }
}

/**
 * Read editing preview data from a Qwik City sharedMap (preferred) or headers.
 * @param {object} options Lookup options
 * @param {Map<string, unknown>} [options.sharedMap] Request sharedMap
 * @param {Headers | Record<string, string | string[] | undefined>} [options.headers] Request headers
 * @returns {EditingPreviewData | undefined} Parsed preview data
 * @public
 */
export function getEditingPreviewData(options: {
  sharedMap?: Map<string, unknown>;
  headers?: Headers | Record<string, string | string[] | undefined>;
}): EditingPreviewData | undefined {
  const fromMap = options.sharedMap?.get(EDITING_PREVIEW_SHARED_MAP_KEY) as
    | EditingPreviewData
    | undefined;
  if (fromMap) {
    return fromMap;
  }
  if (options.headers) {
    return getEditingPreviewDataFromHeaders(options.headers);
  }
  return undefined;
}
