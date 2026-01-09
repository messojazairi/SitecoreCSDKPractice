/**
 * Minimal SEO utilities for structured data and metadata
 * These utilities don't affect layout - only add metadata
 */

export interface WebSiteSchema {
  '@context': string;
  '@type': 'WebSite';
  name: string;
  url: string;
  publisher?: {
    '@type': 'Organization';
    name: string;
    url?: string;
  };
}

export interface OrganizationSchema {
  '@context': string;
  '@type': 'Organization';
  name: string;
  url?: string;
}

export interface WebPageSchema {
  '@context': string;
  '@type': 'WebPage';
  name: string;
  description?: string;
  url?: string;
  inLanguage?: string;
  isPartOf?: {
    '@type': 'WebSite';
    name: string;
    url: string;
  };
}

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema(
  name: string,
  url: string
): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    publisher: {
      '@type': 'Organization',
      name,
      url,
    },
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(
  name: string,
  url?: string
): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    ...(url && { url }),
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(
  name: string,
  options?: {
    description?: string;
    url?: string;
    inLanguage?: string;
    siteName?: string;
    siteUrl?: string;
  }
): WebPageSchema {
  const schema: WebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
  };

  if (options?.description) schema.description = options.description;
  if (options?.url) schema.url = options.url;
  if (options?.inLanguage) schema.inLanguage = options.inLanguage;

  if (options?.siteName && options?.siteUrl) {
    schema.isPartOf = {
      '@type': 'WebSite',
      name: options.siteName,
      url: options.siteUrl,
    };
  }

  return schema;
}

/**
 * Render JSON-LD script tag content
 */
export function renderJsonLdScript(
  schema: Record<string, unknown> | WebSiteSchema | OrganizationSchema | WebPageSchema
): string {
  return JSON.stringify(schema as Record<string, unknown>, null, 2);
}

/**
 * Get base URL from environment
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://example.com';
}

/**
 * Generate full URL from path
 */
export function getFullUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
