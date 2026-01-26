'use client';

import React from 'react';
import { Page } from '@sitecore-content-sdk/nextjs';

interface StructuredDataProps {
  data: Record<string, unknown>;
  page?: Page;
  id?: string;
}

/**
 * Safely serializes JSON-LD for embedding in a <script type="application/ld+json" /> tag.
 * Replaces `<` to avoid ending the script tag early (e.g. `</script>` injection).
 */
const toJsonLdString = (value: unknown): string => {
  return JSON.stringify(value).replace(/</g, '\\u003c');
};

/**
 * Component to render JSON-LD structured data with XSS protection
 * @param data - The structured data object to render as JSON-LD
 * @param id - Optional unique identifier for the script tag (prevents duplicates)
 */
export const StructuredData: React.FC<StructuredDataProps> = ({ data, id }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const scriptProps: {
    type: string;
    dangerouslySetInnerHTML: { __html: string };
    id?: string;
  } = {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: toJsonLdString(data) },
  };

  if (id) {
    scriptProps.id = id;
  }

  return <script {...scriptProps} />;
};
