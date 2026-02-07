import { NextResponse } from 'next/server';

/** Default cache max-age for AI JSON endpoints (24 hours) */
const DEFAULT_MAX_AGE = 86400;

/**
 * Options for AI JSON API responses.
 */
export interface AiJsonResponseOptions {
  /** Cache max-age in seconds. Default 86400 (24h). */
  maxAge?: number;
  /** HTTP status. Default 200. */
  status?: number;
  /** Optional s-maxage for shared caches. */
  sMaxAge?: number;
  /** Optional stale-while-revalidate in seconds. */
  staleWhileRevalidate?: number;
}

/**
 * Builds a Cache-Control value for AI JSON endpoints.
 * @param maxAge - max-age in seconds
 * @param options - optional s-maxage and stale-while-revalidate
 * @returns Cache-Control header value
 */
function buildCacheControl(
  maxAge: number,
  options?: { sMaxAge?: number; staleWhileRevalidate?: number }
): string {
  const parts = [`public`, `max-age=${maxAge}`];
  if (options?.sMaxAge != null) parts.push(`s-maxage=${options.sMaxAge}`);
  if (options?.staleWhileRevalidate != null)
    parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  return parts.join(', ');
}

/**
 * Returns a JSON response for AI endpoints with consistent headers.
 * Use for /ai/*.json routes so crawlers and GEO/AEO get uniform Content-Type and caching.
 *
 * @param data - Serializable payload (object or array)
 * @param options - Optional maxAge, status, sMaxAge, staleWhileRevalidate
 * @returns NextResponse with application/json and Cache-Control
 */
export function aiJsonResponse<T>(
  data: T,
  options?: AiJsonResponseOptions
): NextResponse {
  const maxAge = options?.maxAge ?? DEFAULT_MAX_AGE;
  const status = options?.status ?? 200;
  const cacheControl = buildCacheControl(maxAge, {
    sMaxAge: options?.sMaxAge,
    staleWhileRevalidate: options?.staleWhileRevalidate,
  });

  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
    },
  });
}
