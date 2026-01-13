import './globals.css';

import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/utils/schema-org';
import { JsonLdScript } from '@/components/schema-org/JsonLdScript';

const heading = localFont({
  src: [
    {
      path: '../assets/fonts/Boldonse-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

const body = IBM_Plex_Sans({
  weight: ['400', '500', '600'],
  variable: '--font-body',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
});

const accent = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  variable: '--font-accent',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Generate Organization and WebSite schemas
  const organizationSchema = generateOrganizationSchema({
    name: 'SYNC', // Default organization name, should be configurable via environment or Sitecore
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
    // logo and sameAs can be added from Sitecore configuration
  });

  const websiteSchema = generateWebSiteSchema({
    name: 'SYNC', // Default site name, should be configurable
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
    // searchUrlTemplate can be added if search functionality exists
  });

  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${accent.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Organization and WebSite Schema JSON-LD - injected into head automatically by Next.js */}
        <JsonLdScript id="organization-schema" schema={organizationSchema} strategy="beforeInteractive" />
        <JsonLdScript id="website-schema" schema={websiteSchema} strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
