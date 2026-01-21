// SEO utilities for schema.org structured data and metadata

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

export interface WebPageSchema {
  '@context': 'https://schema.org';
  '@type': 'WebPage';
  name: string;
  description?: string;
  url: string;
  inLanguage?: string;
}

export interface PlaceSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness' | 'Place';
  name: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
}

export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string;
  url?: string;
  offers?: {
    '@type': 'Offer';
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface ReviewSchema {
  '@context': 'https://schema.org';
  '@type': 'Review';
  author?: {
    '@type': 'Person';
    name: string;
  };
  reviewBody?: string;
  reviewRating?: {
    '@type': 'Rating';
    ratingValue?: number;
    bestRating?: number;
  };
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export function generateWebSiteSchema(
  siteName: string,
  siteUrl: string,
  description?: string
): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema(
  name: string,
  url: string,
  logo?: string,
  description?: string
): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
  };
}

export function generateWebPageSchema(
  pageName: string,
  pageUrl: string,
  description?: string,
  locale?: string
): WebPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageName,
    description,
    url: pageUrl,
    inLanguage: locale || 'en',
  };
}

export function generatePlaceSchema(
  name: string,
  streetAddress?: string,
  city?: string,
  region?: string,
  postalCode?: string,
  country?: string,
  latitude?: number,
  longitude?: number
): PlaceSchema {
  const schema: PlaceSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality: city,
      addressRegion: region,
      postalCode,
      addressCountry: country || 'US',
    },
  };

  if (latitude && longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    };
  }

  return schema;
}

export function generateProductSchema(
  name: string,
  description?: string,
  image?: string,
  url?: string,
  price?: string,
  priceCurrency: string = 'USD'
): ProductSchema {
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    url,
  };

  if (price) {
    schema.offers = {
      '@type': 'Offer',
      price: price.replace(/[^0-9.]/g, ''), // Strip currency symbols
      priceCurrency,
      availability: 'https://schema.org/InStock',
    };
  }

  return schema;
}

export function generateFAQPageSchema(
  questions: Array<{ question: string; answer: string }>
): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function generateReviewSchema(
  authorName: string,
  reviewBody?: string,
  ratingValue?: number,
  bestRating: number = 5
): ReviewSchema {
  const schema: ReviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: authorName,
    },
    reviewBody,
  };

  if (ratingValue !== undefined) {
    schema.reviewRating = {
      '@type': 'Rating',
      ratingValue,
      bestRating,
    };
  }

  return schema;
}

export function generateBreadcrumbListSchema(
  breadcrumbs: Array<{ name: string; url?: string }>
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function renderJsonLdScript(
  schema:
    | WebSiteSchema
    | OrganizationSchema
    | WebPageSchema
    | PlaceSchema
    | ProductSchema
    | FAQPageSchema
    | ReviewSchema
    | BreadcrumbListSchema
): string {
  return JSON.stringify(schema);
}

export function getBaseUrl(host?: string | null): string {
  if (host) {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    return `${protocol}://${host}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export function getFullUrl(path: string, host?: string | null): string {
  const baseUrl = getBaseUrl(host);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
