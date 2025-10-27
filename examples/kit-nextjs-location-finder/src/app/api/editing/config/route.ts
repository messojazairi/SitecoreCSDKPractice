import { createEditingConfigRouteHandler } from '@sitecore-content-sdk/nextjs/route-handler';
import components from '.sitecore/component-map';
import metadata from '.sitecore/metadata.json';

/**
 * This API route is used by Sitecore Editor in XM Cloud
 * to provide editing configuration.
 */

export const { GET } = createEditingConfigRouteHandler({
  components,
  metadata,
});
