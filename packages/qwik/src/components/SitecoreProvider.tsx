import {
  component$,
  createContextId,
  noSerialize,
  useContext,
  useContextProvider,
  useStore,
  useTask$,
  Slot,
  type NoSerialize,
} from '@builder.io/qwik';
import { Page } from '@sitecore-content-sdk/content/client';
import { SitecoreConfig } from '@sitecore-content-sdk/content/config';
import { ComponentMap } from '../sharedTypes';

/**
 * Sitecore provider state shared via Qwik context.
 * @public
 */
export interface SitecoreProviderState {
  page: Page;
  componentMap: NoSerialize<ComponentMap> | undefined;
  api?: SitecoreConfig['api'];
}

/**
 * Props for SitecoreProvider.
 * @public
 */
export interface SitecoreProviderProps {
  api: SitecoreConfig['api'];
  componentMap: ComponentMap;
  page: Page;
}

/**
 * Context id for Sitecore provider state.
 * @public
 */
export const SitecoreContextId = createContextId<SitecoreProviderState>('sitecore-content-sdk');

/**
 * Provides Sitecore page, API, and component map to descendants.
 * @public
 */
export const SitecoreProvider = component$<SitecoreProviderProps>((props) => {
  const state = useStore<SitecoreProviderState>({
    page: props.page,
    componentMap: noSerialize(props.componentMap),
    api: props.api,
  });

  // Sync when routeLoader$ supplies a new page (must not mutate during render)
  useTask$(({ track }) => {
    const page = track(() => props.page);
    const componentMap = track(() => props.componentMap);
    const api = track(() => props.api);
    state.page = page;
    state.componentMap = noSerialize(componentMap);
    state.api = api;
  });

  useContextProvider(SitecoreContextId, state);

  return <Slot />;
});
/**
 * Access the current Sitecore provider state.
 * @returns {SitecoreProviderState} provider state
 * @public
 */
export function useSitecore(): SitecoreProviderState {
  return useContext(SitecoreContextId);
}
