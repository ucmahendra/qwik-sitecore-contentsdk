import { component$, Slot } from '@builder.io/qwik';
import {
  FieldMetadata,
  isFieldValueEmpty,
  type LinkField,
  type LinkFieldValue,
} from '@sitecore-content-sdk/content/layout';
import { EditableFieldProps } from '../sharedTypes';
import { wrapWithFieldMetadata } from './FieldMetadata';
import { DefaultEmptyFieldEditingComponentText } from './DefaultEmptyFieldEditingComponents';

/**
 * Props for the Link field component.
 * @public
 */
export interface LinkProps extends EditableFieldProps {
  /** The link field data. */
  field: (LinkField | LinkFieldValue) & FieldMetadata;
  /**
   * Displays link text even when children (Slot) are present.
   */
  showLinkTextWithChildrenPresent?: boolean;
  /**
   * Renders an empty anchor with children when the link field is empty.
   * @default false
   */
  renderChildrenWhenEmpty?: boolean;
  class?: string;
  title?: string;
  target?: string;
  rel?: string;
}

/**
 * Renders a Sitecore link field.
 * @public
 */
export const Link = component$<LinkProps>((props) => {
  const {
    field,
    showLinkTextWithChildrenPresent,
    renderChildrenWhenEmpty,
    editable = true,
    class: className,
    title,
    target,
    rel,
  } = props;
  const metadata = field?.metadata;

  if (metadata && editable && isFieldValueEmpty(field) && !renderChildrenWhenEmpty) {
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

  const dynamicField: LinkField | LinkFieldValue = field;
  const isEmptyField = isFieldValueEmpty(dynamicField);

  const link = !isEmptyField
    ? (dynamicField as LinkFieldValue).href
      ? (field as LinkFieldValue)
      : (dynamicField as LinkField).value
    : undefined;

  if (isEmptyField || !link) {
    if (!renderChildrenWhenEmpty) {
      return null;
    }
    return (
      <a class={className} title={title} target={target} rel={rel}>
        <Slot />
      </a>
    );
  }

  const anchor = link.linktype !== 'anchor' && link.anchor ? `#${link.anchor}` : '';
  const querystring = link.querystring ? `?${link.querystring}` : '';
  const href = `${link.href}${querystring}${anchor}`;
  const resolvedTarget = target ?? (typeof link.target === 'string' ? link.target : undefined);
  let resolvedRel = rel ?? (typeof link.rel === 'string' ? link.rel : undefined);
  if (resolvedTarget === '_blank' && !resolvedRel) {
    resolvedRel = 'noopener noreferrer';
  }

  const linkText = showLinkTextWithChildrenPresent
    ? String(link.text || link.href || '')
    : String(link.text || link.href || '');

  const resolvedClass =
    className ?? (typeof link.class === 'string' ? link.class : undefined) ?? undefined;
  const resolvedTitle =
    title ?? (typeof link.title === 'string' ? link.title : undefined) ?? undefined;

  return (
    <>
      {wrapWithFieldMetadata({
        metadata,
        editable,
        children: (
          <a
            href={href}
            class={resolvedClass}
            title={resolvedTitle}
            target={resolvedTarget}
            rel={resolvedRel}
          >
            {linkText}
            <Slot />
          </a>
        ),
      })}
    </>
  );
});
