import { component$ } from '@builder.io/qwik';
import { Placeholder, type ComponentProps } from '@sitecore-content-sdk/qwik';

/**
 * SXA-style Container that hosts a dynamic nested placeholder (`container-{id}`).
 * Required for Pages to edit nested placeholders under a Container rendering.
 */
export const Container = component$<ComponentProps>((props) => {
  const dynamicId = props.params?.DynamicPlaceholderId?.trim();
  const placeholderName = dynamicId ? `container-${dynamicId}` : '';
  const styles = props.params?.styles ?? '';
  const needsWrapper = styles.split(/\s+/).includes('container');
  const renderingId = props.params?.RenderingIdentifier;

  const inner = (
    <div class="component-content">
      {placeholderName ? (
        <div class="row">
          <Placeholder name={placeholderName} rendering={props.rendering} />
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      class={`component container-default ${styles}`.trim()}
      id={renderingId || undefined}
    >
      {needsWrapper ? <div class="container-wrapper">{inner}</div> : inner}
    </div>
  );
});

export default Container;
