import Script from 'next/script';

interface JsonLdScriptProps {
  id: string;
  schema: Record<string, unknown>;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
}

/**
 * Safely serializes JSON-LD for embedding in a <script type="application/ld+json" /> tag.
 * Replaces `<` to avoid ending the script tag early (e.g. `</script>` injection).
 */
const schemaToJsonLd = (schema: Record<string, unknown>): string => {
  return JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
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

