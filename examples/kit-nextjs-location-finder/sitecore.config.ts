import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
/**
 * @type {import('@sitecore-content-sdk/nextjs/config').SitecoreConfig}
 * See the documentation for `defineConfig`:
 * https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 */
export default defineConfig({api: {
    edge: {
      edgeUrl: 'https://edge-platform-staging.sitecore-staging.cloud',
      contextId: '7DOJRy6n5qwzOUnIcV3Kpe'
    },
  },});
