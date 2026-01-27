import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  // Prevent Next.js from bundling @swc/core and its native .node bindings (used by next-intl's
  // extractor). Otherwise webpack tries to parse the binary and fails with "no loaders configured".
  serverExternalPackages: ['@swc/core'],

  // Enable React Strict Mode
  reactStrictMode: true,

  // Disable the X-Powered-By header. Follows security best practices.
  poweredByHeader: false,

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

  // Webpack configuration to prevent Node.js modules from being bundled on the client,
  // and to externalize @swc/core native bindings on the server (used by next-intl's extractor).
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize @swc/core and its platform-specific .node packages so webpack does not
      // try to parse the native binary. next-intl's extractor pulls these in during build.
      const externals = config.externals ?? [];
      config.externals = [
        ...externals,
        ({ request }, callback: (err?: Error | null, result?: string) => void) => {
          if (request && /^@swc\/core(-|$)/.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        path: false,
      };
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);