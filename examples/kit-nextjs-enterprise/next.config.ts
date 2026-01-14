import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Disable x-powered-by header to minimize fingerprinting
  poweredByHeader: false,

  // We need to redirect sitemap*.xml to the sitemap API route
  async rewrites() {
    return [
      {
        source: '/sitemap:path(.*).xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edge*.**',
      },
      {
        protocol: 'https',
        hostname: 'xmc-*.**',
      },
      {
        protocol: 'https',
        hostname: 'feaas*.blob.core.windows.net',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
