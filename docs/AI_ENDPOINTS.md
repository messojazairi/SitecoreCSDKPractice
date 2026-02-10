# GEO Endpoints Documentation

## Table of Contents

- [What is GEO?](#what-is-geo)
- [Endpoint Overview](#endpoint-overview)
- [/.well-known/ai.txt](#well-knownaitxt)
  - [Purpose and Specification](#purpose-and-specification)
  - [Example Output](#example-output)
  - [Implementation Details](#implementation-details)
  - [Starter Coverage](#starter-coverage)
  - [AI Crawlers Covered](#ai-crawlers-covered)
  - [Directives Reference](#directives-reference)
- [/ai/summary.json](#aisummaryjson)
  - [Purpose and Specification](#purpose-and-specification-1)
  - [Example Payload](#example-payload)
  - [JSON Schema](#json-schema)
  - [Implementation Details](#implementation-details-1)
  - [Starter Coverage](#starter-coverage-1)
- [/ai/faq.json](#aifaqjson)
  - [Purpose and Specification](#purpose-and-specification-2)
  - [Example Payload](#example-payload-1)
  - [JSON Schema](#json-schema-1)
  - [Implementation Details](#implementation-details-2)
  - [Starter Coverage](#starter-coverage-2)
- [/ai/service.json](#aiservicejson)
  - [Purpose and Specification](#purpose-and-specification-3)
  - [Example Payload](#example-payload-2)
  - [JSON Schema](#json-schema-2)
  - [Implementation Details](#implementation-details-3)
  - [Starter Coverage](#starter-coverage-3)
- [/sitemap-llm.xml](#sitemap-llmxml)
  - [Purpose and Specification](#purpose-and-specification-4)
  - [Example Output](#example-output-1)
  - [Implementation Details](#implementation-details-4)
  - [URL Filtering](#url-filtering)
  - [Starter Coverage](#starter-coverage-4)
- [Maintenance Rules](#maintenance-rules)
- [Deployment Considerations](#deployment-considerations)

---

## What is GEO?

**Generative Engine Optimization (GEO)** is the practice of making your website's content discoverable and consumable by AI-powered search engines and large language models (LLMs). While traditional SEO focuses on ranking in conventional search engines like Google, GEO ensures that AI systems -- such as ChatGPT, Claude, Perplexity, and Google AI Overviews -- can find, understand, and accurately represent your content.

GEO sits alongside two related disciplines:

| Discipline | Full Name | Focus |
|---|---|---|
| **SEO** | Search Engine Optimization | Ranking in traditional search results (Google, Bing) |
| **AEO** | Answer Engine Optimization | Appearing in featured snippets and direct-answer panels |
| **GEO** | Generative Engine Optimization | Being discovered and cited by AI/LLM-powered engines |

### Why does this matter?

AI crawlers need a structured way to discover what data a site exposes for machine consumption. Just as `robots.txt` tells traditional crawlers what they can and cannot access, the `/.well-known/ai.txt` file serves as the **"robots.txt for AI"** -- it declares crawler permissions and provides an index of all AI-specific endpoints on the site.

### GEO Endpoints in This Repository

This repository implements the following GEO endpoints across its starter applications:

| # | Endpoint | Purpose |
|---|---|---|
| 1 | `/.well-known/ai.txt` | AI crawler permissions and endpoint index |
| 2 | `/ai/summary.json` | Structured site/page summary for LLMs |
| 3 | `/ai/faq.json` | FAQ data in structured format for answer engines |
| 4 | `/ai/service.json` | Service/business metadata for AI crawlers |
| 5 | `sitemap-llm.xml` | LLM-specific sitemap for AI content discovery |

## /.well-known/ai.txt

### Purpose and Specification

The `/.well-known/ai.txt` file is the AI equivalent of `robots.txt`. It serves two primary functions:

1. **Crawler Permissions** -- Explicitly allows or disallows specific AI crawlers from accessing parts of the site.
2. **Endpoint Discovery** -- Lists all AI-specific data endpoints (`/ai/*.json`) so LLMs know where to fetch structured data.

**Specification:**

| Property | Value |
|---|---|
| **Location** | `/.well-known/ai.txt` |
| **Content-Type** | `text/plain; charset=utf-8` |
| **Cache-Control** | `public, max-age=86400, s-maxage=86400` (24 hours) |
| **Security Header** | `X-Content-Type-Options: nosniff` |
| **Authentication** | None required -- publicly accessible |
| **Generation** | Dynamic (generated per-request via `force-dynamic`) |

### Example Output

When a request is made to `https://www.example.com/.well-known/ai.txt`, the endpoint returns:

```text
# AI Crawler Permissions for https://www.example.com

User-Agent: *
Allow: /

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

Disallow: /api/editing/
Disallow: /sitecore/

AI-Endpoint: https://www.example.com/ai/summary.json
AI-Endpoint: https://www.example.com/ai/faq.json
AI-Endpoint: https://www.example.com/ai/service.json

Sitemap: https://www.example.com/sitemap-llm.xml
Sitemap: https://www.example.com/sitemap.xml

Last-Modified: 2026-02-06
```

The site URL (`https://www.example.com` above) is dynamically resolved from the incoming request headers. The `Last-Modified` date is auto-generated as the current date in ISO format.

### Implementation Details

#### App Router (5 starters)

The endpoint is implemented as a Next.js App Router API route at:

```
src/app/api/well-known/ai-txt/route.ts
```

Key aspects of the implementation:

- **`export const dynamic = 'force-dynamic'`** -- Prevents Next.js from statically generating this route at build time; the content is generated fresh on each request.
- **`generateAiTxtContent(siteUrl)`** -- Pure function that builds the plaintext content, inserting the resolved site URL into all endpoint references.
- **`resolveSiteUrl(request)`** -- Determines the site's base URL using the following fallback chain:
  1. `host` or `x-forwarded-host` request header (combined with `x-forwarded-proto` or defaulting to `https`)
  2. First entry's `hostName` from `.sitecore/sites.json`
  3. `request.nextUrl.origin` as final fallback
- **Response headers** -- Sets `Content-Type`, `Cache-Control`, and `X-Content-Type-Options`.
- **Error handling** -- Catches errors and returns a `500` response with a plaintext error message.

#### Pages Router (1 starter)

The Pages Router starter (`basic-nextjs-pages-router`) implements the same endpoint at:

```
src/pages/api/well-known/ai-txt.ts
```

#### Next.js Rewrite Rule

In each starter's `next.config.ts` (or `next.config.js` for Pages Router), a rewrite maps the well-known path to the API route:

```typescript
{
  source: '/.well-known/ai.txt',
  destination: '/api/well-known/ai-txt',
  locale: false,
}
```

The `locale: false` setting ensures the rewrite works regardless of any i18n locale prefix (e.g., `/en/.well-known/ai.txt` is not required).

### Starter Coverage

The `/.well-known/ai.txt` endpoint is implemented in all 6 starters:

| Starter | Router | Route File | Config File |
|---|---|---|---|
| `basic-nextjs` | App Router | `examples/basic-nextjs/src/app/api/well-known/ai-txt/route.ts` | `examples/basic-nextjs/next.config.ts` |
| `kit-nextjs-article-starter` | App Router | `examples/kit-nextjs-article-starter/src/app/api/well-known/ai-txt/route.ts` | `examples/kit-nextjs-article-starter/next.config.ts` |
| `kit-nextjs-location-finder` | App Router | `examples/kit-nextjs-location-finder/src/app/api/well-known/ai-txt/route.ts` | `examples/kit-nextjs-location-finder/next.config.ts` |
| `kit-nextjs-product-listing` | App Router | `examples/kit-nextjs-product-listing/src/app/api/well-known/ai-txt/route.ts` | `examples/kit-nextjs-product-listing/next.config.ts` |
| `kit-nextjs-skate-park` | App Router | `examples/kit-nextjs-skate-park/src/app/api/well-known/ai-txt/route.ts` | `examples/kit-nextjs-skate-park/next.config.ts` |
| `basic-nextjs-pages-router` | Pages Router | `examples/basic-nextjs-pages-router/src/pages/api/well-known/ai-txt.ts` | `examples/basic-nextjs-pages-router/next.config.js` |


### AI Crawlers Covered

The `ai.txt` file includes explicit permissions for the following AI crawlers:

| User-Agent | Organization | Purpose |
|---|---|---|
| `*` (wildcard) | All crawlers | Default allow rule for any unspecified crawler |
| `GPTBot` | OpenAI | Crawler used by ChatGPT and OpenAI services |
| `Claude-Web` | Anthropic | Web crawler for Claude AI |
| `Anthropic-AI` | Anthropic | General Anthropic AI crawler |
| `Google-Extended` | Google | Crawler used for Google AI features (Gemini, AI Overviews) |
| `CCBot` | Common Crawl | Open-source web crawler used to build AI training datasets |
| `PerplexityBot` | Perplexity AI | Crawler for the Perplexity AI search engine |

**Disallow rules** prevent AI crawlers from accessing sensitive areas:

| Path | Reason |
|---|---|
| `/api/editing/` | Sitecore XM Cloud editing API -- internal only, not intended for public consumption |
| `/sitecore/` | Sitecore system paths -- administrative and internal routes |

---

## /ai/summary.json

### Purpose and Specification

The `/ai/summary.json` endpoint provides an authoritative, machine-readable summary of the site so that AI systems can quickly understand what the site is about without crawling its entire content. Think of it as a structured "elevator pitch" for LLMs.

The description field is capped at **800 characters** to ensure it remains concise and suitable for inclusion in AI context windows.

**Specification:**

| Property | Value |
|---|---|
| **Location** | `/ai/summary.json` |
| **Content-Type** | `application/json; charset=utf-8` |
| **Cache-Control** | `public, max-age=86400` (24 hours) |
| **Authentication** | None required -- publicly accessible |
| **Generation** | Dynamic (generated per-request) |
| **Description Limit** | 800 characters maximum |

### Example Payload

When a request is made to `https://www.example.com/ai/summary.json`, the endpoint returns:

```json
{
  "title": "Solterra & Co.",
  "description": "Solterra & Co. is a lifestyle and editorial site showcasing content-driven experiences for modern brands. It features modular components, article and topic listings, hero and promo sections, and rich media. Built with Sitecore XM Cloud and Next.js for performance, personalization, and AI-ready content delivery.",
  "lastModified": "2026-02-06T12:00:00.000Z"
}
```

Each starter returns its own site-specific content:

| Starter | Title | Description Summary |
|---|---|---|
| kit-nextjs-article-starter | "Solterra & Co." | Lifestyle and editorial site for modern brands |
| kit-nextjs-location-finder | "Alaris" | Car brand site with dealer/location finder |
| kit-nextjs-product-listing | "SYNC" | Product-focused site for audio gear companies |
| kit-nextjs-skate-park | "Skate Park" | Demo site showcasing component examples |

### JSON Schema

The response payload follows the `SummaryJsonPayload` interface:

```typescript
export interface SummaryJsonPayload {
  title: string;        // The site or brand name
  description: string;  // Short summary, max 800 characters
  lastModified: string; // ISO 8601 timestamp of when the response was generated
}
```

### Implementation Details

#### Route Handler

The endpoint is implemented as a Next.js App Router API route at:

```
src/app/api/ai/summary/route.ts
```

Key aspects of the implementation:

- **`MAX_DESCRIPTION_LENGTH = 800`** -- Constant defining the maximum allowed description length per the GEO contract.
- **`ensureDescriptionLength(description, maxLength)`** -- Utility function that trims whitespace and truncates descriptions exceeding the limit, appending `...` to indicate truncation.
- **`GET()` handler** -- Returns a JSON response with the `SummaryJsonPayload`. Unlike the `ai.txt` endpoint, this handler does not need to resolve the site URL since the payload contains only site metadata.
- **Response headers** -- Sets `Content-Type: application/json; charset=utf-8` and `Cache-Control: public, max-age=86400`.

#### Next.js Rewrite Rule

In each kit starter's `next.config.ts`, a rewrite maps the public-facing path to the API route:

```typescript
{
  source: '/ai/summary.json',
  destination: '/api/ai/summary',
  locale: false,
}
```

The `locale: false` setting ensures the path works without any i18n locale prefix.

#### Site-Specific Content

Unlike the `ai.txt` endpoint (which is identical across starters), each starter's `summary/route.ts` contains **unique** `title` and `description` values tailored to that specific site. The implementation structure (interface, helper function, handler) is identical -- only the content strings differ.

### Starter Coverage

The `/ai/summary.json` endpoint is implemented in **4 kit starters** only:

| Starter | Route File | Title |
|---|---|---|
| `kit-nextjs-article-starter` | `examples/kit-nextjs-article-starter/src/app/api/ai/summary/route.ts` | Solterra & Co. |
| `kit-nextjs-location-finder` | `examples/kit-nextjs-location-finder/src/app/api/ai/summary/route.ts` | Alaris |
| `kit-nextjs-product-listing` | `examples/kit-nextjs-product-listing/src/app/api/ai/summary/route.ts` | SYNC |
| `kit-nextjs-skate-park` | `examples/kit-nextjs-skate-park/src/app/api/ai/summary/route.ts` | Skate Park |

---

## /ai/faq.json

### Purpose and Specification

The `/ai/faq.json` endpoint serves frequently asked questions in a structured JSON format optimized for AI answer engines and generative AI systems. It enables LLMs to surface accurate, site-specific answers directly in AI-generated responses, supporting both GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization) strategies.

The endpoint enforces a **minimum of 3** and **maximum of 10** FAQ items per response, ensuring sufficient content for AI consumption without overwhelming context windows.

**Specification:**

| Property | Value |
|---|---|
| **Location** | `/ai/faq.json` (also available at `/faq.json` via rewrite) |
| **Content-Type** | `application/json` |
| **Cache-Control** | `public, max-age=86400` (24 hours) |
| **Authentication** | None required -- publicly accessible |
| **Generation** | Dynamic route handler reading from a static data file |
| **Item Count** | Minimum 3, maximum 10 |

### Example Payload

When a request is made to `https://www.example.com/ai/faq.json`, the endpoint returns a JSON array of question/answer pairs:

```json
[
  {
    "question": "What is Solterra & Co.?",
    "answer": "Solterra & Co. is an inspired brands company focused on green energy and sustainability. We work toward a cleaner, healthier planet through clean, renewable energy and our brands."
  },
  {
    "question": "What are Solterra & Co.'s sustainability priorities?",
    "answer": "We focus on four sustainability priorities: Climate, Nature, Plastics, and Livelihoods. Our work includes solar electric programs, wind energy collection, and partnerships that cut costs and carbon footprints."
  },
  {
    "question": "How do I get in touch or stay updated?",
    "answer": "Use Get In Touch on the website for general inquiries. Sign up for our newsletter for bite-sized insights on green energy and company updates."
  }
]
```

Each starter returns its own site-specific FAQ content:

| Starter | # of FAQs | Topics |
|---|---|---|
| kit-nextjs-article-starter (Solterra & Co.) | 7 | Brand availability, media kits, accounts, sustainability, careers, contact |
| kit-nextjs-location-finder (Alaris) | 4 | Maintenance scheduling, dealership inventory, international availability, account setup |
| kit-nextjs-product-listing (SYNC) | 7 | VIP access, manufacturing, shipping/returns, warranty, product categories, support, offers |
| kit-nextjs-skate-park (Skate Park) | 6 | About, who can buy, offerings, contact, location, learn more |

> **Note:** If the data file contains fewer than 3 valid items, the endpoint returns an empty array `[]` rather than incomplete data.

**The data source file** (`src/data/faq.json`) uses a wrapper object:

```typescript
interface FaqDataFile {
  items: FaqItem[];   // Array of FAQ question/answer pairs
  lastModified: string; // ISO 8601 timestamp indicating when the FAQ data was last updated
}
```

> **Note:** The `lastModified` field in the data file is metadata for maintainers -- it is **not** included in the API response. Only the `question` and `answer` fields are returned to callers.

**Validation rules enforced by the route handler:**

- Items must have both `question` and `answer` as non-empty strings (items missing either are filtered out).
- A maximum of 10 items are returned (excess items are truncated via `.slice(0, MAX_ITEMS)`).
- If fewer than 3 valid items remain after filtering, the endpoint returns an empty array `[]`.
- The response must pass JSON lint validation.

### Implementation Details

#### Two-File Architecture

Unlike the `ai.txt` and `summary.json` endpoints (single route file each), the FAQ endpoint uses a **two-file pattern**:

1. **Data file** (`src/data/faq.json`) -- Static JSON containing site-specific FAQ content. Each starter has its own unique questions and answers.
2. **Route handler** (`src/app/ai/faq.json/route.ts`) -- Identical across all 4 starters. Imports the data file via `@/data/faq.json`, validates and slices the items, and returns the JSON response.

This separation means FAQ content can be updated by editing only the data file, without modifying the route handler logic.

#### Route Handler

The route handler is located at:

```
src/app/ai/faq.json/route.ts
```

> **Note:** The directory is named `faq.json/` (with the `.json` extension as part of the folder name). This is an App Router convention that makes the route serve at `/ai/faq.json` directly.

#### Next.js Rewrite Rule

In each kit starter's `next.config.ts`, a rewrite provides an additional convenience path:

```typescript
{
  source: '/faq.json',
  destination: '/ai/faq.json',
}
```

This means the FAQ data is accessible at **two** paths:
- `/ai/faq.json` -- Primary path (served directly by the App Router route handler)
- `/faq.json` -- Convenience path (rewritten to `/ai/faq.json`)

> **Note:** Unlike other rewrites, this rule does **not** set `locale: false`. This means locale-prefixed paths like `/en/faq.json` may also be rewritten depending on the i18n configuration.

### Starter Coverage

The `/ai/faq.json` endpoint is implemented in **4 kit starters** only:

| Starter | Route File | Data File |
|---|---|---|
| `kit-nextjs-article-starter` | `examples/kit-nextjs-article-starter/src/app/ai/faq.json/route.ts` | `examples/kit-nextjs-article-starter/src/data/faq.json` |
| `kit-nextjs-location-finder` | `examples/kit-nextjs-location-finder/src/app/ai/faq.json/route.ts` | `examples/kit-nextjs-location-finder/src/data/faq.json` |
| `kit-nextjs-product-listing` | `examples/kit-nextjs-product-listing/src/app/ai/faq.json/route.ts` | `examples/kit-nextjs-product-listing/src/data/faq.json` |
| `kit-nextjs-skate-park` | `examples/kit-nextjs-skate-park/src/app/ai/faq.json/route.ts` | `examples/kit-nextjs-skate-park/src/data/faq.json` |

---

## /ai/service.json

### Purpose and Specification

The `/ai/service.json` endpoint exposes a structured list of the site's services and capabilities so that AI assistants can accurately reference what the site offers. Rather than marketing copy, this endpoint should reflect the **real, functional capabilities** of the site -- features a user or developer can actually use.

This endpoint supports GEO by providing AI systems with a categorized inventory of site features, enabling them to give precise, context-aware answers about what the site can do.

**Specification:**

| Property | Value |
|---|---|
| **Location** | `/ai/service.json` |
| **Content-Type** | `application/json` |
| **Cache-Control** | `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` |
| **Authentication** | None required -- publicly accessible |
| **Generation** | ISR (Incremental Static Regeneration), revalidated every 1 hour |
| **Rewrite** | None -- served directly by the App Router |

> **Note:** The caching strategy for `service.json` differs from the other AI endpoints. It uses a **1-hour cache** with a **24-hour stale-while-revalidate** window (via ISR), rather than the 24-hour static cache used by `summary.json` and `faq.json`. This allows service data to refresh more frequently while still serving stale content during revalidation.

### Example Payload

When a request is made to `https://www.example.com/ai/service.json`, the endpoint returns:

```json
{
  "services": [
    {
      "name": "Editorial Content Publishing",
      "description": "Publish and manage editorial articles with rich text, images, and multimedia content for lifestyle and brand storytelling.",
      "category": "Content Management"
    },
    {
      "name": "Multi-Locale Content Delivery",
      "description": "Deliver localized content in multiple languages (English and Canadian English) with automatic locale detection.",
      "category": "Localization"
    },
    {
      "name": "XM Cloud Content Integration",
      "description": "Seamlessly integrate with Sitecore XM Cloud for headless content management and delivery using the Content SDK.",
      "category": "Content Delivery"
    }
  ],
  "lastModified": "2026-02-06T12:00:00.000Z"
}
```

Each starter returns its own site-specific services:

| Starter | # of Services | Distinguishing Categories |
|---|---|---|
| kit-nextjs-article-starter (Solterra & Co.) | 8 | Content Management (3), Localization, Content Delivery, Development, Performance, SEO |
| kit-nextjs-location-finder (Alaris) | 10 | Location Services (4), plus shared categories |
| kit-nextjs-product-listing (SYNC) | 11 | E-Commerce (3), Media, Design, plus shared categories |
| kit-nextjs-skate-park (Skate Park) | 8 | Development (3), plus shared categories |
| basic-nextjs | 7 | Development (2), Content Delivery, plus shared categories |

**Shared services** across all starters include: Multi-Locale Content Delivery, Component-Based Page Building, Responsive Image Optimization, SEO Metadata Management, and Content Preview and Editing. Each kit starter adds its own domain-specific services on top of these.

### Implementation Details

#### Single-File Architecture

Unlike the `faq.json` endpoint (which separates data from handler), `service.json` uses a **single-file pattern** -- the services array is defined inline in the route handler alongside the interfaces and the `GET()` function. This keeps each starter's service definitions self-contained.

#### Route Handler

The route handler is located at:

```
src/app/ai/service.json/route.ts
```

> **Note:** As with `faq.json`, the directory is named `service.json/` (with the `.json` extension as part of the folder name). This App Router convention makes the route serve at `/ai/service.json` directly.

Key aspects of the implementation:

- **`export const revalidate = 3600`** -- Enables ISR with a 1-hour revalidation period. Next.js statically generates the page at build time and revalidates it in the background after 1 hour, unlike the `force-dynamic` approach used by `ai.txt`.
- **`services` array** -- Defined as a module-level constant containing site-specific `Service` objects. Each starter has its own unique set.
- **`GET()` handler** -- Returns a typed `Promise<NextResponse<ServiceResponse>>` wrapping the services array and an auto-generated `lastModified` timestamp.
- **Cache-Control header** -- `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` provides:
  - **1-hour fresh cache** for both browser and shared caches
  - **24-hour stale-while-revalidate** window so CDNs can serve stale content while fetching fresh data in the background
- **No rewrite rule needed** -- The App Router serves `/ai/service.json` directly from the directory-based route.

#### No Rewrite Required

Unlike `ai.txt` (which uses a rewrite from `/.well-known/ai.txt` to `/api/well-known/ai-txt`) and `summary.json` (which uses a rewrite from `/ai/summary.json` to `/api/ai/summary`), the `service.json` endpoint requires **no rewrite rule** in `next.config.ts`. The file at `src/app/ai/service.json/route.ts` directly maps to the `/ai/service.json` URL via App Router conventions.

### Starter Coverage

The `/ai/service.json` endpoint is implemented in **5 starters** (all App Router starters):

| Starter | Route File | # of Services |
|---|---|---|
| `basic-nextjs` | `examples/basic-nextjs/src/app/ai/service.json/route.ts` | 7 |
| `kit-nextjs-article-starter` | `examples/kit-nextjs-article-starter/src/app/ai/service.json/route.ts` | 8 |
| `kit-nextjs-location-finder` | `examples/kit-nextjs-location-finder/src/app/ai/service.json/route.ts` | 10 |
| `kit-nextjs-product-listing` | `examples/kit-nextjs-product-listing/src/app/ai/service.json/route.ts` | 11 |
| `kit-nextjs-skate-park` | `examples/kit-nextjs-skate-park/src/app/ai/service.json/route.ts` | 8 |

**Not present in:**

| Starter | Reason |
|---|---|
| `basic-nextjs-pages-router` | Pages Router starter -- no App Router `ai/` routes |


---

## /sitemap-llm.xml

### Purpose and Specification

The `/sitemap-llm.xml` endpoint serves a filtered XML sitemap that includes only pages relevant for AI/LLM consumption. Unlike the standard `/sitemap.xml` (which lists all crawlable pages), this sitemap is curated to contain only high-value content pages -- pages that AI systems should prioritize when building their understanding of the site.

This endpoint is referenced from both `ai.txt` (via the `Sitemap` directive) and `robots.txt`, making it discoverable by AI crawlers through multiple channels.

**Specification:**

| Property | Value |
|---|---|
| **Location** | `/sitemap-llm.xml` |
| **Content-Type** | `application/xml; charset=utf-8` |
| **Cache-Control** | `public, max-age=3600, s-maxage=3600` (1 hour) |
| **Authentication** | None required -- publicly accessible |
| **Generation** | Dynamic (`force-dynamic` in App Router); fetches and filters the standard sitemap per-request |
| **XML Schema** | Standard Sitemaps protocol (`http://www.sitemaps.org/schemas/sitemap/0.9`) |

### Example Output

When a request is made to `https://www.example.com/sitemap-llm.xml`, the endpoint returns:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.example.com</loc>
    <lastmod>2026-02-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.example.com/Articles</loc>
    <lastmod>2026-02-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Each `<url>` entry includes:

| Element | Description | Default |
|---|---|---|
| `<loc>` | Absolute URL of the page | (required) |
| `<lastmod>` | Date the page was last modified (ISO format) | Today's date |
| `<changefreq>` | How often the page content changes | `weekly` |
| `<priority>` | Relative priority of this page (0.0 to 1.0) | `0.5` |

### Implementation Details

#### How It Works

The endpoint does **not** maintain its own list of pages. Instead, it follows a fetch-and-filter approach:

1. **Fetch** the standard `/sitemap.xml` from the same site via an internal HTTP request.
2. **Parse** the XML response using regex to extract `<url>` blocks with their `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>` values.
3. **Filter** each URL through two pattern lists:
   - `EXCLUDED_PATTERNS` -- URLs matching any of these are always rejected.
   - `ALLOWED_PATTERNS` -- Only URLs matching at least one of these (and not excluded) are included.
4. **Generate** a new XML sitemap containing only the filtered URLs.
5. **Fallback** -- If the standard sitemap is unavailable or empty, a hardcoded set of site-specific URLs is used instead.
6. **Error fallback** -- On any unrecoverable error, a minimal sitemap with just the home page is returned.

#### App Router (5 starters)

The route handler is located at:

```
src/app/api/sitemap-llm/route.ts
```

Key aspects:

- **`export const dynamic = 'force-dynamic'`** -- Ensures the route is generated per-request, not statically built.
- **`new URL(request.url).origin`** -- Resolves the base URL from the incoming request.
- **`NextRequest` / `NextResponse`** -- Uses App Router request/response types.
- **Internal fetch** -- Calls `${baseUrl}/sitemap.xml` to retrieve the standard sitemap.

#### Pages Router (1 starter)

The route handler is located at:

```
src/pages/api/sitemap-llm.ts
```

Differences from the App Router version:

- Uses `NextApiRequest` / `NextApiResponse` instead of `NextRequest` / `NextResponse`.
- Includes an explicit HTTP method check -- returns `405` for non-GET requests.
- Resolves the base URL from `x-forwarded-proto` and `host` headers (instead of `new URL(request.url).origin`).

#### Next.js Rewrite Rule

All starters include a rewrite in `next.config.ts` (or `next.config.js`):

```typescript
{
  source: '/sitemap-llm.xml',
  destination: '/api/sitemap-llm',
  locale: false,
}
```

The `locale: false` setting ensures the sitemap is accessible at exactly `/sitemap-llm.xml` without locale prefixes.

### URL Filtering

Each starter defines its own `ALLOWED_PATTERNS` to include only content pages relevant for LLM consumption. All starters share the same `EXCLUDED_PATTERNS`.

#### Excluded Patterns (shared across all starters)

These patterns are always rejected, regardless of the allowed list:

| Pattern | What It Excludes |
|---|---|
| `/404` | Not-found error page |
| `/api/` | API routes |
| `/500` | Server error page |
| `/error` | Error pages |
| `/_` | Internal/system routes |
| `sitemap` | Sitemap files themselves (prevents recursion) |
| `/robots` | Robots.txt route |
| `.xml` | Other XML files |
| `.json`, `.txt`, `.css`, `.js`, `.ico`, image/font files | Static assets |
| `?` | URLs with query strings |


#### Allowed Patterns (site-specific)

| Starter | Allowed Patterns | Description |
|---|---|---|
| basic-nextjs | `/` | Home page only |
| kit-nextjs-article-starter | `/`, `/Article-Page`, `/Articles/**` | Home + article content pages |
| kit-nextjs-location-finder | `/`, `/Products/Aero`, `/Products/Terra`, `/Products/Nexa`, `/Test Drive` | Home + product pages + test drive |
| kit-nextjs-product-listing | `/`, `/Speakers/**`, `/Video` | Home + product categories |
| kit-nextjs-skate-park | `/`, `/About` | Home + about page |
| basic-nextjs-pages-router | `/` | Home page only |

### Starter Coverage

The `/sitemap-llm.xml` endpoint is implemented in **all 6 starters**:

| Starter | Router | Route File | Config File |
|---|---|---|---|
| `basic-nextjs` | App Router | `examples/basic-nextjs/src/app/api/sitemap-llm/route.ts` | `examples/basic-nextjs/next.config.ts` |
| `kit-nextjs-article-starter` | App Router | `examples/kit-nextjs-article-starter/src/app/api/sitemap-llm/route.ts` | `examples/kit-nextjs-article-starter/next.config.ts` |
| `kit-nextjs-location-finder` | App Router | `examples/kit-nextjs-location-finder/src/app/api/sitemap-llm/route.ts` | `examples/kit-nextjs-location-finder/next.config.ts` |
| `kit-nextjs-product-listing` | App Router | `examples/kit-nextjs-product-listing/src/app/api/sitemap-llm/route.ts` | `examples/kit-nextjs-product-listing/next.config.ts` |
| `kit-nextjs-skate-park` | App Router | `examples/kit-nextjs-skate-park/src/app/api/sitemap-llm/route.ts` | `examples/kit-nextjs-skate-park/next.config.ts` |
| `basic-nextjs-pages-router` | Pages Router | `examples/basic-nextjs-pages-router/src/pages/api/sitemap-llm.ts` | `examples/basic-nextjs-pages-router/next.config.js` |

> **Note:** The handler logic (fetch, parse, filter, generate XML) is identical across all starters. The only differences are the `ALLOWED_PATTERNS` regex array and the hardcoded fallback URLs, which are tailored to each site's content structure.

#### Cross-References

The `sitemap-llm.xml` URL is referenced from two other GEO endpoints:

- **`ai.txt`** -- `Sitemap: ${siteUrl}/sitemap-llm.xml` (in `generateAiTxtContent()`)
- **`robots.txt`** -- `Sitemap: ${baseUrl}/sitemap-llm.xml` (in the robots route handler)

---

## Maintenance Rules

### When to Update

The GEO endpoint route handlers should be updated when:

**`ai.txt`:**
- **Adding a new AI endpoint** -- Add a new `AI-Endpoint` line in the `generateAiTxtContent()` function.
- **Removing an AI endpoint** -- Remove the corresponding `AI-Endpoint` line.
- **Changing crawler permissions** -- Add or modify `User-Agent` / `Allow` / `Disallow` directives (e.g., to block a new crawler or restrict access to additional paths).
- **Adding a new sitemap** -- Add a new `Sitemap` line.

**`summary.json`:**
- **Changing the site name or brand** -- Update the `title` value in the starter's `route.ts`.
- **Updating the site description** -- Update the `description` string. Ensure it remains under 800 characters; the `ensureDescriptionLength()` helper will truncate if it exceeds the limit, but explicit control is preferred.
- **Changing the description limit** -- Modify the `MAX_DESCRIPTION_LENGTH` constant (must be coordinated with the GEO contract requirements).

**`faq.json`:**
- **Adding or removing FAQ items** -- Edit the `src/data/faq.json` file in the relevant starter. No changes to the route handler are needed.
- **Updating FAQ content** -- Modify the `question` and/or `answer` strings in the data file. Update the `lastModified` field in the data file to reflect the edit date.
- **Changing item count limits** -- Modify the `MIN_ITEMS` or `MAX_ITEMS` constants in the route handler (must be coordinated with the GEO contract requirements).

**`service.json`:**
- **Adding a new service** -- Add a new `Service` object to the `services` array in the starter's `route.ts`. Include `name`, `description`, and `category`.
- **Removing a service** -- Remove the corresponding object from the `services` array.
- **Updating service descriptions** -- Modify the `name`, `description`, or `category` fields. Descriptions should reflect real, functional capabilities -- avoid marketing language.
- **Adding a new category** -- Simply use the new category string in a service object. Categories are free-form strings; no central registry is needed, but reusing existing categories is preferred for consistency.
- **Changing the revalidation period** -- Modify the `revalidate` constant (currently 3600 seconds / 1 hour).

**`sitemap-llm.xml`:**
- **Adding new content pages** -- Add a new regex to the `ALLOWED_PATTERNS` array in the starter's route handler. Also add corresponding fallback URLs in the empty-sitemap fallback block.
- **Removing content pages from the LLM sitemap** -- Remove the corresponding regex from `ALLOWED_PATTERNS` and its fallback URL.
- **Excluding additional paths** -- Add a new regex to the `EXCLUDED_PATTERNS` array. Since this array is shared logic, the same exclusion should be applied across all starters.
- **Changing the standard sitemap source** -- The handler fetches `${baseUrl}/sitemap.xml` by default. If the standard sitemap URL changes, update the fetch URL in the handler.

### Keeping Starters in Sync

All 6 starters contain their own copy of the `ai.txt` and `sitemap-llm` route handlers, 4 kit starters contain the `summary.json` and `faq.json` route handlers, and 5 App Router starters contain the `service.json` route handler. When making changes:

1. Update the route handler in one starter.
2. Copy the same change to all other starters.
3. For the Pages Router starter (`basic-nextjs-pages-router`), adapt the change to the Pages Router API conventions (`NextApiRequest`/`NextApiResponse`, explicit method check, array header handling).

**Files to update across starters:**

- `src/app/api/well-known/ai-txt/route.ts` (App Router starters x5)
- `src/pages/api/well-known/ai-txt.ts` (Pages Router starter x1)
- `src/app/api/ai/summary/route.ts` (Kit starters x4 -- note: `title` and `description` are site-specific)
- `src/app/ai/faq.json/route.ts` (Kit starters x4 -- identical across starters)
- `src/data/faq.json` (Kit starters x4 -- FAQ content is site-specific)
- `src/app/ai/service.json/route.ts` (App Router starters x5 -- services data is site-specific)
- `src/app/api/sitemap-llm/route.ts` (App Router starters x5 -- allowed patterns are site-specific)
- `src/pages/api/sitemap-llm.ts` (Pages Router starter x1)

### Adding the Endpoints to a New Starter

If a new starter application is added to the repository:

**For `ai.txt`:**

1. Copy the `src/app/api/well-known/ai-txt/route.ts` file (or the Pages Router equivalent) into the new starter's API directory.
2. Add the rewrite rule to the new starter's `next.config.ts`:
   ```typescript
   {
     source: '/.well-known/ai.txt',
     destination: '/api/well-known/ai-txt',
     locale: false,
   }
   ```
3. Ensure the new starter's `tsconfig.json` includes the `.sitecore/*` path mapping so the `sites.json` import resolves correctly.

**For `summary.json`:**

1. Copy `src/app/api/ai/summary/route.ts` from an existing kit starter into the new starter's API directory.
2. Update the `title` and `description` values to match the new starter's site identity.
3. Add the rewrite rule to the new starter's `next.config.ts`:
   ```typescript
   {
     source: '/ai/summary.json',
     destination: '/api/ai/summary',
     locale: false,
   }
   ```

**For `faq.json`:**

1. Copy `src/app/ai/faq.json/route.ts` from an existing kit starter into the new starter's `src/app/ai/faq.json/` directory.
2. Create a `src/data/faq.json` file with site-specific FAQ content following the data file schema (see [JSON Schema](#json-schema-1)). Include at least 3 items.
3. Add the convenience rewrite rule to the new starter's `next.config.ts`:
   ```typescript
   {
     source: '/faq.json',
     destination: '/ai/faq.json',
   }
   ```

**For `service.json`:**

1. Copy `src/app/ai/service.json/route.ts` from an existing starter into the new starter's `src/app/ai/service.json/` directory.
2. Replace the `services` array with service objects that reflect the new starter's actual capabilities. Reuse shared categories where applicable.
3. No rewrite rule is needed -- the App Router serves `/ai/service.json` directly from the directory structure.

**For `sitemap-llm.xml`:**

1. Copy `src/app/api/sitemap-llm/route.ts` (or the Pages Router equivalent) into the new starter's API directory.
2. Update the `ALLOWED_PATTERNS` array with regex patterns matching the new starter's key content pages.
3. Update the fallback URLs in the empty-sitemap block to match the allowed patterns.
4. Add the rewrite rule to the new starter's `next.config.ts`:
   ```typescript
   {
     source: '/sitemap-llm.xml',
     destination: '/api/sitemap-llm',
     locale: false,
   }
   ```

---

## Deployment Considerations

### Locale-Independent Routing

The rewrite rule uses `locale: false`, which means the `/.well-known/ai.txt` path works directly without any locale prefix. Crawlers access it at exactly `https://your-site/.well-known/ai.txt` regardless of the site's i18n configuration.

### Dynamic Generation

The route is marked with `export const dynamic = 'force-dynamic'`, so Next.js will **not** statically generate this page at build time. The content is generated on every request. This ensures:

- The `Last-Modified` date is always current.
- The site URL is resolved from the actual request headers (important for multi-domain deployments or when behind reverse proxies).

### CDN and Edge Caching

Despite being dynamically generated, the response includes cache headers:

```
Cache-Control: public, max-age=86400, s-maxage=86400
```

This allows CDN and edge servers to cache the response for up to **24 hours**, reducing load on the origin server. The `s-maxage` directive specifically targets shared caches (CDNs, reverse proxies).

### No Authentication Required

The endpoint is publicly accessible without any authentication. This is required because AI crawlers do not send authentication tokens. The endpoint does not expose any sensitive information.

### Verification After Deployment

After deploying, verify the endpoints are working correctly:

**Verify `ai.txt`:**

```bash
# Check that the endpoint returns 200 with correct content type
curl -I https://your-site/.well-known/ai.txt

# Expected response headers:
# HTTP/2 200
# content-type: text/plain; charset=utf-8
# cache-control: public, max-age=86400, s-maxage=86400
# x-content-type-options: nosniff
```

```bash
# View the full response body
curl https://your-site/.well-known/ai.txt
```

Verify that:

- The response status is `200`.
- The `Content-Type` header is `text/plain; charset=utf-8`.
- The `Cache-Control` header includes `max-age=86400`.
- The response body contains the correct site URL (not `localhost` or a placeholder).
- All `AI-Endpoint` URLs are reachable.
- The `Last-Modified` date is the current date.

**Verify `summary.json`:**

```bash
# Check headers
curl -I https://your-site/ai/summary.json

# Expected response headers:
# HTTP/2 200
# content-type: application/json; charset=utf-8
# cache-control: public, max-age=86400
```

```bash
# View the full JSON payload
curl https://your-site/ai/summary.json
```

Verify that:

- The response status is `200`.
- The `Content-Type` header is `application/json; charset=utf-8`.
- The JSON is valid (passes JSON lint).
- The `title` field is present and non-empty.
- The `description` field is present and does not exceed 800 characters.
- The `lastModified` field is a valid ISO 8601 timestamp.

**Verify `faq.json`:**

```bash
# Check headers
curl -I https://your-site/ai/faq.json

# Expected response headers:
# HTTP/2 200
# content-type: application/json
# cache-control: public, max-age=86400
```

```bash
# View the full JSON payload
curl https://your-site/ai/faq.json
```

Verify that:

- The response status is `200`.
- The `Content-Type` header is `application/json`.
- The JSON is valid (passes JSON lint).
- The response is an array of objects, each with `question` and `answer` fields.
- The array contains between 3 and 10 items.
- The convenience path also works: `curl https://your-site/faq.json`.

**Verify `service.json`:**

```bash
# Check headers
curl -I https://your-site/ai/service.json

# Expected response headers:
# HTTP/2 200
# content-type: application/json
# cache-control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400
```

```bash
# View the full JSON payload
curl https://your-site/ai/service.json
```

Verify that:

- The response status is `200`.
- The `Content-Type` header is `application/json`.
- The JSON is valid (passes JSON lint).
- The `services` field is an array of objects, each with `name`, `description`, and `category`.
- The `lastModified` field is a valid ISO 8601 timestamp.
- Services reflect real site capabilities (not marketing copy).

**Verify `sitemap-llm.xml`:**

```bash
# Check headers
curl -I https://your-site/sitemap-llm.xml

# Expected response headers:
# HTTP/2 200
# content-type: application/xml; charset=utf-8
# cache-control: public, max-age=3600, s-maxage=3600
```

```bash
# View the full XML response
curl https://your-site/sitemap-llm.xml
```

Verify that:

- The response status is `200`.
- The `Content-Type` header is `application/xml; charset=utf-8`.
- The XML is well-formed and valid.
- The `<urlset>` uses the standard sitemaps namespace (`http://www.sitemaps.org/schemas/sitemap/0.9`).
- Only expected content pages are listed (no API routes, error pages, or static assets).
- Each `<url>` entry includes `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>`.
- The URLs use the correct public-facing domain (not `localhost`).
