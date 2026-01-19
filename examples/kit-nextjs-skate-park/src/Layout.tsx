import React, { JSX } from "react";
import { Field, ImageField, Page } from "@sitecore-content-sdk/nextjs";
import Head from "next/head";
import Scripts from "src/Scripts";
import SitecoreStyles from "components/content-sdk/SitecoreStyles";
import { DesignLibraryApp } from "@sitecore-content-sdk/nextjs";
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";

interface LayoutProps {
  page: Page;
}

export interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
  metadataTitle?: Field;
  metadataKeywords?: Field;
  pageTitle?: Field;
  metadataDescription?: Field;
  pageSummary?: Field;
  ogTitle?: Field;
  ogDescription?: Field;
  ogImage?: ImageField;
  ogType?: Field;
  thumbnailImage?: ImageField;
  twitterCard?: Field;
  twitterSite?: Field;
}

const Layout = ({ page }: LayoutProps): JSX.Element => {
  const { layout, mode, siteName } = page;
  const { route } = layout.sitecore;
  const fields = route?.fields as RouteFields;
  const mainClassPageEditing = mode.isEditing ? "editing-mode" : "prod-mode";

  // Basic metadata
  const metaTitle =
    fields?.metadataTitle?.value?.toString() ||
    fields?.pageTitle?.value?.toString() ||
    fields?.Title?.value?.toString() ||
    "Page";
  const metaDescription =
    fields?.metadataDescription?.value?.toString() ||
    fields?.pageSummary?.value?.toString() ||
    "";
  const metaKeywords = fields?.metadataKeywords?.value?.toString() || "";

  // OpenGraph metadata
  const ogTitle =
    fields?.ogTitle?.value?.toString() ||
    fields?.metadataTitle?.value?.toString() ||
    fields?.pageTitle?.value?.toString() ||
    fields?.Title?.value?.toString() ||
    "Page";
  const ogDescription =
    fields?.ogDescription?.value?.toString() ||
    fields?.metadataDescription?.value?.toString() ||
    fields?.pageSummary?.value?.toString() ||
    "";
  const ogImage =
    fields?.ogImage?.value?.src || fields?.thumbnailImage?.value?.src || "";
  const ogType = fields?.ogType?.value?.toString() || "website";

  // Twitter Card metadata (falls back to OG values for consistency)
  const twitterCard = fields?.twitterCard?.value?.toString() || "summary_large_image";
  const twitterSite = fields?.twitterSite?.value?.toString() || "";

  return (
    <>
      <Scripts />
      <SitecoreStyles layoutData={layout} />
      <Head>
        <link rel="preconnect" href="https://edge-platform.sitecorecloud.io" />
        <title>{metaTitle}</title>
        {metaDescription && (
          <meta name="description" content={metaDescription} />
        )}
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        <link rel="icon" href="/favicon.ico" />

        {/* OpenGraph tags for social sharing and AI/GEO */}
        {ogTitle && <meta property="og:title" content={ogTitle} />}
        {ogDescription && (
          <meta property="og:description" content={ogDescription} />
        )}
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content={ogType} />
        {siteName && <meta property="og:site_name" content={siteName} />}

        {/* Twitter Card tags for rich previews */}
        <meta name="twitter:card" content={twitterCard} />
        {twitterSite && <meta name="twitter:site" content={twitterSite} />}
        {ogTitle && <meta name="twitter:title" content={ogTitle} />}
        {ogDescription && (
          <meta name="twitter:description" content={ogDescription} />
        )}
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Head>
      {/* root placeholder for the app, which we add components to using route data */}
      <div className={mainClassPageEditing}>
        {mode.isDesignLibrary ? (
          route && (
            <DesignLibraryApp
              page={page}
              rendering={route}
              componentMap={componentMap}
              loadServerImportMap={() => import(".sitecore/import-map.server")}
            />
          )
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
    </>
  );
};

export default Layout;
