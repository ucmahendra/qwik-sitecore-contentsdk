import { component$ } from '@builder.io/qwik';
import { Text, RichText, type ComponentProps } from '@sitecore-content-sdk/qwik';
import type { RichTextField, TextField } from '@sitecore-content-sdk/qwik';

/**
 * Sample ContentBlock component using Text and RichText field helpers.
 */
export const ContentBlock = component$<ComponentProps>((props) => {
  const fields = props.fields || {};
  const heading = (fields.heading ?? fields.Heading) as TextField | undefined;
  const content = (fields.content ?? fields.Content) as RichTextField | undefined;

  return (
    <div class="contentBlock">
      <h2 class="contentTitle">
        <Text field={heading} />
      </h2>
      <div class="contentDescription">
        <RichText field={content} />
      </div>
    </div>
  );
});

export default ContentBlock;
