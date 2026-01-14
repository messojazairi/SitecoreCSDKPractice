import { type NextRequest, type NextFetchEvent } from 'next/server';
import {
  defineMiddleware,
  AppRouterMultisiteMiddleware,
  PersonalizeMiddleware,
  RedirectsMiddleware,
  LocaleMiddleware,
} from '@sitecore-content-sdk/nextjs/middleware';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import { routing } from './i18n/routing';

const locale = new LocaleMiddleware({
  sites,
  locales: routing.locales.slice(),
  skip: () => false,
});

const multisite = new AppRouterMultisiteMiddleware({
  sites,
  ...scConfig.api.edge,
  ...scConfig.multisite,
  skip: () => false,
});

const redirects = new RedirectsMiddleware({
  sites,
  ...scConfig.api.edge,
  ...scConfig.redirects,
  skip: () => false,
});

const personalize = new PersonalizeMiddleware({
  sites,
  ...scConfig.api.edge,
  ...scConfig.personalize,
  skip: () => false,
});

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  return defineMiddleware(locale, multisite, redirects, personalize).exec(req, ev);
}

export const config = {
  matcher: [
    '/',
    '/((?!api/|sitemap|robots|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg).*)',
  ],
};
