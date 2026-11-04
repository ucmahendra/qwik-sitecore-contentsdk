import { component$ } from '@builder.io/qwik';
import { Placeholder, type ComponentProps } from '@sitecore-content-sdk/qwik';

/**
 * SXA RowSplitter — renders enabled row placeholders (`row-N-{*}`).
 */
export const RowSplitter = component$<ComponentProps>((props) => {
  const enabled =
    props.params?.EnabledPlaceholders?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const styles = props.params?.styles ?? '';
  const renderingId = props.params?.RenderingIdentifier;

  return (
    <div
      class={`component row-splitter ${styles}`.trim()}
      id={renderingId || undefined}
    >
      {enabled.map((segment) => {
        const rowStyles = props.params?.[`Styles${segment}`] ?? '';
        return (
          <div key={segment} class={`container-fluid ${rowStyles}`.trim()}>
            <div>
              <div class="row">
                <Placeholder name={`row-${segment}-{*}`} rendering={props.rendering} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default RowSplitter;
