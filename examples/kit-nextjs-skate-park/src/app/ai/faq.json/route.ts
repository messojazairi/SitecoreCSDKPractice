import { NextResponse } from 'next/server';
import faqData from '@/data/faq.json';

const MIN_ITEMS = 3;
const MAX_ITEMS = 10;

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Serves FAQ data at /ai/faq.json for AI crawlers and answer engines (GEO/AEO).
 * Response: array of { question, answer } objects, 3–10 items, application/json,
 * Cache-Control max-age=86400, publicly accessible.
 *
 * @returns JSON array of FAQ items with question and answer only
 */
export async function GET() {
  const rawItems = Array.isArray(faqData.items) ? faqData.items : [];
  const items: FaqItem[] = rawItems
    .slice(0, MAX_ITEMS)
    .map((item: { question?: string; answer?: string }) => ({
      question: typeof item.question === 'string' ? item.question : '',
      answer: typeof item.answer === 'string' ? item.answer : '',
    }))
    .filter((item) => item.question && item.answer);

  const payload = items.length >= MIN_ITEMS ? items : [];
  return NextResponse.json(payload, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
