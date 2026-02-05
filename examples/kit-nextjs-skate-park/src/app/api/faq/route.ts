import { NextResponse } from 'next/server';
import faqData from '../../../data/faq.json';

export const dynamic = 'force-dynamic';

const SITE_KEY = 'kit-nextjs-skate-park';
const SITE_NAME = 'Skate Park';

/**
 * API route for serving FAQ data as JSON.
 * Used by AI crawlers and answer engines (GEO/AEO) and by the site for FAQ content.
 *
 * @returns FAQ items with lastModified and site metadata
 */
export async function GET() {
  const payload = {
    site: SITE_NAME,
    siteKey: SITE_KEY,
    ...faqData,
  };
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json',
    },
  });
}
