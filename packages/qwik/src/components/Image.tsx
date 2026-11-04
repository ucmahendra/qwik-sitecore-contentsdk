import { component$ } from '@builder.io/qwik';
import { mediaApi } from '@sitecore-content-sdk/content/media';
import {
  FieldMetadata,
  isFieldValueEmpty,
  type ImageField,
  type ImageFieldValue,
  type ImageSizeParameters,
} from '@sitecore-content-sdk/content/layout';
import { EditableFieldProps } from '../sharedTypes';
import { wrapWithFieldMetadata } from './FieldMetadata';
import { DefaultEmptyFieldEditingComponentImage } from './DefaultEmptyFieldEditingComponents';

/**
 * Props for the Image field component.
 * @public
 */
export interface ImageProps extends EditableFieldProps {
  /** Image field data */
  field?: (ImageField | ImageFieldValue) & FieldMetadata;
  /**
   * Parameters that will be attached to Sitecore media URLs
   */
  imageParams?: {
    [paramName: string]: string | number;
  };
  srcSet?: ImageSizeParameters[];
  /**
   * Custom regexp that finds media URL prefix replaced by `/-/jssmedia` or `/~/jssmedia`.
   */
  mediaUrlPrefix?: RegExp;
  /** Optional CSS class for the img element. */
  class?: string;
  /** Optional alt text override. */
  alt?: string;
}

/**
 * Renders a Sitecore image field.
 * @public
 */
export const Image = component$<ImageProps>((props) => {
  const {
    field,
    imageParams,
    mediaUrlPrefix,
    srcSet,
    class: className,
    alt,
    editable = true,
  } = props;
  const metadata = field?.metadata;

  if (metadata && editable && isFieldValueEmpty(field)) {
    return (
      <>
        {wrapWithFieldMetadata({
          metadata,
          editable,
          children: <DefaultEmptyFieldEditingComponentImage />,
        })}
      </>
    );
  }

  if (isFieldValueEmpty(field)) {
    return null;
  }

  const dynamicMedia = field as ImageField | ImageFieldValue;
  const img = (dynamicMedia as ImageFieldValue).src
    ? (field as ImageFieldValue)
    : ((dynamicMedia as ImageField).value as ImageFieldValue);

  if (!img?.src) {
    return null;
  }

  const resolvedSrc = mediaApi.updateImageUrl(String(img.src), imageParams, mediaUrlPrefix);
  const width =
    typeof img.width === 'number' || typeof img.width === 'string' ? img.width : undefined;
  const height =
    typeof img.height === 'number' || typeof img.height === 'string'
      ? Number(img.height)
      : undefined;
  const resolvedAlt = alt ?? (typeof img.alt === 'string' ? img.alt : '') ?? '';
  const resolvedClass =
    className || (typeof img.class === 'string' ? img.class : undefined) || undefined;

  const imgElement = (
    <img
      src={resolvedSrc}
      alt={resolvedAlt}
      class={resolvedClass}
      width={typeof width === 'string' ? Number(width) || undefined : width}
      height={height}
      srcset={
        srcSet
          ? mediaApi.getSrcSet(resolvedSrc, srcSet, imageParams, mediaUrlPrefix)
          : undefined
      }
    />
  );

  return <>{wrapWithFieldMetadata({ metadata, editable, children: imgElement })}</>;
});
