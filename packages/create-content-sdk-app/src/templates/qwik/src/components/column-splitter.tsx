import { component$ } from '@builder.io/qwik';
import { Placeholder, type ComponentProps } from '@sitecore-content-sdk/qwik';

/**
 * SXA ColumnSplitter — renders enabled column placeholders (`column-N-{*}`).
 */
export const ColumnSplitter = component$<ComponentProps>((props) => {
  const enabled =
    props.params?.EnabledPlaceholders?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const styles = props.params?.styles ?? '';
  const renderingId = props.params?.RenderingIdentifier;

  return (
    <div
      class={`row component column-splitter ${styles}`.trim()}
      id={renderingId || undefined}
    >
      {enabled.map((columnNum) => {
        const width = props.params?.[`ColumnWidth${columnNum}`] ?? '';
        const columnStyle = props.params?.[`Styles${columnNum}`] ?? '';
        return (
          <div key={columnNum} class={`${width} ${columnStyle}`.trim()}>
            <div class="row">
              <Placeholder
                name={`column-${columnNum}-{*}`}
                rendering={props.rendering}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ColumnSplitter;
