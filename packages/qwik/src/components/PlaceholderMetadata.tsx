import type { JSXOutput } from '@builder.io/qwik';
import {
  ComponentRendering,
  getDynamicPlaceholderPattern,
  isDynamicPlaceholder,
} from '@sitecore-content-sdk/content/layout';
import { DEFAULT_PLACEHOLDER_UID, MetadataKind } from '@sitecore-content-sdk/content/editing';

/**
 * Props for placeholder / rendering metadata chrome.
 * @public
 */
export interface PlaceholderMetadataProps {
  rendering: ComponentRendering;
  placeholderName?: string;
  children?: JSXOutput;
}

type CodeBlockAttributes = {
  type: string;
  chrometype: string;
  class: string;
  kind: string;
  id?: string;
};

/**
 * Builds open/close chrome attributes for a placeholder or rendering.
 * @param {object} options Attribute options
 * @param {MetadataKind} options.kind Open or close chrome
 * @param {ComponentRendering} options.rendering Parent or child rendering
 * @param {string} [options.id] Rendering uid used in chrome id
 * @param {string} [options.placeholderName] When set, emits placeholder chrome
 * @returns {CodeBlockAttributes} Attributes for a `<code class="scpm">` element
 */
function getCodeBlockAttributes({
  kind,
  rendering,
  id,
  placeholderName,
}: {
  kind: MetadataKind;
  rendering: ComponentRendering;
  id?: string;
  placeholderName?: string;
}): CodeBlockAttributes {
  const chrometype = placeholderName ? 'placeholder' : 'rendering';

  const attributes: CodeBlockAttributes = {
    type: 'text/sitecore',
    chrometype,
    class: 'scpm',
    kind,
  };

  if (kind === MetadataKind.Open) {
    if (chrometype === 'placeholder' && placeholderName) {
      let phId = '';

      for (const placeholder of Object.keys(rendering.placeholders ?? {})) {
        if (placeholderName === placeholder) {
          phId = id
            ? `${placeholderName}_${id}`
            : `${placeholderName}_${DEFAULT_PLACEHOLDER_UID}`;
          break;
        }

        if (isDynamicPlaceholder(placeholder)) {
          const pattern = getDynamicPlaceholderPattern(placeholder);
          if (pattern.test(placeholderName)) {
            phId = id ? `${placeholder}_${id}` : `${placeholder}_${DEFAULT_PLACEHOLDER_UID}`;
            break;
          }
        }
      }

      attributes.id = phId;
    } else {
      attributes.id = id;
    }
  }

  return attributes;
}

/**
 * Wraps children with Sitecore Pages placeholder or rendering chrome (`scpm` code blocks).
 * Required for Page Builder to recognize placeholders and components.
 * @param {PlaceholderMetadataProps} props Metadata props
 * @returns {JSXOutput} Children surrounded by chrome
 * @public
 */
export function wrapWithPlaceholderMetadata({
  rendering,
  placeholderName,
  children,
}: PlaceholderMetadataProps): JSXOutput {
  const openAttrs = getCodeBlockAttributes({
    kind: MetadataKind.Open,
    rendering,
    id: rendering.uid,
    placeholderName,
  });
  const closeAttrs = getCodeBlockAttributes({
    kind: MetadataKind.Close,
    rendering,
    placeholderName,
  });

  return (
    <>
      <code {...openAttrs} />
      {children}
      <code {...closeAttrs} />
    </>
  );
}
