import { JSX } from 'react';
import { JsonLdValue, toJsonLdString } from 'src/lib/structured-data/jsonld';

type StructuredDataProps = {
  /**
   * A stable id prevents duplicate JSON-LD nodes when the same component
   * can be rendered multiple times (e.g. editing / layout variations).
   */
  id: string;
  data: JsonLdValue;
};

export default function StructuredData({ id, data }: StructuredDataProps): JSX.Element {
  return (
    <script
      id={id}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: toJsonLdString(data) }}
    />
  );
}

