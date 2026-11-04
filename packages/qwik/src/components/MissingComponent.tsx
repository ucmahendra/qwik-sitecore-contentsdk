import { component$ } from '@builder.io/qwik';

export interface MissingComponentProps {
  rendering?: {
    componentName?: string;
  };
  errorOverride?: string;
}

/**
 * Fallback component when a rendering is not found in the component map.
 * @public
 */
export const MissingComponent = component$<MissingComponentProps>((props) => {
  const componentName = props.rendering?.componentName || 'Unnamed Component';
  const errorMessage =
    props.errorOverride ||
    'Content SDK component is missing Qwik implementation. See the developer console for more information.';

  if (!props.errorOverride) {
    console.log(`Component props for unimplemented '${componentName}' component`, props);
  }

  return (
    <div
      style={{
        background: 'darkorange',
        outline: '5px solid orange',
        padding: '10px',
        color: 'white',
        maxWidth: '500px',
      }}
    >
      <h2>{componentName}</h2>
      <p>{errorMessage}</p>
    </div>
  );
});
