import { Component } from '@builder.io/qwik';
import { ComponentRendering, Field, Item } from '@sitecore-content-sdk/content/layout';

/**
 * Shared editing field props for Qwik field components.
 * @public
 */
export interface EditableFieldProps {
  /**
   * Can be used to explicitly disable inline editing.
   * @default true
   */
  editable?: boolean;
}

/**
 * Default export name used by SXA rendering variants.
 * @public
 */
export const DEFAULT_EXPORT_NAME = 'Default';

/**
 * Props passed from Placeholder to registered components.
 * @public
 */
export interface ComponentProps {
  rendering: ComponentRendering;
  fields?: {
    [name: string]: Field | Item | Item[];
  };
  params?: {
    [name: string]: string | undefined;
  };
}

/**
 * A Qwik Content SDK component (or module with named/default exports).
 * @public
 */
export type QwikContentSdkComponent =
  | Component<ComponentProps>
  | {
      [key: string]: unknown;
      Default?: Component<ComponentProps>;
      default?: Component<ComponentProps>;
    };

/**
 * Component map used by Placeholder to resolve Sitecore renderings.
 * @public
 */
export type ComponentMap = Map<string, QwikContentSdkComponent>;
