# Source Maps Configuration Explained

## What is `productionBrowserSourceMaps`?

`productionBrowserSourceMaps` is a Next.js configuration option that controls whether source maps are generated for **production builds only**.

## How It Works

### Current Configuration

```typescript
productionBrowserSourceMaps: process.env.GENERATE_SOURCEMAP === 'true',
```

This setting:
- **Only affects production builds** (`next build`)
- **Does NOT affect development** (`next dev`)
- Is controlled by the `GENERATE_SOURCEMAP` environment variable
- Defaults to `false` if the environment variable is not set

### Development Environment

**You do NOT need to set this for dev environments.**

In development mode (`next dev`):
- Source maps are **always enabled** by default
- You get full debugging capabilities automatically
- Stack traces show original source code locations
- No configuration needed

### Production Environment

In production builds (`next build`):
- Source maps are **disabled by default** (for performance and security)
- Setting `productionBrowserSourceMaps: true` enables them
- This increases build time and bundle size
- But improves debugging in production

## When to Enable Source Maps in Production

### ✅ Enable When:
- You need to debug production issues
- PageSpeed Insights recommends source maps
- You want better error tracking (e.g., Sentry, LogRocket)
- You're in a staging/preview environment

### ❌ Disable When:
- You want faster builds
- You want smaller bundle sizes
- Security is a concern (source maps expose source code structure)
- You're in a production environment where debugging isn't needed

## How to Use

### Option 1: Environment Variable (Current Setup)

```bash
# Enable source maps for production build
GENERATE_SOURCEMAP=true npm run build

# Disable (default)
npm run build
```

### Option 2: Always Enable

```typescript
// next.config.ts
productionBrowserSourceMaps: true,
```

### Option 3: Always Disable

```typescript
// next.config.ts
productionBrowserSourceMaps: false,
```

## Trade-offs

### Benefits:
- ✅ Better error messages in production
- ✅ Easier debugging of production issues
- ✅ Better integration with error tracking services
- ✅ Satisfies PageSpeed Insights recommendations

### Costs:
- ❌ Increases build time (can add 20-50% to build duration)
- ❌ Increases bundle size (source map files are large)
- ❌ Exposes source code structure (security consideration)
- ❌ Additional storage/bandwidth for `.map` files

## Security Considerations

Source maps can reveal:
- File structure and organization
- Variable names and function names
- Code comments
- Internal logic

**Best Practice**: 
- Use `hidden-source-map` type if you need source maps but don't want them publicly accessible
- Only enable in staging/preview environments
- Use environment variables to control per-deployment

## Example: Hidden Source Maps

If you want source maps for error tracking but don't want them publicly accessible:

```typescript
// next.config.ts
productionBrowserSourceMaps: process.env.GENERATE_SOURCEMAP === 'true',
```

Then configure your build tool (e.g., webpack) to use `hidden-source-map`:

```typescript
// This would require custom webpack config
webpack: (config, { dev, isServer }) => {
  if (!dev && !isServer && process.env.GENERATE_SOURCEMAP === 'true') {
    config.devtool = 'hidden-source-map';
  }
  return config;
}
```

## Summary

| Environment | Source Maps | Configuration Needed |
|------------|-------------|---------------------|
| Development (`next dev`) | ✅ Always enabled | ❌ None |
| Production (`next build`) | ❌ Disabled by default | ✅ Set `productionBrowserSourceMaps: true` or use env var |

**Answer**: You do NOT need to set `productionBrowserSourceMaps` for dev environments. It only affects production builds, and development always has source maps enabled.
