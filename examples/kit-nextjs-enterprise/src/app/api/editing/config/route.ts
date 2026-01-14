import { EditingConfigMiddleware } from '@sitecore-content-sdk/nextjs/editing';
import componentMap from '.sitecore/component-map';

/**
 * API route for editing configuration requests from Sitecore Pages
 */
const handler = new EditingConfigMiddleware({ components: componentMap }).getHandler();

export const GET = handler;
