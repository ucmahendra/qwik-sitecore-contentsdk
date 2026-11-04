/**
 * Header used to propagate editing preview parameters from the editing render
 * middleware to page loaders via the rewritten Qwik City request.
 * @public
 */
export const EDITING_PARAMS_HEADER = 'x-sitecore-editing-params';

/**
 * SharedMap key used to pass {@link EditingPreviewData} through the Qwik City
 * request pipeline (preferred over re-parsing headers in loaders).
 * @public
 */
export const EDITING_PREVIEW_SHARED_MAP_KEY = 'scEditing';

/**
 * Default editing render endpoint path.
 * @public
 */
export const DEFAULT_EDITING_RENDER_ENDPOINT = '/api/editing/render';

/**
 * Default editing config endpoint path.
 * @public
 */
export const DEFAULT_EDITING_CONFIG_ENDPOINT = '/api/editing/config';
