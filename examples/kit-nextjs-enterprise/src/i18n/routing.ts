import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'en-CA'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
