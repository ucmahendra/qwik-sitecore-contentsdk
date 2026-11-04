import { createEditingConfigHandlers } from '@sitecore-content-sdk/qwik/editing';
import componentMap from '../../../../.sitecore/component-map';

/**
 * Editing config endpoint for Sitecore Pages.
 * Returns registered component names and package metadata.
 */
export const { onGet, onOptions, onRequest } = createEditingConfigHandlers({
  components: componentMap,
  metadata: { packages: {} },
});
