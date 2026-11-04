import { component$ } from '@builder.io/qwik';

/**
 * Renders a placeholder for hidden Sitecore renderings.
 * @public
 */
export const HiddenRendering = component$(() => {
  return (
    <div
      style={{
        backgroundSize: '3px 3px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px',
        color: '#aaa',
        backgroundImage:
          'linear-gradient(45deg, #ffffff 25%, #dcdcdc 25%, #dcdcdc 50%, #ffffff 50%, #ffffff 75%, #dcdcdc 75%, #dcdcdc 100%)',
      }}
    >
      The component is hidden
    </div>
  );
});
