import { RobotsMiddleware } from '@sitecore-content-sdk/nextjs/middleware';
import scConfig from 'sitecore.config';

/**
 * API route for robots.txt generation
 */
const handler = new RobotsMiddleware({
  ...scConfig.api.edge,
}).getHandler();

export const GET = handler;
