import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { notFound } from 'next/navigation';
import { draftMode, headers } from 'next/headers';
import { SiteInfo } from '@sitecore-content-sdk/nextjs';
import sites from '.sitecore/sites.json';
import { routing } from 'src/i18n/routing';
import scConfig from 'sitecore.config';
import client from 'src/lib/sitecore-client';
import Layout, { RouteFields } from 'src/Layout';
import Providers from 'src/Providers';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import {
  generateWebPageSchema,
  generateProductSchema,
  renderJsonLdScript,
  getBaseUrl,
  getFullUrl,
} from 'src/lib/seo';

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
  const headersList = await headers();
  const host = headersList.get('host');

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

  if (!page) {
    notFound();
  }

  // Generate page-specific structured data
  const fields = page.layout.sitecore.route?.fields as RouteFields;
  const pageTitle = fields?.Title?.value?.toString() || fields?.pageTitle?.value?.toString() || 'Page';
  const pageDescription = fields?.metadataDescription?.value?.toString() || fields?.ogDescription?.value?.toString();
  const currentPath = path?.length ? `/${path.join('/')}` : '/';
  const fullUrl = getFullUrl(currentPath, host);
  const webPageSchema = generateWebPageSchema(pageTitle, fullUrl, pageDescription, locale);

  // Detect if this is a product page and generate Product schema
  const isProductPage = path && path[0] === 'Products';
  const productSchema = isProductPage
    ? generateProductSchema(
        pageTitle,
        fields?.pageSummary?.value?.toString() || pageDescription,
        fields?.thumbnailImage?.value?.src || fields?.ogImage?.value?.src,
        fullUrl,
        undefined // Price not available on detail pages by default
      )
    : null;

  return (
    <NextIntlClientProvider>
      <Providers page={page}>
        {/* Page-specific structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: renderJsonLdScript(webPageSchema) }}
        />
        {productSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: renderJsonLdScript(productSchema) }}
          />
        )}
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

// Configure dynamic rendering to avoid SSR issues with client-side hooks
// This ensures all pages are rendered on-demand rather than pre-rendered at build time
export const dynamic = 'force-dynamic';

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
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
      routing.locales.slice(),
    );
  }
  return [];
};

// Metadata fields for the page.
export const generateMetadata = async ({ params }: PageProps) => {
  const headersList = await headers();
  const host = headersList.get('host');
  const baseUrl = getBaseUrl(host);

  const { site, locale, path } = await params;
  const page = await client.getPage(path ?? [], { site, locale });
  const fields = page?.layout.sitecore.route?.fields as RouteFields;

  const currentPath = path?.length ? `/${path.join('/')}` : '/';
  const fullUrl = getFullUrl(currentPath, host);

  const title = fields?.ogTitle?.value?.toString() || fields?.Title?.value?.toString() || 'Page';
  const description = fields?.ogDescription?.value?.toString() || fields?.metadataDescription?.value?.toString() || 'Find your nearest Alaris dealership';
  const ogImage = fields?.ogImage?.value?.src;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': fullUrl,
        'en-CA': fullUrl.replace('/en/', '/en-CA/'),
      },
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Alaris',
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
};
