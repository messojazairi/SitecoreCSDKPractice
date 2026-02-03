import { NextResponse } from 'next/server';

/**
 * Revalidation period for the service.json endpoint (1 hour)
 * Uses Incremental Static Regeneration for optimal caching
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
 * Response structure for the service.json endpoint
 */
interface ServiceResponse {
  /** Array of services offered by the site */
  services: Service[];
  /** ISO 8601 timestamp of when the data was last modified */
  lastModified: string;
}

/**
 * Services and capabilities for the Skate Park Demo Starter Kit
 *
 * This starter is a simple demo site showcasing component examples
 * and XM Cloud integration patterns for developers.
 */
const services: Service[] = [
  {
    name: 'Component Showcase',
    description:
      'Explore and learn from a variety of pre-built components demonstrating XM Cloud integration patterns.',
    category: 'Development',
  },
  {
    name: 'Starter Kit Scaffolding',
    description:
      'Provides a ready-to-use Next.js App Router project template for rapid XM Cloud development.',
    category: 'Development',
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
 * API route handler for serving AI service metadata
 *
 * Exposes structured information about the site's services and capabilities
 * for AI assistants and search engines following GEO (Generative Engine Optimization) best practices.
 *
 * @returns {Promise<NextResponse<ServiceResponse>>} JSON response with services array and lastModified timestamp
 *
 * @example
 * // Response format:
 * {
 *   "services": [
 *     {
 *       "name": "Component Showcase",
 *       "description": "Explore and learn from a variety of pre-built components...",
 *       "category": "Development"
 *     }
 *   ],
 *   "lastModified": "2026-02-03T10:00:00.000Z"
 * }
 */
export async function GET(): Promise<NextResponse<ServiceResponse>> {
  const response: ServiceResponse = {
    services,
    lastModified: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
