'use client';
import React from 'react';
import {
  ComponentPropsCollection,
  ComponentPropsContext,
  Page,
  SitecoreProvider,
} from '@sitecore-content-sdk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import scConfig from 'sitecore.config';
import components from '.sitecore/component-map.client';

export default function Providers({
  children,
  page,
  componentProps = {},
  locale,
  messages,
}: {
  children: React.ReactNode;
  page: Page;
  componentProps?: ComponentPropsCollection;
  locale?: string;
  messages?: Record<string, string>;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={() => {
        // Suppress missing translation errors
      }}
      getMessageFallback={() => {
        // Return empty string so || fallback works in components
        return '';
      }}
    >
      <SitecoreProvider api={scConfig.api} componentMap={components} page={page}>
        <ComponentPropsContext value={componentProps}>{children}</ComponentPropsContext>
      </SitecoreProvider>
    </NextIntlClientProvider>
  );
}
