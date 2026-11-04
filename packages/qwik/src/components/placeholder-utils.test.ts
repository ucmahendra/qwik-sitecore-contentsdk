import { expect } from 'chai';
import { getPlaceholderRenderings, getSXAParams } from './placeholder-utils';
import type { RouteData } from '@sitecore-content-sdk/content/layout';

describe('placeholder-utils', () => {
  it('getPlaceholderRenderings returns components for a known placeholder', () => {
    const rendering = {
      name: 'home',
      displayName: 'Home',
      fields: {},
      placeholders: {
        'headless-main': [
          {
            uid: '1',
            componentName: 'ContentBlock',
            dataSource: '',
            fields: {},
          },
        ],
      },
    } as RouteData;

    const result = getPlaceholderRenderings(rendering, 'headless-main', false);
    expect(result).to.have.length(1);
    expect(result[0].componentName).to.equal('ContentBlock');
  });

  it('getSXAParams combines GridParameters and Styles', () => {
    const params = getSXAParams({
      uid: '1',
      componentName: 'ContentBlock',
      dataSource: '',
      params: {
        GridParameters: 'col-12',
        Styles: 'highlight',
      },
    });

    expect(params?.styles).to.equal('col-12 highlight');
  });
});
