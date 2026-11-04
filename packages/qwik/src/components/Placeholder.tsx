import { component$, type JSXOutput } from '@builder.io/qwik';
import { ComponentRendering, Field, Item, RouteData } from '@sitecore-content-sdk/content/layout';
import { useSitecore } from './SitecoreProvider';
import {
  getChildComponentProps,
  getComponentForRendering,
  getPlaceholderRenderings,
  renderEmptyPlaceholderClass,
} from './placeholder-utils';
import { wrapWithPlaceholderMetadata } from './PlaceholderMetadata';

/**
 * Props for the Placeholder component.
 * @public
 */
export interface PlaceholderProps {
  /** Name of the placeholder to render. */
  name: string;
  /** Rendering data to be used when rendering the placeholder. */
  rendering: ComponentRendering | RouteData;
  /**
   * Fields aggregated and propagated through the component tree.
   */
  fields?: {
    [name: string]: Field | Item | Item[];
  };
  /**
   * Params aggregated and propagated through the component tree.
   */
  params?: {
    [name: string]: string;
  };
}

/**
 * Renders components assigned to a Sitecore placeholder.
 * In editing mode, emits Pages chrome around the placeholder and each rendering.
 * @public
 */
export const Placeholder = component$<PlaceholderProps>((props) => {
  const { page, componentMap } = useSitecore();
  const isEditing = page.mode.isEditing;
  const placeholderRenderings = getPlaceholderRenderings(
    props.rendering,
    props.name,
    isEditing
  );
  const isEmpty = placeholderRenderings.length === 0;

  const components = placeholderRenderings.map((componentRendering, index) => {
    const { component: ChildComponent } = getComponentForRendering(
      componentRendering,
      props.name,
      componentMap
    );
    const key = componentRendering.uid || `component-${index}`;
    const renderedProps = getChildComponentProps(props, componentRendering);
    const rendered = <ChildComponent key={key} {...renderedProps} />;

    if (!isEditing) {
      return rendered;
    }

    // Rendering chrome so Pages can select / move components
    return wrapWithPlaceholderMetadata({
      rendering: componentRendering,
      children: rendered,
    });
  });

  let output: JSXOutput = <>{components}</>;

  if (isEditing) {
    // Placeholder chrome so Pages can drop components into this placeholder
    output = wrapWithPlaceholderMetadata({
      rendering: props.rendering as ComponentRendering,
      placeholderName: props.name,
      children: <>{components}</>,
    });
  }

  if (isEmpty && isEditing) {
    return <div class={renderEmptyPlaceholderClass}>{output}</div>;
  }

  return output;
});
