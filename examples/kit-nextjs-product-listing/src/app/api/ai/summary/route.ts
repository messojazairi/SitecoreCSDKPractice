/**
 * Serves /ai/summary.json (via rewrite) – authoritative summary for AI crawlers.
 *
 * Provides a short (<800 characters) summary so AI systems can understand what the site
 * is about. Application/json, Cache-Control 24h. Publicly accessible.
 */

import { aiJsonResponse } from '@/lib/ai-json-response';

const MAX_DESCRIPTION_LENGTH = 800;

export interface SummaryJsonPayload {
  title: string;
  description: string;
  lastModified: string;
}

/**
 * Ensures description does not exceed max length (requirement: MUST NOT exceed 800 characters).
 */
function ensureDescriptionLength(description: string, maxLength: number): string {
  const trimmed = description.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 3) + '...';
}

export async function GET() {
  const description = `SYNC is a product-focused site for audio gear companies. It showcases product listings, categories, and commerce-oriented experiences built with Sitecore XM Cloud and Next.js. The template delivers performance, personalization, and AI-ready content for product discovery and e-commerce.`;

  const payload: SummaryJsonPayload = {
    title: 'SYNC',
    description: ensureDescriptionLength(description, MAX_DESCRIPTION_LENGTH),
    lastModified: new Date().toISOString(),
  };

  return aiJsonResponse(payload);
}
