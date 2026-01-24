import './globals.css';

import { JsonLdScript } from '@/components/structured-data/JsonLdScript';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/components/structured-data/schema-generators';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // Site-wide schemas: Organization + WebSite (injected once per page)
  const organizationSchema = generateOrganizationSchema({
    name: 'Solterra & Co.',
    url: baseUrl || undefined,
  });

  const webSiteSchema = baseUrl
    ? generateWebSiteSchema({
        name: 'Solterra & Co.',
        url: baseUrl,
      })
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <JsonLdScript id="organization-schema" schema={organizationSchema} strategy="beforeInteractive" />
        {webSiteSchema && (
          <JsonLdScript id="website-schema" schema={webSiteSchema} strategy="beforeInteractive" />
        )}
        {children}
      </body>
    </html>
  );
}
