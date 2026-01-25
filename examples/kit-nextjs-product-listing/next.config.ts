import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',
  
  // Enable React Strict Mode
  reactStrictMode: true,

  // Disable the X-Powered-By header. Follows security best practices.
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Source maps configuration
  // Note: Enabling source maps in production can expose source code, but may be needed for debugging.
  // Set NEXT_PUBLIC_ENABLE_SOURCE_MAPS=true to enable (not recommended for production)
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_ENABLE_SOURCE_MAPS === 'true',

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edge*.**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'xmc-*.**',
        port: '',
      },
    ],
    // Optimize image sizes for responsive loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Disable image optimization in development to avoid upstream timeouts
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // use this configuration to serve the sitemap.xml and robots.txt files from the API route handlers
  rewrites: async () => {
    return [
      {
        source: '/sitemap:id([\\w-]{0,}).xml',
        destination: '/api/sitemap',
        locale: false,
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
        locale: false,
      },
    ];
  },

  // Security headers to mitigate XSS, clickjacking, and other attacks
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // Cross-Origin-Opener-Policy: Isolates the top-level window from other documents
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // X-Frame-Options: Prevents clickjacking by controlling frame embedding
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Content-Security-Policy: Comprehensive XSS, clickjacking, and DOM-based XSS protection
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://edge*.sitecorecloud.io https://xmc-*.sitecorecloud.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://edge*.sitecorecloud.io https://xmc-*.sitecorecloud.io https://*.sitecorecloud.io",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "require-trusted-types-for 'script'",
              "trusted-types default",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Additional security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
