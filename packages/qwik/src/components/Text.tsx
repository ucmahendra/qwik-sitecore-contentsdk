import { component$, type JSXOutput } from '@builder.io/qwik';
import { isFieldValueEmpty, type TextField } from '@sitecore-content-sdk/content/layout';
import { EditableFieldProps } from '../sharedTypes';
import { wrapWithFieldMetadata } from './FieldMetadata';
import { DefaultEmptyFieldEditingComponentText } from './DefaultEmptyFieldEditingComponents';

/**
 * Props for the Text field component.
 * @public
 */
export interface TextProps extends EditableFieldProps {
  /** The text field data. */
  field?: TextField;
  /**
   * The HTML element that will wrap the contents of the field.
   * @default span
   */
  tag?: string;
  /**
   * If false, HTML-encoding of the field value is disabled and the value is rendered as-is.
   * @default true
   */
  encode?: boolean;
  /** Optional CSS class for the wrapper element. */
  class?: string;
}

const renderTaggedContent = (
  tag: string,
  className: string | undefined,
  encode: boolean,
  value: string | number
): JSXOutput => {
  const html = String(value).split('\n').join('<br />');
  const parts = String(value).split('\n');
  const children = encode
    ? parts.map((part, index) => (
        <>
          {part}
          {index < parts.length - 1 ? <br /> : null}
        </>
      ))
    : null;

  switch (tag) {
    case 'h1':
      return encode ? (
        <h1 class={className}>{children}</h1>
      ) : (
        <h1 class={className} dangerouslySetInnerHTML={html} />
      );
    case 'h2':
      return encode ? (
        <h2 class={className}>{children}</h2>
      ) : (
        <h2 class={className} dangerouslySetInnerHTML={html} />
      );
    case 'h3':
      return encode ? (
        <h3 class={className}>{children}</h3>
      ) : (
        <h3 class={className} dangerouslySetInnerHTML={html} />
      );
    case 'h4':
      return encode ? (
        <h4 class={className}>{children}</h4>
      ) : (
        <h4 class={className} dangerouslySetInnerHTML={html} />
      );
    case 'h5':
      return encode ? (
        <h5 class={className}>{children}</h5>
      ) : (
        <h5 class={className} dangerouslySetInnerHTML={html} />
      );
    case 'h6':
      return encode ? (
        <h6 class={className}>{children}</h6>
      ) : (
        <h6 class={className} dangerouslySetInnerHTML={html} />
      );
    case 'p':
      return encode ? (
        <p class={className}>{children}</p>
      ) : (
        <p class={className} dangerouslySetInnerHTML={html} />
      );
    case 'div':
      return encode ? (
        <div class={className}>{children}</div>
      ) : (
        <div class={className} dangerouslySetInnerHTML={html} />
      );
    case 'span':
    default:
      return encode ? (
        <span class={className}>{children}</span>
      ) : (
        <span class={className} dangerouslySetInnerHTML={html} />
      );
  }
};

/**
 * Renders a Sitecore text field.
 * @public
 */
export const Text = component$<TextProps>((props) => {
  const { field, tag = 'span', encode = true, class: className } = props;
  let editable = props.editable !== false;
  const metadata = field?.metadata;

  if (metadata && editable && isFieldValueEmpty(field)) {
    return (
      <>
        {wrapWithFieldMetadata({
          metadata,
          editable,
          children: <DefaultEmptyFieldEditingComponentText />,
        })}
      </>
    );
  }

  if (isFieldValueEmpty(field)) {
    return null;
  }

  if (!encode) {
    editable = false;
  }

  const value = field?.value ?? '';
  const content = renderTaggedContent(tag, className, encode, value);

  return <>{wrapWithFieldMetadata({ metadata, editable, children: content })}</>;
});
