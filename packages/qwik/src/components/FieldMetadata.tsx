import { component$, Slot, type JSXOutput } from '@builder.io/qwik';
import { MetadataKind } from '@sitecore-content-sdk/content/editing';

export interface FieldMetadataProps {
  metadata: { [key: string]: unknown };
}

type ChromeCodeAttrs = {
  type: string;
  chrometype: string;
  class: string;
  kind: MetadataKind;
};

/**
 * Renders field metadata markup for Pages chrome hydration.
 * @public
 */
export const FieldMetadata = component$<FieldMetadataProps>((props) => {
  const data = JSON.stringify(props.metadata);
  const openAttrs = {
    type: 'text/sitecore',
    chrometype: 'field',
    class: 'scpm',
    kind: MetadataKind.Open,
  } as ChromeCodeAttrs;
  const closeAttrs = {
    type: 'text/sitecore',
    chrometype: 'field',
    class: 'scpm',
    kind: MetadataKind.Close,
  } as ChromeCodeAttrs;

  return (
    <>
      <code {...openAttrs}>{data}</code>
      <Slot />
      <code {...closeAttrs}></code>
    </>
  );
});

/**
 * Wraps children with field metadata when present and editable.
 * @param {object} options wrap options
 * @param {{ [key: string]: unknown } | undefined} options.metadata field metadata
 * @param {boolean} options.editable whether editing chrome is enabled
 * @param {JSXOutput} options.children field output
 * @returns {JSXOutput} wrapped or raw children
 */
export const wrapWithFieldMetadata = ({
  metadata,
  editable = true,
  children,
}: {
  metadata?: { [key: string]: unknown };
  editable?: boolean;
  children: JSXOutput;
}): JSXOutput => {
  if (!metadata || !editable) {
    return children;
  }

  const data = JSON.stringify(metadata);
  const openAttrs = {
    type: 'text/sitecore',
    chrometype: 'field',
    class: 'scpm',
    kind: MetadataKind.Open,
  } as ChromeCodeAttrs;
  const closeAttrs = {
    type: 'text/sitecore',
    chrometype: 'field',
    class: 'scpm',
    kind: MetadataKind.Close,
  } as ChromeCodeAttrs;

  return (
    <>
      <code {...openAttrs}>{data}</code>
      {children}
      <code {...closeAttrs}></code>
    </>
  );
};
