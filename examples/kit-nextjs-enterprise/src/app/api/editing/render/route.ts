import { EditingRenderMiddleware } from '@sitecore-content-sdk/nextjs/editing';

/**
 * API route for editing render requests from Sitecore Pages
 */
const handler = new EditingRenderMiddleware().getHandler();

export const GET = handler;
export const POST = handler;
