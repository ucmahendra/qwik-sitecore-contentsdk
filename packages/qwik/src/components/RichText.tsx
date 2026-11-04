import { component$ } from '@builder.io/qwik';
import { isFieldValueEmpty, type RichTextField } from '@sitecore-content-sdk/content/layout';
import { EditableFieldProps } from '../sharedTypes';
import { wrapWithFieldMetadata } from './FieldMetadata';
import { DefaultEmptyFieldEditingComponentText } from './DefaultEmptyFieldEditingComponents';

/**
 * Props for the RichText field component.
 * @public
 */
export interface RichTextProps extends EditableFieldProps {
  /** The rich text field data. */
  field?: RichTextField;
  /**
   * The HTML element that will wrap the contents of the field.
   * @default div
   */
  tag?: string;
  class?: string;
}

/**
 * Renders a Sitecore rich text field.
 * @public
 */
export const RichText = component$<RichTextProps>((props) => {
  const { field, tag = 'div', class: className, editable = true } = props;
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

  const html = field?.value || '';
  const content =
    tag === 'span' ? (
      <span class={className} dangerouslySetInnerHTML={html} />
    ) : (
      <div class={className} dangerouslySetInnerHTML={html} />
    );

  return <>{wrapWithFieldMetadata({ metadata, editable, children: content })}</>;
});
