import scConfig from 'sitecore.config';
import client from '@/lib/sitecore-client';

const SERVICE_GRAPHQL_TYPE = 'AIService';
const SERVICE_DATA_PATH_SUFFIX = '/Data/AI Config/Services';
const MAX_CHILDREN = 30;

export interface ServiceItem {
  name: string;
  description: string;
  category: string;
}

/**
 * Experience Edge returns jsonValue as a JSON scalar — either { value: "..." } or a plain string.
 */
interface EdgeFieldValue {
  jsonValue?: { value?: string } | string;
}

interface ServiceChildResult {
  name?: string;
  description?: EdgeFieldValue;
  category?: EdgeFieldValue;
}

interface ServiceQueryResult {
  item?: {
    children?: {
      results?: ServiceChildResult[];
    };
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
 * Builds a GraphQL query to fetch Service children from Experience Edge.
 * @param fragmentType - GraphQL type name for service items (e.g. AIService)
 * @returns GraphQL query string
 */
function buildServiceQuery(fragmentType: string): string {
  return `
    query ServiceQuery($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        children(first: ${MAX_CHILDREN}) {
          results {
            ... on ${fragmentType} {
              name
              description { jsonValue }
              category { jsonValue }
            }
          }
        }
      }
    }
  `;
}

/**
 * Builds the Services content path from the default site name.
 * Pattern: /sitecore/content/alaris/{siteName}/Data/AI Config/Services
 */
function buildServicePath(): string {
  const siteName = scConfig.defaultSite || process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || '';
  if (!siteName) return '';
  return `/sitecore/content/alaris/${siteName}${SERVICE_DATA_PATH_SUFFIX}`;
}

/**
 * Fetches service items from Experience Edge via GraphQL using SitecoreClient.getData.
 * Derives the content path from the configured site name (NEXT_PUBLIC_DEFAULT_SITE_NAME).
 *
 * @returns Array of { name, description, category } with non-empty values; empty array on failure
 */
export async function fetchServicesFromEdge(): Promise<ServiceItem[]> {
  const path = buildServicePath();
  if (!path) return [];

  const language = scConfig.defaultLanguage || 'en';

  try {
    const result = await client.getData<ServiceQueryResult>(
      buildServiceQuery(SERVICE_GRAPHQL_TYPE),
      { path, language }
    );

    return (result?.item?.children?.results ?? [])
      .map((child) => ({
        name: (child?.name ?? '').trim(),
        description: extractFieldValue(child?.description),
        category: extractFieldValue(child?.category),
      }))
      .filter((item) => item.name && item.description);
  } catch (error) {
    console.error('[fetchServicesFromEdge] GraphQL request failed:', error);
    return [];
  }
}
