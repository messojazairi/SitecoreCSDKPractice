import { buildSearchResultHref } from '../../components/site-three/non-sitecore/searchBoxUtils';

describe('buildSearchResultHref', () => {
  it('keeps relative paths relative (SSR/client parity)', () => {
    expect(buildSearchResultHref('/', '')).toBe('/');
    expect(buildSearchResultHref('/search', '')).toBe('/search');
  });

  it('adds q for relative paths', () => {
    expect(buildSearchResultHref('/search', 'shoes')).toBe('/search?q=shoes');
  });

  it('merges q with existing query on relative path', () => {
    expect(buildSearchResultHref('/search?lang=en', 'x')).toBe('/search?lang=en&q=x');
  });

  it('updates absolute http(s) URLs', () => {
    expect(buildSearchResultHref('https://example.com/path', 'q')).toBe('https://example.com/path?q=q');
  });

  it('handles protocol-relative URLs', () => {
    expect(buildSearchResultHref('//cdn.example.com/s', 'a')).toBe('//cdn.example.com/s?q=a');
  });
});
