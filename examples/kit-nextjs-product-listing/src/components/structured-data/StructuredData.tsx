import { JSX } from 'react';
import { JsonLdValue, toJsonLdString } from '@/lib/structured-data/jsonld';

type StructuredDataProps = {
  /**
   * A stable id prevents duplicate JSON-LD nodes when the same component
   * can be rendered multiple times (e.g. editing / layout variations).
   */
  id: string;
  data: JsonLdValue;
};

/**
 * Component to render JSON-LD structured data
 * @param id - Unique identifier to prevent duplicate nodes
 * @param data - The structured data object to render as JSON-LD
 */
export function StructuredData({ id, data }: StructuredDataProps): JSX.Element {
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return <></>;
  }

  return (
    <script
      id={id}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: toJsonLdString(data) }}
    />
  );
}
