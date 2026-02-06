import type { NextApiRequest, NextApiResponse } from 'next';
import sites from '.sitecore/sites.json';

/** Cache duration for ai.txt in seconds (24 hours) */
const CACHE_MAX_AGE = 86400;

/**
 * Generates the ai.txt content for AI crawlers
 *
 * The ai.txt file is the AI equivalent of robots.txt. It defines access rules
 * and lists all AI-specific endpoints so LLMs know where to fetch structured data.
 *
 * @param siteUrl - The base URL of the site
 * @returns The formatted ai.txt content
 */
function generateAiTxtContent(siteUrl: string): string {
  const lastModified = new Date().toISOString().split('T')[0];

  return `# AI Crawler Permissions for ${siteUrl}
# This file defines access rules for AI crawlers and LLMs

# General Permissions
User-Agent: *
Allow: /

# AI-Specific Crawler Permissions
User-Agent: GPTBot
Allow: /

User-Agent: Claude-Web
Allow: /

User-Agent: Anthropic-AI
Allow: /

User-Agent: Google-Extended
Allow: /

User-Agent: CCBot
Allow: /

User-Agent: PerplexityBot
Allow: /

# Disallow sensitive paths for all AI crawlers
Disallow: /api/editing/
Disallow: /sitecore/

# Primary AI Endpoints
# These endpoints provide structured data optimized for LLM consumption
AI-Endpoint: ${siteUrl}/ai/summary.json
AI-Endpoint: ${siteUrl}/ai/faq.json
AI-Endpoint: ${siteUrl}/ai/service.json

# LLM-Specific Sitemap
# Provides a sitemap optimized for AI crawlers
Sitemap: ${siteUrl}/sitemap-llm.xml

# Standard Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Metadata
Last-Modified: ${lastModified}
`;
}

/**
 * Resolves the site URL from the request
 *
 * @param req - The incoming Next.js API request
 * @returns The resolved site URL
 */
function resolveSiteUrl(req: NextApiRequest): string {
  // Try to get the host from headers
  const host = req.headers.host || req.headers['x-forwarded-host'];
  const protocol = req.headers['x-forwarded-proto'] || 'https';

  if (host) {
    const hostStr = Array.isArray(host) ? host[0] : host;
    const protoStr = Array.isArray(protocol) ? protocol[0] : protocol;
    return `${protoStr}://${hostStr}`;
  }

  // Fallback to the first configured site or default
  const defaultSite = sites?.[0];
  if (defaultSite?.hostName) {
    return `https://${defaultSite.hostName}`;
  }

  // Final fallback
  return 'https://localhost:3000';
}

/**
 * API route handler for serving ai.txt
 *
 * This Next.js API route handler generates and returns the ai.txt content
 * dynamically based on the resolved site URL. It is used by AI crawlers
 * to understand crawling permissions and discover AI-specific endpoints.
 *
 * @param req - The incoming Next.js API request
 * @param res - The Next.js API response object
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const siteUrl = resolveSiteUrl(req);
    const aiTxtContent = generateAiTxtContent(siteUrl);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(aiTxtContent);
  } catch (error) {
    console.error('Error generating ai.txt:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('# Error generating ai.txt\n');
  }
}
