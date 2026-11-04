import { Component } from '@builder.io/qwik';
import {
  ComponentRendering,
  RouteData,
  isDynamicPlaceholder,
  getDynamicPlaceholderPattern,
  getRenderingParamString,
} from '@sitecore-content-sdk/content/layout';
import { HIDDEN_RENDERING_NAME } from '@sitecore-content-sdk/content';
import { MissingComponent } from './MissingComponent';
import { HiddenRendering } from './HiddenRendering';
import {
  ComponentMap,
  ComponentProps,
  DEFAULT_EXPORT_NAME,
  QwikContentSdkComponent,
} from '../sharedTypes';

/**
 * Get the renderings for the specified placeholder from layout data.
 * @param {ComponentRendering | RouteData} rendering rendering data
 * @param {string} name placeholder name
 * @param {boolean} isEditing whether components should be rendered in editing mode
 * @returns {ComponentRendering[]} array of component renderings
 */
export const getPlaceholderRenderings = (
  rendering: ComponentRendering | RouteData,
  name: string,
  isEditing: boolean
): ComponentRendering[] => {
  let phName = name.slice();

  if (rendering?.placeholders) {
    Object.entries(rendering.placeholders).forEach(([key, value]) => {
      const patternPlaceholder = isDynamicPlaceholder(key)
        ? getDynamicPlaceholderPattern(key)
        : null;

      if (patternPlaceholder && patternPlaceholder.test(phName)) {
        if (isEditing) {
          phName = key;
        } else {
          rendering.placeholders![phName] = value;
          delete rendering.placeholders![key];
        }
      }
    });
  }

  const result =
    rendering && rendering.placeholders && Object.keys(rendering.placeholders).length > 0
      ? rendering.placeholders[phName]
      : null;

  if (!result) {
    console.warn(
      `Placeholder '${phName}' was not found in the current rendering data`,
      JSON.stringify(rendering, null, 2)
    );
    return [];
  }

  return result;
};

/**
 * Get SXA-specific params from Sitecore rendering params.
 * @param {ComponentRendering} rendering rendering object
 * @returns {{ styles: string } | undefined} converted SXA params
 */
export const getSXAParams = (rendering: ComponentRendering): { styles: string } | undefined => {
  if (!rendering.params) return { styles: '' };

  const gridParameters = getRenderingParamString(rendering.params.GridParameters) ?? '';
  const styles = getRenderingParamString(rendering.params.Styles) ?? '';
  const combinedStyles = [gridParameters, styles].filter(Boolean).join(' ');

  if (!combinedStyles) {
    return undefined;
  }

  return { styles: combinedStyles };
};

/**
 * Merge placeholder props with component field and params.
 * @param {object} placeholderProps placeholder fields/params
 * @param {ComponentRendering} componentRendering component rendering
 * @returns {ComponentProps} merged props
 */
export function getChildComponentProps(
  placeholderProps: {
    fields?: ComponentProps['fields'];
    params?: ComponentProps['params'];
  },
  componentRendering: ComponentRendering
): ComponentProps {
  const fields = { ...(placeholderProps.fields || {}), ...(componentRendering.fields || {}) };
  const params = { ...(placeholderProps.params || {}), ...(componentRendering.params || {}) };
  return {
    fields,
    params: {
      ...params,
      ...getSXAParams(componentRendering),
    },
    rendering: componentRendering,
  };
}

export interface ComponentForRendering {
  component: Component<ComponentProps>;
  isEmpty: boolean;
}

/**
 * Resolve a Qwik component implementation from the component map.
 * @param {ComponentRendering} renderingDefinition rendering data
 * @param {string} placeholderName name of current placeholder
 * @param {ComponentMap} [componentMap] component map
 * @returns {ComponentForRendering} resolved component
 */
export const getComponentForRendering = (
  renderingDefinition: ComponentRendering,
  placeholderName: string,
  componentMap?: ComponentMap
): ComponentForRendering => {
  const logUnknownComponentError = (variant?: string) => {
    console.error(
      `Placeholder ${placeholderName} contains unknown component ${
        renderingDefinition.componentName
      }${
        variant ? ` (${variant})` : ''
      }. Ensure that a Qwik component exists for it, and that it is registered in your component-map file.`
    );
  };

  if (renderingDefinition.componentName === HIDDEN_RENDERING_NAME) {
    return {
      component: HiddenRendering as unknown as Component<ComponentProps>,
      isEmpty: true,
    };
  }

  if (!renderingDefinition.componentName) {
    return {
      component: (() => null) as unknown as Component<ComponentProps>,
      isEmpty: true,
    };
  }

  let entry: QwikContentSdkComponent | undefined;
  if (!componentMap || componentMap.size === 0) {
    console.warn(
      `No components were available in component map to service request for component ${renderingDefinition.componentName}`
    );
  } else {
    entry = componentMap.get(renderingDefinition.componentName);
  }

  if (!entry) {
    logUnknownComponentError();
    return {
      component: MissingComponent as unknown as Component<ComponentProps>,
      isEmpty: true,
    };
  }

  const exportName = renderingDefinition.params?.FieldNames;
  const moduleEntry = entry as {
    [key: string]: unknown;
    Default?: Component<ComponentProps>;
    default?: Component<ComponentProps>;
  };

  const renderedComponent =
    exportName && exportName !== DEFAULT_EXPORT_NAME
      ? (moduleEntry[exportName] as Component<ComponentProps>)
      : moduleEntry.default ||
        moduleEntry.Default ||
        (entry as Component<ComponentProps>);

  if (!renderedComponent) {
    logUnknownComponentError(exportName !== DEFAULT_EXPORT_NAME ? exportName : undefined);
    return {
      component: MissingComponent as unknown as Component<ComponentProps>,
      isEmpty: true,
    };
  }

  return {
    component: renderedComponent,
    isEmpty: false,
  };
};

/**
 * Wraps empty placeholder output for edit mode styling.
 * @param {unknown} node placeholder children
 * @returns empty placeholder wrapper descriptor
 */
export const renderEmptyPlaceholderClass = 'sc-jss-empty-placeholder';
