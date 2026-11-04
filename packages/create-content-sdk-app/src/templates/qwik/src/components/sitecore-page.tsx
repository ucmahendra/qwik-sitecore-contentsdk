import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import {
  EditingScripts,
  Placeholder,
  SitecoreProvider,
  type Page,
} from '@sitecore-content-sdk/qwik';
import scConfig from '../../sitecore.config';
import componentMap from '../.sitecore/component-map';

export interface SitecorePageProps {
  page: Page | null;
}

/**
 * Renders a Sitecore page from layout data via Placeholder.
 */
export const SitecorePage = component$<SitecorePageProps>(({ page }) => {
  if (!page) {
    return (
      <main class="layout">
        <h1>Page not found</h1>
        <p>No Sitecore layout data was returned for this path.</p>
      </main>
    );
  }

  const route = page.layout.sitecore.route;

  if (!route) {
    return (
      <main class="layout">
        <h1>Missing route</h1>
        <p>Layout data did not include route information.</p>
      </main>
    );
  }

  return (
    <SitecoreProvider api={scConfig.api} componentMap={componentMap} page={page}>
      <EditingScripts />
      <main class={page.mode.isEditing ? 'layout editing-mode' : 'layout'}>
        <Placeholder name="headless-main" rendering={route} />
      </main>
    </SitecoreProvider>
  );
});

/**
 * Builds document head title from Sitecore page fields.
 * @param {Page | null | undefined} page Sitecore page
 * @returns {DocumentHead} document head config
 */
export function sitecorePageHead(page: Page | null | undefined): DocumentHead {
  const title =
    (page?.layout.sitecore.route?.fields?.Title as { value?: string } | undefined)?.value ||
    'Sitecore Content SDK Qwik';

  return { title };
}
