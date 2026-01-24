import Script from 'next/script';

interface JsonLdScriptProps {
  id: string;
  schema: Record<string, unknown>;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
}

const schemaToJsonLd = (schema: Record<string, unknown>): string => {
  return JSON.stringify(schema, null, 2);
};

/**
 * Reusable component for adding JSON-LD structured data scripts.
 * Uses Next.js Script for consistent injection behavior.
 */
export function JsonLdScript({ id, schema, strategy = 'beforeInteractive' }: JsonLdScriptProps) {
  if (!schema || Object.keys(schema).length === 0) return null;

  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy={strategy}
      dangerouslySetInnerHTML={{ __html: schemaToJsonLd(schema) }}
    />
  );
}

