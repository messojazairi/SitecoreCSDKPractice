/**
 * Structured Data (JSON-LD) utilities for schema.org markup
 * Provides functions to generate JSON-LD structured data for SEO and rich snippets
 */
import React from 'react';

export interface ProductSchema {
  '@context': string;
  '@type': 'Product';
  name: string;
  image?: string;
  description?: string;
  offers?: {
    '@type': 'Offer';
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
  url?: string;
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue?: string;
    reviewCount?: string;
  };
}

export interface ArticleSchema {
  '@context': string;
  '@type': 'Article';
  headline: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': 'Person';
    name: string;
    image?: string;
    jobTitle?: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  description?: string;
  articleBody?: string;
}

export interface OrganizationSchema {
  '@context': string;
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType?: string;
    email?: string;
    telephone?: string;
  };
}

export interface WebSiteSchema {
  '@context': string;
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface FAQPageSchema {
  '@context': string;
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

export interface PlaceSchema {
  '@context': string;
  '@type': 'Place';
  name: string;
  address?: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude?: string;
    longitude?: string;
  };
  telephone?: string;
  url?: string;
}

/**
 * Generate Product JSON-LD structured data
 */
export function generateProductSchema(product: {
  name: string;
  image?: string;
  description?: string;
  price?: string;
  priceCurrency?: string;
  url?: string;
  brand?: string;
}): ProductSchema {
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
  };

  if (product.image) {
    schema.image = product.image;
  }

  if (product.description) {
    schema.description = product.description;
  }

  if (product.price) {
    schema.offers = {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.priceCurrency || 'USD',
      availability: 'https://schema.org/InStock',
    };
  }

  if (product.url) {
    schema.url = product.url;
  }

  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }

  return schema;
}

/**
 * Generate Article JSON-LD structured data
 */
export function generateArticleSchema(article: {
  headline: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    image?: string;
    jobTitle?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  description?: string;
  articleBody?: string;
}): ArticleSchema {
  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
  };

  if (article.image) {
    schema.image = article.image;
  }

  if (article.datePublished) {
    schema.datePublished = article.datePublished;
  }

  if (article.dateModified) {
    schema.dateModified = article.dateModified;
  }

  if (article.author) {
    schema.author = {
      '@type': 'Person',
      name: article.author.name,
    };
    if (article.author.image) {
      schema.author.image = article.author.image;
    }
    if (article.author.jobTitle) {
      schema.author.jobTitle = article.author.jobTitle;
    }
  }

  if (article.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: article.publisher.name,
    };
    if (article.publisher.logo) {
      schema.publisher.logo = {
        '@type': 'ImageObject',
        url: article.publisher.logo,
      };
    }
  }

  if (article.description) {
    schema.description = article.description;
  }

  if (article.articleBody) {
    schema.articleBody = article.articleBody;
  }

  return schema;
}

/**
 * Generate Organization JSON-LD structured data
 */
export function generateOrganizationSchema(org: {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    contactType?: string;
    email?: string;
    telephone?: string;
  };
}): OrganizationSchema {
  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
  };

  if (org.url) {
    schema.url = org.url;
  }

  if (org.logo) {
    schema.logo = org.logo;
  }

  if (org.sameAs && org.sameAs.length > 0) {
    schema.sameAs = org.sameAs;
  }

  if (org.contactPoint) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      contactType: org.contactPoint.contactType || 'Customer Service',
    };
    if (org.contactPoint.email) {
      schema.contactPoint.email = org.contactPoint.email;
    }
    if (org.contactPoint.telephone) {
      schema.contactPoint.telephone = org.contactPoint.telephone;
    }
  }

  return schema;
}

/**
 * Generate WebSite JSON-LD structured data
 */
export function generateWebSiteSchema(site: {
  name: string;
  url: string;
  searchUrl?: string;
}): WebSiteSchema {
  const schema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
  };

  if (site.searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: site.searchUrl,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
}

/**
 * Generate FAQPage JSON-LD structured data
 */
export function generateFAQPageSchema(faqs: Array<{ question: string; answer: string }>): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Place JSON-LD structured data
 */
export function generatePlaceSchema(place: {
  name: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude?: string;
    longitude?: string;
  };
  telephone?: string;
  url?: string;
}): PlaceSchema {
  const schema: PlaceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: place.name,
  };

  if (place.address) {
    schema.address = {
      '@type': 'PostalAddress',
    };
    if (place.address.streetAddress) {
      schema.address.streetAddress = place.address.streetAddress;
    }
    if (place.address.addressLocality) {
      schema.address.addressLocality = place.address.addressLocality;
    }
    if (place.address.addressRegion) {
      schema.address.addressRegion = place.address.addressRegion;
    }
    if (place.address.postalCode) {
      schema.address.postalCode = place.address.postalCode;
    }
    if (place.address.addressCountry) {
      schema.address.addressCountry = place.address.addressCountry;
    }
  }

  if (place.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
    };
    if (place.geo.latitude) {
      schema.geo.latitude = place.geo.latitude;
    }
    if (place.geo.longitude) {
      schema.geo.longitude = place.geo.longitude;
    }
  }

  if (place.telephone) {
    schema.telephone = place.telephone;
  }

  if (place.url) {
    schema.url = place.url;
  }

  return schema;
}

/**
 * Render JSON-LD script tag
 */
export function renderJsonLdScript(
  schema: ProductSchema | ArticleSchema | OrganizationSchema | WebSiteSchema | FAQPageSchema | PlaceSchema
): React.JSX.Element {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema, null, 2) },
  });
}
