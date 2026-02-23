import scConfig from 'sitecore.config';
import client from '@/lib/sitecore-client';

const FAQ_GRAPHQL_TYPE = 'AIFAQItem';
const FAQ_DATA_PATH_SUFFIX = '/Data/AI Config/FAQ';
const MAX_CHILDREN = 20;

export interface FaqItem {
  question: string;
  answer: string;
}

interface EdgeFieldValue {
  jsonValue?: { value?: string } | string;
}

interface FaqChildResult {
  question?: EdgeFieldValue;
  answer?: EdgeFieldValue;
}

interface FaqQueryResult {
  item?: {
    children?: {
      results?: FaqChildResult[];
    };
  };
}

function extractFieldValue(field?: EdgeFieldValue): string {
  if (!field || field.jsonValue == null) return '';
  const jv = field.jsonValue;
  if (typeof jv === 'string') return jv.trim();
  if (typeof jv === 'object' && 'value' in jv && typeof jv.value === 'string') {
    return jv.value.trim();
  }
  return '';
}

function buildFaqQuery(fragmentType: string): string {
  return `
    query FaqQuery($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        children(first: ${MAX_CHILDREN}) {
          results {
            ... on ${fragmentType} {
              question { jsonValue }
              answer { jsonValue }
            }
          }
        }
      }
    }
  `;
}

function buildFaqPath(): string {
  const siteName = scConfig.defaultSite || process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || '';
  if (!siteName) return '';
  return `/sitecore/content/solterra/${siteName}${FAQ_DATA_PATH_SUFFIX}`;
}

export async function fetchFaqFromEdge(): Promise<FaqItem[]> {
  const path = buildFaqPath();
  if (!path) return [];

  const language = scConfig.defaultLanguage || 'en';

  try {
    const result = await client.getData<FaqQueryResult>(
      buildFaqQuery(FAQ_GRAPHQL_TYPE),
      { path, language }
    );

    return (result?.item?.children?.results ?? [])
      .map((child) => ({
        question: extractFieldValue(child?.question),
        answer: extractFieldValue(child?.answer),
      }))
      .filter((item) => item.question && item.answer);
  } catch (error) {
    console.error('[fetchFaqFromEdge] GraphQL request failed:', error);
    return [];
  }
}
