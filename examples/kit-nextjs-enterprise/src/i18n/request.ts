import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import client from 'src/lib/sitecore-client';

export default getRequestConfig(async ({ requestLocale }) => {
  // Extract site and locale from the combined string (e.g., "siteName_en")
  const localeString = await requestLocale;
  const [site, locale] = localeString?.split('_') || ['', routing.defaultLocale];

  // Validate locale
  const validLocale = routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale;

  // Fetch dictionary from Sitecore
  let messages = {};
  try {
    const dictionary = await client.getDictionary(site, validLocale);
    messages = dictionary || {};
  } catch (error) {
    console.error('Failed to fetch dictionary:', error);
  }

  return {
    locale: validLocale,
    messages,
  };
});
