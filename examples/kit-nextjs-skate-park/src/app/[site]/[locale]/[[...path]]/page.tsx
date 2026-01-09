import { isDesignLibraryPreviewData } from "@sitecore-content-sdk/nextjs/editing";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { SiteInfo } from "@sitecore-content-sdk/nextjs";
import sites from ".sitecore/sites.json";
import { routing } from "src/i18n/routing";
import scConfig from "sitecore.config";
import client from "src/lib/sitecore-client";
import Layout, { RouteFields } from "src/Layout";
import components from ".sitecore/component-map";
import Providers from "src/Providers";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { generateWebPageSchema, renderJsonLdScript, getBaseUrl, getFullUrl } from "src/lib/seo";

type PageProps = {
  params: Promise<{
    site: string;
    locale: string;
    path?: string[];
    [key: string]: string | string[] | undefined;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { site, locale, path } = await params;
  const draft = await draftMode();

  // Set site and locale to be available in src/i18n/request.ts for fetching the dictionary
  setRequestLocale(`${site}_${locale}`);

  // Fetch the page data from Sitecore
  let page;
  if (draft.isEnabled) {
    const editingParams = await searchParams;
    if (isDesignLibraryPreviewData(editingParams)) {
      page = await client.getDesignLibraryData(editingParams);
    } else {
      page = await client.getPreview(editingParams);
    }
  } else {
    page = await client.getPage(path ?? [], { site, locale });
  }

  // If the page is not found, return a 404
  if (!page) {
    notFound();
  }

  // Fetch the component data from Sitecore (Likely will be deprecated)
  const componentProps = await client.getComponentData(
    page.layout,
    {},
    components
  );

  // Generate WebPage structured data
  const routeFields = page.layout.sitecore.route?.fields as RouteFields;
  const pageTitle = routeFields?.Title?.value?.toString() || "Page";
  const pageDescription = (routeFields as { Description?: { value?: string } })?.Description?.value?.toString();
  const pathSegments = path && path.length > 0 ? path.join('/') : '';
  const urlPath = `/${site}/${locale}${pathSegments ? `/${pathSegments}` : ''}`;
  const baseUrl = getBaseUrl();
  const fullUrl = getFullUrl(urlPath, baseUrl);
  
  const webPageSchema = generateWebPageSchema(pageTitle, {
    description: pageDescription,
    url: fullUrl,
    inLanguage: locale.replace('_', '-'),
    siteName: site,
    siteUrl: baseUrl,
  });

  return (
    <NextIntlClientProvider>
      <Providers page={page} componentProps={componentProps}>
        {/* WebPage structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLdScript(webPageSchema) }}
        />
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== "development" && scConfig.generateStaticPaths) {
    // Filter sites to only include the sites this starter is designed to serve.
    // This prevents cross-site build errors when multiple starters share the same XM Cloud instance.
    const defaultSite = scConfig.defaultSite;
    const allowedSites = defaultSite
      ? sites
          .filter((site: SiteInfo) => site.name === defaultSite)
          .map((site: SiteInfo) => site.name)
      : sites.map((site: SiteInfo) => site.name);

    return await client.getAppRouterStaticParams(
      allowedSites,
      routing.locales.slice()
    );
  }
  return [];
};

// Metadata fields for the page.
export const generateMetadata = async ({ params }: PageProps) => {
  const { path, site, locale } = await params;

  // The same call as for rendering the page. Should be cached by default react behavior
  const page = await client.getPage(path ?? [], { site, locale });
  
  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  const routeFields = page.layout.sitecore.route?.fields as RouteFields;
  const title = routeFields?.Title?.value?.toString() || "Page";
  
  // Extract description if available
  const description = (routeFields as { Description?: { value?: string } })?.Description?.value?.toString();
  
  // Build URL path
  const pathSegments = path && path.length > 0 ? path.join('/') : '';
  const urlPath = `/${site}/${locale}${pathSegments ? `/${pathSegments}` : ''}`;
  
  // Get base URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://example.com');
  const fullUrl = `${baseUrl}${urlPath}`;

  // Generate alternate locales
  const alternateLocales: Record<string, string> = {};
  routing.locales
    .filter((loc) => loc !== locale)
    .forEach((loc) => {
      alternateLocales[loc] = `${baseUrl}/${site}/${loc}${pathSegments ? `/${pathSegments}` : ''}`;
    });

  return {
    title,
    ...(description && { description }),
    alternates: {
      canonical: fullUrl,
      ...(Object.keys(alternateLocales).length > 0 && { languages: alternateLocales }),
    },
    openGraph: {
      title,
      ...(description && { description }),
      url: fullUrl,
      siteName: site,
      type: 'website',
      locale: locale.replace('_', '-'),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description && { description }),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
};
