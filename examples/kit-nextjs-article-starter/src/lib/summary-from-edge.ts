import scConfig from 'sitecore.config';
import client from '@/lib/sitecore-client';

const SUMMARY_GRAPHQL_TYPE = 'AISummary';
const SUMMARY_DATA_PATH_SUFFIX = '/Data/AI Config/Summary';

export interface SummaryItem {
  title: string;
  description: string;
}

/**
 * Experience Edge returns jsonValue as a JSON scalar — either { value: "..." } or a plain string.
 */
interface EdgeFieldValue {
  jsonValue?: { value?: string } | string;
}

interface SummaryQueryResult {
  item?: {
    title?: EdgeFieldValue;
    description?: EdgeFieldValue;
  };
}

/**
 * Extracts the string value from an Experience Edge field's jsonValue scalar.
 * @param field - Edge field containing a jsonValue property
 * @returns trimmed string value, or empty string if not available
 */
function extractFieldValue(field?: EdgeFieldValue): string {
  if (!field || field.jsonValue == null) return '';
  const jv = field.jsonValue;
  if (typeof jv === 'string') return jv.trim();
  if (typeof jv === 'object' && 'value' in jv && typeof jv.value === 'string') {
    return jv.value.trim();
  }
  return '';
}

/**
 * Builds a GraphQL query to fetch the Summary item from Experience Edge.
 * Unlike FAQ/Service queries, this fetches a single item's fields directly (no children).
 * @param fragmentType - GraphQL type name for the summary item (e.g. AISummary)
 * @returns GraphQL query string
 */
function buildSummaryQuery(fragmentType: string): string {
  return `
    query SummaryQuery($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        ... on ${fragmentType} {
          title { jsonValue }
          description { jsonValue }
        }
      }
    }
  `;
}

/**
 * Builds the Summary content path from the default site name.
 * Pattern: /sitecore/content/solterra/{siteName}/Data/AI Config/Summary
 */
function buildSummaryPath(): string {
  const siteName = scConfig.defaultSite || process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || '';
  if (!siteName) return '';
  return `/sitecore/content/solterra/${siteName}${SUMMARY_DATA_PATH_SUFFIX}`;
}

/**
 * Fetches the summary item from Experience Edge via GraphQL using SitecoreClient.getData.
 * Derives the content path from the configured site name (NEXT_PUBLIC_DEFAULT_SITE_NAME).
 *
 * @returns { title, description } if found; null on failure or missing data
 */
export async function fetchSummaryFromEdge(): Promise<SummaryItem | null> {
  const path = buildSummaryPath();
  if (!path) return null;

  const language = scConfig.defaultLanguage || 'en';

  try {
    const result = await client.getData<SummaryQueryResult>(
      buildSummaryQuery(SUMMARY_GRAPHQL_TYPE),
      { path, language }
    );

    if (!result?.item) return null;

    const title = extractFieldValue(result.item.title);
    const description = extractFieldValue(result.item.description);

    if (!title && !description) return null;

    return { title, description };
  } catch (error) {
    console.error('[fetchSummaryFromEdge] GraphQL request failed:', error);
    return null;
  }
}
