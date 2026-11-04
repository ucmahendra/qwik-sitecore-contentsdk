import { expect } from 'chai';
import {
  buildPreviewData,
  defaultResolvePageUrl,
  flattenQuery,
  resolveAllowedQueryParams,
  resolveConfiguredEditingSecret,
} from './utils';

describe('editing utils', () => {
  it('buildPreviewData maps sc_* query params', () => {
    const data = buildPreviewData({
      sc_site: 'site',
      sc_itemid: 'item',
      sc_lang: 'en',
      mode: 'edit',
      route: '/about',
      sc_variant: 'variant-a',
    });

    expect(data.site).to.equal('site');
    expect(data.itemId).to.equal('item');
    expect(data.language).to.equal('en');
    expect(data.mode).to.equal('edit');
    expect(data.variantId).to.equal('variant-a');
  });

  it('defaultResolvePageUrl normalizes paths', () => {
    expect(defaultResolvePageUrl('')).to.equal('/');
    expect(defaultResolvePageUrl('/')).to.equal('/');
    expect(defaultResolvePageUrl('about')).to.equal('/about');
    expect(defaultResolvePageUrl('/about')).to.equal('/about');
  });

  it('flattenQuery reads URLSearchParams', () => {
    const params = new URLSearchParams('sc_site=a&secret=b');
    expect(flattenQuery(params)).to.deep.equal({ sc_site: 'a', secret: 'b' });
  });

  it('resolveAllowedQueryParams reports missing required params', () => {
    const result = resolveAllowedQueryParams(
      { foo: '1' },
      [{ name: 'token', required: true }, 'optional']
    );
    expect(result.missingAllowedParams).to.deep.equal(['token']);
    expect(result.allowedQueryParams).to.deep.equal({});
  });

  it('resolveConfiguredEditingSecret trims values', () => {
    expect(resolveConfiguredEditingSecret('  abc  ')).to.equal('abc');
    expect(resolveConfiguredEditingSecret('')).to.equal(undefined);
  });
});
