import Script from 'next/script';
import { schemaToJsonLd } from '@/utils/schema-org';

interface JsonLdScriptProps {
  id: string;
  schema: object;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
}

/**
 * Reusable component for adding JSON-LD structured data scripts
 * Uses Next.js Script component for optimal SEO and server-side rendering
 */
export function JsonLdScript({ id, schema, strategy = 'beforeInteractive' }: JsonLdScriptProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy={strategy}
      dangerouslySetInnerHTML={{ __html: schemaToJsonLd(schema) }}
    />
  );
}
