import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { SitecorePage, sitecorePageHead } from '../../components/sitecore-page';
import { loadSitecorePage, pathFromSegments } from '../../lib/load-page';

export const useSitecorePage = routeLoader$(async ({ params, status, sharedMap, request }) => {
  const path = pathFromSegments(params.path);
  const page = await loadSitecorePage(path, {
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
