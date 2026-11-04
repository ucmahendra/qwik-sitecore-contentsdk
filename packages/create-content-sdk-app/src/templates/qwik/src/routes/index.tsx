import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { SitecorePage, sitecorePageHead } from '../components/sitecore-page';
import { loadSitecorePage } from '../lib/load-page';

export const useSitecorePage = routeLoader$(async ({ status, sharedMap, request }) => {
  const page = await loadSitecorePage('/', {
    sharedMap,
    headers: request.headers,
  });
  if (!page) {
    status(404);
  }
  return page;
});

export default component$(() => {
  const page = useSitecorePage();
  return <SitecorePage page={page.value} />;
});

export const head: DocumentHead = ({ resolveValue }) => {
  return sitecorePageHead(resolveValue(useSitecorePage));
};
