import {
  EDITING_ALLOWED_ORIGINS as CONTENT_EDITING_ALLOWED_ORIGINS,
} from '@sitecore-content-sdk/content/editing';
import { getAllowedOriginsFromEnv as coreGetAllowedOriginsFromEnv } from '@sitecore-content-sdk/core/tools';

/**
 * Sitecore Pages / XM Cloud editing origins allowed for CORS.
 * @public
 */
export const EDITING_ALLOWED_ORIGINS = CONTENT_EDITING_ALLOWED_ORIGINS;

/**
 * Origins from JSS_ALLOWED_ORIGINS / SITECORE_EDITING_ALLOWED_ORIGINS env.
 * @returns {string[]} Allowed origins
 * @public
 */
export function getAllowedOriginsFromEnv(): string[] {
  return coreGetAllowedOriginsFromEnv();
}
