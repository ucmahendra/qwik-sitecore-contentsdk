import { component$ } from '@builder.io/qwik';
import { getContentSdkPagesClientData } from '@sitecore-content-sdk/content/editing';
import { useSitecore } from './SitecoreProvider';

/**
 * Renders client scripts and JSON data required by Sitecore Pages in edit mode.
 * Mount inside {@link SitecoreProvider} (e.g. page layout) so chromes can hydrate.
 * @public
 */
export const EditingScripts = component$(() => {
  const { page } = useSitecore();
  const { mode, layout } = page;

  if (mode.isNormal || mode.isPreview) {
    return null;
  }

  // Design Library not in this slice — skip script injection when in DL mode
  if (mode.isDesignLibrary) {
    return null;
  }

  const { clientData, clientScripts } = layout.sitecore.context;
  const contentSdkClientData = { ...clientData, ...getContentSdkPagesClientData() };

  return (
    <>
      {clientScripts?.map((src) => (
        <script key={src} src={src} />
      ))}
      {Object.keys(contentSdkClientData).map((id) => (
        <script
          key={id}
          id={id}
          type="application/json"
          dangerouslySetInnerHTML={JSON.stringify(contentSdkClientData[id])}
        />
      ))}
    </>
  );
});
