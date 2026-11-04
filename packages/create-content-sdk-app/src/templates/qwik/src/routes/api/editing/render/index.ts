import { createEditingRenderMiddleware } from '@sitecore-content-sdk/qwik/editing';

/**
 * Editing render endpoint for Sitecore Pages.
 * No default component — API route only (not a page route).
 */
export const onRequest = createEditingRenderMiddleware();
