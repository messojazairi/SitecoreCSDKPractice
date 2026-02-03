import type { NextApiRequest, NextApiResponse } from 'next';

// Allowed URL patterns for LLM sitemap
const ALLOWED_PATTERNS: RegExp[] = [
  /^\/$/i, // Home page
];

// Excluded URL patterns
const EXCLUDED_PATTERNS: RegExp[] = [
  /\/404/i,
  /\/api\//i,
  /\/500$/i,
  /\/error/i,
  /\/_/i,
  /sitemap/i,
  /\/robots/i,
  /\.xml$/i,
  /\.(json|txt|css|js|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i,
  /\?/i,
];

// Checks if URL matches allowed patterns and doesn't match excluded patterns
function shouldIncludeUrl(url: string): boolean {
  try {
    const urlPath = new URL(url).pathname;
    if (urlPath.toLowerCase().includes('sitemap')) return false;
    for (const pattern of EXCLUDED_PATTERNS) {
      if (pattern.test(urlPath)) return false;
    }
    for (const pattern of ALLOWED_PATTERNS) {
      if (pattern.test(urlPath)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Escapes special XML characters
function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Fetches standard sitemap, filters URLs, and returns LLM-optimized XML sitemap
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  try {
    let urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [];

    try {
      const response = await fetch(`${baseUrl}/sitemap.xml`, { headers: { Accept: 'application/xml' } });
      if (response.ok) {
        const xml = await response.text();
        for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
          const loc = block[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
          if (loc) {
            urls.push({
              loc,
              lastmod: block[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
              changefreq: block[1].match(/<changefreq>([^<]+)<\/changefreq>/)?.[1],
              priority: block[1].match(/<priority>([^<]+)<\/priority>/)?.[1],
            });
          }
        }
      }
    } catch {
      // Fallback if sitemap.xml is unavailable
    }

    if (urls.length === 0) {
      urls = [{ loc: baseUrl, lastmod: new Date().toISOString().split('T')[0], priority: '1.0' }];
    }

    const today = new Date().toISOString().split('T')[0];
    const entries = urls
      .filter((u) => shouldIncludeUrl(u.loc))
      .map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.5'}</priority>
  </url>`)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);
  } catch {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}</loc><priority>1.0</priority></url></urlset>`
    );
  }
}
