'use client';

import { useEffect } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { pageView } from '@sitecore-cloudsdk/events/browser';

/**
 * Tracks CDP page views for analytics
 */
export default function CdpPageView(): null {
  const { page } = useSitecore();
  const { route, context } = page.layout.sitecore;

  useEffect(() => {
    if (page.mode.isEditing) return;

    const trackPageView = async () => {
      try {
        await pageView({
          channel: 'WEB',
          currency: 'USD',
          page: route?.name || 'unknown',
          pageVariantId: route?.itemId || '',
          language: context?.language || 'en',
          pointOfSale: context?.site?.pointOfSale || context?.site?.name || '',
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [context, page.mode.isEditing, route]);

  return null;
}
