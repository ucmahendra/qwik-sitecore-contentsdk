import { ContentBlock } from '../components/content-block';
import { Container } from '../components/container';
import { ColumnSplitter } from '../components/column-splitter';
import { RowSplitter } from '../components/row-splitter';
import * as Title from '../components/title';
import type { ComponentMap } from '@sitecore-content-sdk/qwik';

/**
 * Manual component map for the MVP (CLI map generation not wired yet).
 * Register Sitecore rendering names to Qwik components here.
 * Components that host nested placeholders must render `<Placeholder />`.
 */
export const componentMap: ComponentMap = new Map([
  ['ContentBlock', ContentBlock],
  ['Container', Container],
  ['ColumnSplitter', ColumnSplitter],
  ['RowSplitter', RowSplitter],
  ['Title', Title],
]);

export default componentMap;
