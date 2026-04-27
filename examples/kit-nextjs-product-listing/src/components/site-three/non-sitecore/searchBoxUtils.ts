/**
 * Builds the search-results href with optional `q`, without `window`.
 * Relative Sitecore hrefs stay relative so SSR and client markup match.
 */
export function buildSearchResultHref(searchBaseHref: string, searchTerm: string): string {
  const q = searchTerm.trim();
  const isHttp = /^https?:\/\//i.test(searchBaseHref);
  const isProtocolRelative = searchBaseHref.startsWith('//');

  if (isHttp) {
    const url = new URL(searchBaseHref);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    return url.toString();
  }

  if (isProtocolRelative) {
    const url = new URL(`https:${searchBaseHref}`);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    return `//${url.host}${url.pathname}${url.search}${url.hash}`;
  }

  const hashIndex = searchBaseHref.indexOf('#');
  const beforeHash = hashIndex === -1 ? searchBaseHref : searchBaseHref.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : searchBaseHref.slice(hashIndex);

  const qIndex = beforeHash.indexOf('?');
  const path = qIndex === -1 ? beforeHash : beforeHash.slice(0, qIndex);
  const existingQuery = qIndex === -1 ? '' : beforeHash.slice(qIndex + 1);

  const params = new URLSearchParams(existingQuery);
  if (q) params.set('q', q);
  else params.delete('q');
  const qs = params.toString() ? `?${params.toString()}` : '';
  return `${path}${qs}${hash}`;
}
