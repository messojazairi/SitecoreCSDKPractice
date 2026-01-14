'use client';

import { JSX, useEffect } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import * as FEAAS from '@sitecore-feaas/clientside/react';

/**
 * Client-side BYOC component registration
 */
export default function BYOCClientComponents(): JSX.Element | null {
  const { page, api } = useSitecore();
  const { context } = page.layout.sitecore;

  useEffect(() => {
    // Register BYOC components for client-side rendering
    FEAAS.enableNextClientsideComponents({
      sitecoreEdgeUrl: api.edge?.contextId ? `https://edge.sitecorecloud.io` : '',
      sitecoreEdgeContextId: api.edge?.contextId || '',
      pageState: page.mode.isEditing ? 'edit' : page.mode.isPreview ? 'preview' : 'normal',
      siteName: context?.site?.name || '',
    });
  }, [api.edge?.contextId, context?.site?.name, page.mode.isEditing, page.mode.isPreview]);

  return null;
}
