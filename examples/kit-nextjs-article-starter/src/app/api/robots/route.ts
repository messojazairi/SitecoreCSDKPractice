import { createRobotsRouteHandler } from '@sitecore-content-sdk/nextjs/route-handler';
import { NextRequest, NextResponse } from 'next/server';
import sites from '.sitecore/sites.json';
import client from 'lib/sitecore-client';

export const dynamic = 'force-dynamic';

/**
 * API route for serving robots.txt
 *
 * This Next.js API route handler generates and returns the robots.txt content dynamically
 * based on the resolved site name. It is commonly
 * used by search engine crawlers to determine crawl and indexing rules.
 *
 * This implementation ensures indexing is allowed by checking if Sitecore's
 * robots.txt blocks indexing and providing a permissive fallback.
 */

const { GET: sitecoreGET } = createRobotsRouteHandler({
  client,
  sites,
});

// Custom GET handler that ensures indexing is allowed
export async function GET(request: NextRequest) {
  try {
    // Try to get robots.txt from Sitecore first
    const response = await sitecoreGET(request);

    // Clone the response so we can read it
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();

    // Check if Sitecore returned a blocking robots.txt
    // Common blocking patterns: "Disallow: /" that blocks everything
    if (text.includes('Disallow: /') && !text.includes('Allow: /')) {
      // Return a permissive robots.txt instead to allow indexing
      const permissiveRobots = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', request.url).toString()}`;

      return new NextResponse(permissiveRobots, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Return Sitecore's robots.txt if it's not blocking
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    // If Sitecore fails, return a permissive robots.txt to ensure indexing
    console.error('Error fetching robots.txt from Sitecore:', error);

    const fallbackRobots = `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', request.url).toString()}`;

    return new NextResponse(fallbackRobots, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
