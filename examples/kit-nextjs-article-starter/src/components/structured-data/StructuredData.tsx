'use client';

import React from 'react';
import { Page } from '@sitecore-content-sdk/nextjs';

interface StructuredDataProps {
  data: Record<string, unknown>;
  page?: Page;
}

/**
 * Component to render JSON-LD structured data
 * @param data - The structured data object to render as JSON-LD
 */
export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
