import { SitemapMiddleware } from '@sitecore-content-sdk/nextjs/middleware';
import scConfig from 'sitecore.config';

/**
 * API route for sitemap.xml generation
 */
const handler = new SitemapMiddleware({
  ...scConfig.api.edge,
}).getHandler();

export const GET = handler;
