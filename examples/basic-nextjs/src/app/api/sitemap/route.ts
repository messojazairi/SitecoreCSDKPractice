import { createSitemapRouteHandler } from '@sitecore-content-sdk/nextjs/route-handler';
import sites from '.sitecore/sites.json';
import client from 'lib/sitecore-client';

/**
 * API route for serving sitemap.xml
 *
 * This Next.js API route handler generates and returns the sitemap.xml content dynamically
 * based on the resolved site name. It is commonly used by search engines to discover
 * and index pages on the website.
 */

export const { GET } = createSitemapRouteHandler({
  client,
  sites,
});
