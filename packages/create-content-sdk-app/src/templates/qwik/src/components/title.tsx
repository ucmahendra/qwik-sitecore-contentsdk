import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import {
  Text,
  useSitecore,
  type ComponentProps,
  type Field,
  type TextField,
} from '@sitecore-content-sdk/qwik';

/**
 * GraphQL Integrated GraphQL datasource / contextItem shape used by Title.
 */
interface TitleFieldsData {
  data?: {
    datasource?: {
      url?: {
        path?: string;
        siteName?: string;
      };
      field?: {
        jsonValue?: Field<string>;
      };
    };
    contextItem?: {
      url?: {
        path?: string;
        siteName?: string;
      };
      field?: {
        jsonValue?: Field<string>;
      };
    };
  };
}

/**
 * Maps Sitecore FontSize rendering param to a CSS class.
 * @param {string | undefined} fontSize Font size token from rendering params
 * @returns {string} CSS class name
 */
export function getFontSizeClass(fontSize?: string): string {
  if (!fontSize) {
    return '';
  }
  return `title-font-${fontSize.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Title component (SXA-style) with datasource/contextItem GraphQL fields.
 * Mirrors the Next.js Title Default variant for Qwik.
 */
export const Default = component$<ComponentProps>((props) => {
  const { page } = useSitecore();
  const { rendering, params, fields } = props;
  const titleFields = fields as TitleFieldsData | undefined;

  const dataSourcePath = rendering?.dataSource;
  const datasource = dataSourcePath
    ? titleFields?.data?.datasource
    : titleFields?.data?.contextItem;

  const mode = page?.mode;
  const HtmlTag = params?.HtmlTag || 'h1';
  const FontSize = params?.FontSize;
  const styles = params?.styles || params?.Styles || '';

  const datasourceField = datasource?.field?.jsonValue as TextField | undefined;
  const contextField = page?.layout?.sitecore?.route?.fields?.pageTitle as TextField | undefined;
  const baseTitleField = datasourceField || contextField;

  const isEditingMode = Boolean(mode && !mode.isNormal);
  const titleField: TextField | undefined =
    isEditingMode && !baseTitleField?.value
      ? { ...(baseTitleField ?? { value: '' }), value: 'Title field' }
      : baseTitleField;

  const href =
    isEditingMode && !baseTitleField?.value
      ? '#'
      : datasource?.url?.path
        ? `${datasource.url.path}${
            isEditingMode && datasource?.url?.siteName
              ? `?sc_site=${datasource.url.siteName}`
              : ''
          }`
        : undefined;

  const titleText = (
    <Text field={titleField} tag={HtmlTag} class={getFontSizeClass(FontSize)} />
  );

  return (
    <div class={`component title ${styles}`.trim()}>
      <div class="title-centered">
        {mode?.isEditing ? (
          titleText
        ) : href ? (
          <Link href={href} prefetch={false}>
            {titleText}
          </Link>
        ) : (
          titleText
        )}
      </div>
    </div>
  );
});

export default Default;
