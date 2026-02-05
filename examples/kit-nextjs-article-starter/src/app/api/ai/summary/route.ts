/**
 * API route for /ai/summary.json – authoritative summary for AI crawlers.
 *
 * Provides a short (<800 characters) summary so AI systems can understand what the site
 * is about. Served as application/json with Cache-Control. Publicly accessible.
 */

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
  const description = `Solterra & Co. is a lifestyle and editorial site showcasing content-driven experiences for modern brands. It features modular components, article and topic listings, hero and promo sections, and rich media. Built with Sitecore XM Cloud and Next.js for performance, personalization, and AI-ready content delivery.`;

  const payload: SummaryJsonPayload = {
    title: 'Solterra & Co.',
    description: ensureDescriptionLength(description, MAX_DESCRIPTION_LENGTH),
    lastModified: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
