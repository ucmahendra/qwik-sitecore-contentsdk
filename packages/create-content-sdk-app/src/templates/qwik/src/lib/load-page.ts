import { getSitecoreClient } from './sitecore-client';
import scConfig from '../../sitecore.config';
import type { Page } from '@sitecore-content-sdk/qwik';
import { getEditingPreviewData } from '@sitecore-content-sdk/qwik/editing';

/**
 * Fetches Sitecore page layout for a route path.
 * When editing preview data is present (Pages iframe), uses getPreview.
 * @param {string} path request path (e.g. "/" or "/about")
 * @param {object} [options] optional request context for editing
 * @param {Map<string, unknown>} [options.sharedMap] Qwik City sharedMap
 * @param {Headers} [options.headers] request headers
 * @returns {Promise<Page | null>} page layout or null when missing
 */
export async function loadSitecorePage(
  path: string,
  options?: {
    sharedMap?: Map<string, unknown>;
    headers?: Headers;
  }
): Promise<Page | null> {
  const client = getSitecoreClient();
  const previewData = getEditingPreviewData({
    sharedMap: options?.sharedMap,
    headers: options?.headers,
  });

  if (previewData) {
    try {
      const page = await client.getPreview(previewData);
      return (page as Page | null) ?? null;
    } catch (error) {
      console.error('Failed to load Sitecore preview layout', error);
      return null;
    }
  }

  const page = await client.getPage(path, {
    locale: scConfig.defaultLanguage,
    site: scConfig.defaultSite,
  });
  return (page as Page | null) ?? null;
}

/**
 * Builds a Sitecore path from Qwik City rest params.
 * @param {string | string[] | undefined} pathSegments catch-all path segments
 * @returns {string} Sitecore path
 */
export function pathFromSegments(pathSegments: string | string[] | undefined): string {
  if (!pathSegments) {
    return '/';
  }
  if (Array.isArray(pathSegments)) {
    return `/${pathSegments.join('/')}`;
  }
  return `/${pathSegments}`;
}
