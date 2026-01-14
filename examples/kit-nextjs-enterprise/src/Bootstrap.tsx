'use client';

import { useEffect } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { init as initCloudSDK } from '@sitecore-cloudsdk/core/browser';
import { pageView } from '@sitecore-cloudsdk/events/browser';

/**
 * Initializes the Sitecore Cloud SDK and tracks page views
 */
export default function Bootstrap(): null {
  const { page, api } = useSitecore();
  const { route, context } = page.layout.sitecore;

  useEffect(() => {
    const initAndPageView = async () => {
      // Skip initialization if in editing mode
      if (page.mode.isEditing) return;

      const siteName = context?.site?.name || '';
      const language = context?.language || 'en';
      const pointOfSale = context?.site?.pointOfSale || siteName;

      try {
        await initCloudSDK({
          sitecoreEdgeContextId: api.edge?.contextId || '',
          siteName,
          language,
          enableBrowserCookie: true,
        });

        await pageView({
          channel: 'WEB',
          currency: 'USD',
          page: route?.name || 'unknown',
          pageVariantId: route?.itemId || '',
          language,
          pointOfSale,
        });
      } catch (error) {
        console.error('Failed to initialize Cloud SDK:', error);
      }
    };

    initAndPageView();
  }, [api.edge?.contextId, context, page.mode.isEditing, route]);

  return null;
}
