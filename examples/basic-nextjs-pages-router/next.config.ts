import path from 'path';
import type { NextConfig } from 'next';

// Package "exports" for @sitecore-content-sdk/nextjs/component-props-loader points at a file
// that is not shipped; the root shim loads dist/cjs/tools/component-props.loader instead.
const componentPropsLoader = path.join(
  process.cwd(),
  'node_modules',
  '@sitecore-content-sdk',
  'nextjs',
  'component-props-loader.js'
);

const nextConfig: NextConfig = {
  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  i18n: {
    locales: ['en'],
    defaultLocale:
      process.env.DEFAULT_LANGUAGE || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  },

  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'edge*.**', port: '' },
      { protocol: 'https', hostname: 'xmc-*.**', port: '' },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  rewrites: async () => [
    { source: '/healthz', destination: '/api/healthz' },
    { source: '/robots.txt', destination: '/api/robots' },
    { source: '/llms.txt', destination: '/api/llms-txt' },
    { source: '/sitemap.xml', destination: '/api/sitemap' },
    { source: '/sitemap-:id(\\d+).xml', destination: '/api/sitemap' },
    { source: '/.well-known/ai.txt', destination: '/api/well-known/ai-txt' },
    { source: '/sitemap-llm.xml', destination: '/api/sitemap-llm' },
    { source: '/feaas-render', destination: '/api/editing/feaas/render' },
  ],

  // Turbopack ignores this hook. Content SDK relies on this webpack loader to strip
  // getComponentServerProps from client bundles; keep `next build --webpack` until the SDK supports Turbopack.
  webpack: (config, options) => {
    if (!options.isServer) {
      config.module.rules.unshift({
        test: /src[/\\]components[/\\].*\.tsx$/,
        use: [componentPropsLoader],
      });
    } else {
      config.externals = [
        {
          '@sitecore-feaas/clientside/react': 'commonjs @sitecore-feaas/clientside/react',
          '@sitecore/byoc': 'commonjs @sitecore/byoc',
          '@sitecore/byoc/react': 'commonjs @sitecore/byoc/react',
        },
        ...(config.externals as []),
      ];
    }
    return config;
  },

  // No sass-alias here: import-map loads this module on the client; sass-alias pulls in `fs`.
  // loadPaths cover bootstrap, optional SXA-style folders, and font-awesome.
  sassOptions: {
    loadPaths: [
      path.join(process.cwd(), 'node_modules'),
      path.join(process.cwd(), 'src/assets'),
      path.join(process.cwd(), 'src/assets/globals'),
      path.join(process.cwd(), 'node_modules/font-awesome'),
    ],
    quietDeps: true,
    silenceDeprecations: ['import', 'legacy-js-api'],
  },
};

export default nextConfig;
