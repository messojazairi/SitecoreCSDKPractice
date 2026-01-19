/**
 * Schema.org structured data generators
 * These are pure functions that can be used in both server and client components
 */

/**
 * Generate Article schema.org structured data
 */
export interface ArticleSchemaProps {
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
  url?: string;
}

export const generateArticleSchema = (props: ArticleSchemaProps) => {
  const {
    headline,
    description,
    image,
    datePublished,
    dateModified,
    author,
    publisher,
    url,
  } = props;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
  };

  if (description) {
    schema.description = description;
  }

  if (image) {
    schema.image = Array.isArray(image) ? image : [image];
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (author) {
    schema.author = {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    };
  }

  if (publisher) {
    schema.publisher = {
      '@type': 'Organization',
      name: publisher.name,
      ...(publisher.logo && {
        logo: {
          '@type': 'ImageObject',
          url: publisher.logo,
        },
      }),
    };
  }

  if (url) {
    schema.url = url;
    schema.mainEntityOfPage = {
      '@type': 'WebPage',
      '@id': url,
    };
  }

  return schema;
};

/**
 * Generate FAQPage schema.org structured data
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQPageSchemaProps {
  faqs: FAQItem[];
}

export const generateFAQPageSchema = (props: FAQPageSchemaProps) => {
  const { faqs } = props;

  if (!faqs || faqs.length === 0) {
    return null;
  }

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
};

/**
 * Generate Organization schema.org structured data
 */
export interface OrganizationSchemaProps {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
}

export const generateOrganizationSchema = (props: OrganizationSchemaProps) => {
  const { name, url, logo, sameAs, contactPoint } = props;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
  };

  if (url) {
    schema.url = url;
  }

  if (logo) {
    schema.logo = logo;
  }

  if (sameAs && sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  if (contactPoint) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      ...(contactPoint.telephone && { telephone: contactPoint.telephone }),
      ...(contactPoint.contactType && { contactType: contactPoint.contactType }),
      ...(contactPoint.email && { email: contactPoint.email }),
    };
  }

  return schema;
};

/**
 * Generate BreadcrumbList schema.org structured data
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

export interface BreadcrumbListSchemaProps {
  items: BreadcrumbItem[];
}

export const generateBreadcrumbListSchema = (props: BreadcrumbListSchemaProps) => {
  const { items } = props;

  if (!items || items.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate Person schema.org structured data
 */
export interface PersonSchemaProps {
  name: string;
  jobTitle?: string;
  image?: string;
  url?: string;
  sameAs?: string[];
}

export const generatePersonSchema = (props: PersonSchemaProps) => {
  const { name, jobTitle, image, url, sameAs } = props;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
  };

  if (jobTitle) {
    schema.jobTitle = jobTitle;
  }

  if (image) {
    schema.image = image;
  }

  if (url) {
    schema.url = url;
  }

  if (sameAs && sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return schema;
};
