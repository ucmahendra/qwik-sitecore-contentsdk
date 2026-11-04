import { SitecoreClient } from '@sitecore-content-sdk/qwik';
import scConfig from '../../sitecore.config';

/**
 * Shared Sitecore client singleton for server data loading.
 */
let client: SitecoreClient | undefined;

/**
 * Returns the shared SitecoreClient instance.
 * @returns {SitecoreClient} Sitecore client
 */
export function getSitecoreClient(): SitecoreClient {
  if (!client) {
    client = new SitecoreClient(scConfig);
  }
  return client;
}
