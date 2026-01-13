/**
 * Schema.org structured data utilities
 * Generates JSON-LD markup for GEO/SEO optimization
 */

export interface ProductSchema {
  '@context': string;
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string | string[];
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers?: {
    '@type': 'Offer';
    price?: string;
    priceCurrency?: string;
    availability?: string;
    url?: string;
  };
  sku?: string;
  category?: string;
  url?: string;
}

export interface ItemListSchema {
  '@context': string;
  '@type': 'ItemList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    item: ProductSchema;
  }>;
  numberOfItems?: number;
}

export interface OrganizationSchema {
  '@context': string;
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
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

export interface ArticleSchema {
  '@context': string;
  '@type': 'Article';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': 'Person';
    name: string;
    jobTitle?: string;
    image?: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
  articleSection?: string;
  wordCount?: number;
}

export interface PlaceSchema {
  '@context': string;
  '@type': 'Place' | 'LocalBusiness';
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
    latitude?: number;
    longitude?: number;
  };
  telephone?: string;
  url?: string;
  image?: string;
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

/**
 * Generate Product schema JSON-LD
 */
export function generateProductSchema(product: {
  name: string;
  description?: string;
  image?: string | string[];
  brand?: string;
  price?: string;
  priceCurrency?: string;
  availability?: string;
  sku?: string;
  category?: string;
  url?: string;
}): ProductSchema {
  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
  };

  if (product.description) {
    schema.description = product.description;
  }

  if (product.image) {
    schema.image = product.image;
  }

  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }

  if (product.price || product.availability || product.url) {
    schema.offers = {
      '@type': 'Offer',
    };

    if (product.price) {
      schema.offers.price = product.price;
    }

    if (product.priceCurrency) {
      schema.offers.priceCurrency = product.priceCurrency;
    }

    if (product.availability) {
      schema.offers.availability = product.availability;
    }

    if (product.url) {
      schema.offers.url = product.url;
    }
  }

  if (product.sku) {
    schema.sku = product.sku;
  }

  if (product.category) {
    schema.category = product.category;
  }

  if (product.url) {
    schema.url = product.url;
  }

  return schema;
}

/**
 * Generate ItemList schema JSON-LD
 */
export function generateItemListSchema(products: ProductSchema[]): ItemListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: product,
    })),
    numberOfItems: products.length,
  };
}

/**
 * Generate Organization schema JSON-LD
 */
export function generateOrganizationSchema(org: {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
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

  return schema;
}

/**
 * Generate WebSite schema JSON-LD
 */
export function generateWebSiteSchema(site: {
  name: string;
  url: string;
  searchUrlTemplate?: string;
}): WebSiteSchema {
  const schema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
  };

  if (site.searchUrlTemplate) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: site.searchUrlTemplate,
      },
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
}


/**
 * Generate Article schema JSON-LD
 */
export function generateArticleSchema(article: {
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    jobTitle?: string;
    image?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  url?: string;
  articleSection?: string;
  wordCount?: number;
}): ArticleSchema {
  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
  };

  if (article.description) {
    schema.description = article.description;
  }

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

    if (article.author.jobTitle) {
      schema.author.jobTitle = article.author.jobTitle;
    }

    if (article.author.image) {
      schema.author.image = article.author.image;
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

  if (article.url) {
    schema.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': article.url,
    };
  }

  if (article.articleSection) {
    schema.articleSection = article.articleSection;
  }

  if (article.wordCount) {
    schema.wordCount = article.wordCount;
  }

  return schema;
}

/**
 * Generate Place/LocalBusiness schema JSON-LD
 */
export function generatePlaceSchema(place: {
  name: string;
  type?: 'Place' | 'LocalBusiness';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  url?: string;
  image?: string;
}): PlaceSchema {
  const schema: PlaceSchema = {
    '@context': 'https://schema.org',
    '@type': place.type || 'Place',
    name: place.name,
  };

  if (place.streetAddress || place.addressLocality || place.addressRegion || place.postalCode || place.addressCountry) {
    schema.address = {
      '@type': 'PostalAddress',
    };

    if (place.streetAddress) {
      schema.address.streetAddress = place.streetAddress;
    }

    if (place.addressLocality) {
      schema.address.addressLocality = place.addressLocality;
    }

    if (place.addressRegion) {
      schema.address.addressRegion = place.addressRegion;
    }

    if (place.postalCode) {
      schema.address.postalCode = place.postalCode;
    }

    if (place.addressCountry) {
      schema.address.addressCountry = place.addressCountry;
    }
  }

  if (place.latitude !== undefined && place.longitude !== undefined) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: place.latitude,
      longitude: place.longitude,
    };
  }

  if (place.telephone) {
    schema.telephone = place.telephone;
  }

  if (place.url) {
    schema.url = place.url;
  }

  if (place.image) {
    schema.image = place.image;
  }

  return schema;
}

/**
 * Generate FAQPage schema JSON-LD
 */
export function generateFAQPageSchema(faqs: Array<{
  question: string;
  answer: string;
}>): FAQPageSchema {
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
 * Convert schema object to JSON-LD script tag content
 */
export function schemaToJsonLd(schema: object): string {
  return JSON.stringify(schema, null, 2);
}
