import { aiJsonResponse } from '@/lib/ai-json-response';
import { fetchFaqFromEdge, FaqItem } from '@/lib/faq-from-edge';

const MIN_ITEMS = 3;
const MAX_ITEMS = 10;

/**
 * Serves /ai/faq.json (via rewrite) for AI crawlers and answer engines (GEO/AEO).
 * Fetches FAQ items from Experience Edge via GraphQL.
 *
 * Response: 3–10 { question, answer } objects, application/json, Cache-Control 24h.
 * Returns [] when fewer than 3 items are available.
 *
 * @returns JSON array of FAQ items
 */
export async function GET() {
  const items: FaqItem[] = (await fetchFaqFromEdge()).slice(0, MAX_ITEMS);
  const payload = items.length >= MIN_ITEMS ? items : [];
  return aiJsonResponse(payload);
}
