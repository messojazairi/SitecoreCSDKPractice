import { aiJsonResponse } from '@/lib/ai-json-response';

/**
 * Revalidation period for the service endpoint (1 hour).
 * Uses Incremental Static Regeneration for optimal caching.
 */
export const revalidate = 3600;

/**
 * Represents a service or capability offered by the site
 */
interface Service {
  /** Human-readable name of the service */
  name: string;
  /** Detailed description of what the service provides */
  description: string;
  /** Category grouping for the service */
  category: string;
}

/**
 * Response structure for the service endpoint
 */
interface ServiceResponse {
  /** Array of services offered by the site */
  services: Service[];
  /** ISO 8601 timestamp of when the data was last modified */
  lastModified: string;
}

/**
 * Services and capabilities for the Solterra & Co. Article Starter Kit
 *
 * This starter is an editorial-style template designed for lifestyle brands,
 * featuring article publishing, content management, and multi-locale support.
 */
const services: Service[] = [
  {
    name: 'Editorial Content Publishing',
    description:
      'Publish and manage editorial articles with rich text, images, and multimedia content for lifestyle and brand storytelling.',
    category: 'Content Management',
  },
  {
    name: 'Article Category Organization',
    description:
      'Organize articles into categories and topics for improved content discovery and navigation.',
    category: 'Content Management',
  },
  {
    name: 'Multi-Locale Content Delivery',
    description:
      'Deliver localized content in multiple languages (English and Canadian English) with automatic locale detection.',
    category: 'Localization',
  },
  {
    name: 'XM Cloud Content Integration',
    description:
      'Seamlessly integrate with Sitecore XM Cloud for headless content management and delivery using the Content SDK.',
    category: 'Content Delivery',
  },
  {
    name: 'Component-Based Page Building',
    description:
      'Build pages using modular, reusable components with multiple layout variants and styling options.',
    category: 'Development',
  },
  {
    name: 'Responsive Image Optimization',
    description:
      'Automatically optimize and serve images in modern formats with responsive sizing for optimal performance.',
    category: 'Performance',
  },
  {
    name: 'SEO Metadata Management',
    description:
      'Manage page titles, descriptions, and Open Graph metadata for improved search engine visibility.',
    category: 'SEO',
  },
  {
    name: 'Content Preview and Editing',
    description:
      'Preview content changes in real-time with integrated XM Cloud editing experience support.',
    category: 'Content Management',
  },
];

/**
 * Serves /ai/service.json (via rewrite) – site services and capabilities for AI assistants (GEO).
 *
 * Exposes structured information about the site's services and capabilities
 * for AI assistants and search engines. Application/json, Cache-Control 1h with
 * stale-while-revalidate. Publicly accessible.
 *
 * @returns JSON response with services array and lastModified timestamp
 */
export async function GET() {
  const response: ServiceResponse = {
    services,
    lastModified: new Date().toISOString(),
  };

  return aiJsonResponse(response, {
    maxAge: 3600,
    sMaxAge: 3600,
    staleWhileRevalidate: 86400,
  });
}
