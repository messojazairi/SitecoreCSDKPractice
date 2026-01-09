import React, { JSX } from "react";
import { Field, Page } from "@sitecore-content-sdk/nextjs";
import Scripts from "src/Scripts";
import SitecoreStyles from "components/content-sdk/SitecoreStyles";
import { DesignLibraryApp } from "@sitecore-content-sdk/nextjs";
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import componentMap from ".sitecore/component-map";
import { generateWebSiteSchema, generateOrganizationSchema, renderJsonLdScript, getBaseUrl } from "src/lib/seo";
import scConfig from "sitecore.config";

interface LayoutProps {
  page: Page;
}

export interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
}

const Layout = ({ page }: LayoutProps): JSX.Element => {
  const { layout, mode, siteName } = page;
  const { route } = layout.sitecore;
  const mainClassPageEditing = mode.isEditing ? "editing-mode" : "prod-mode";
  const baseUrl = getBaseUrl();
  const siteNameValue = siteName || scConfig.defaultSite || "Site";

  // Generate structured data schemas (doesn't affect layout)
  const webSiteSchema = generateWebSiteSchema(siteNameValue, baseUrl);
  const organizationSchema = generateOrganizationSchema(siteNameValue, baseUrl);

  return (
    <>
      <Scripts />
      <SitecoreStyles layoutData={layout} />
      
      {/* Structured data - WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLdScript(webSiteSchema) }}
      />
      
      {/* Structured data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLdScript(organizationSchema) }}
      />
      
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
            <header role="banner">
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
            <main role="main">
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
            <footer role="contentinfo">
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
