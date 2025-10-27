import React, { type JSX } from 'react';
import { Field, ImageField, Page } from '@sitecore-content-sdk/nextjs';
import Scripts from 'src/Scripts';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/theme-provider/theme-provider.dev';
import { VideoProvider } from './contexts/VideoContext';
import { Sora, Roboto } from 'next/font/google';
import SitecoreStyles from 'components/content-sdk/SitecoreStyles';
import { DesignLibraryLayout } from './DesignLibraryLayout';
import componentMap from '.sitecore/component-map';
import AppPlaceholder from 'components/content-sdk/Placeholder';

const heading = Sora({
  weight: ['300', '400', '500'],
  variable: '--font-heading',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const body = Roboto({
  weight: ['400', '500'],
  variable: '--font-body',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

interface LayoutProps {
  page: Page;
}

export interface RouteFields {
  [key: string]: unknown;
  metadataTitle?: Field;
  metadataKeywords?: Field;
  pageTitle?: Field;
  metadataDescription?: Field;
  pageSummary?: Field;
  ogTitle?: Field;
  ogDescription?: Field;
  ogImage?: ImageField;
  thumbnailImage?: ImageField;
  Title?: Field;
}

const Layout = ({ page }: LayoutProps): JSX.Element => {
  const { layout, mode } = page;
  const { route } = layout.sitecore;
  const mainClassPageEditing =  mode.isEditing ? 'editing-mode' : 'prod-mode';
  const classNamesMain = `${mainClassPageEditing} ${body.variable} ${heading.variable} main-layout`;

  return (
    <>
      <Scripts />
      <SitecoreStyles layoutData={layout} />
      <VideoProvider>
        {/* root placeholder for the app, which we add components to using route data */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className={`min-h-screen flex flex-col ${classNamesMain}`}>
            {page.mode.isDesignLibrary ? (
              <DesignLibraryLayout />
            ) : (
              <>
                <header>
                  <div id="header">
                    {route && (
                      <AppPlaceholder
                        page={page}
                        componentMap={componentMap}
                        name="headless-header"
                        rendering={route}
                      />
                    )}
                  </div>
                </header>
                <main>
                  <div id="content">
                    {route && (
                      <AppPlaceholder
                        page={page}
                        componentMap={componentMap}
                        name="headless-main"
                        rendering={route}
                      />
                    )}
                  </div>
                </main>
                <footer>
                  <div id="footer">
                    {route && (
                      <AppPlaceholder
                        page={page}
                        componentMap={componentMap}
                        name="headless-footer"
                        rendering={route}
                      />
                    )}
                  </div>
                </footer>
              </>
            )}
          </div>
        </ThemeProvider>
      </VideoProvider>
      <SpeedInsights />
    </>
  );
};

export default Layout;
