# SEO Fixes Applied

This document outlines the SEO improvements made to address issues identified in PageSpeed Insights.

## Issues Fixed

### 1. Page Blocked from Indexing (robots.txt)

**Problem**: The robots.txt file was blocking search engine crawlers from indexing the site, resulting in a score of 58/100 for SEO.

**Solution**: 
- Modified `src/app/api/robots/route.ts` to check if Sitecore's robots.txt blocks indexing
- If blocking is detected, the route now returns a permissive robots.txt that allows indexing
- Added fallback to ensure indexing is always allowed even if Sitecore fails

**Files Modified**:
- `src/app/api/robots/route.ts`

**Implementation**:
```typescript
// Custom GET handler that ensures indexing is allowed
export async function GET(request: NextRequest) {
  // Checks if Sitecore's robots.txt blocks indexing
  // Returns permissive robots.txt if blocking detected
  // Includes sitemap reference
}
```

### 2. Links Without Descriptive Text

**Problem**: Multiple links throughout the site used generic "Learn More" text, which doesn't help search engines understand content context. This affects SEO and accessibility.

**Solution**:
- Created utility function `getDescriptiveLinkText()` in `src/utils/link-text.ts`
- Updated `ButtonComponent` to accept `contextTitle` prop for generating descriptive text
- Modified components to pass context titles when available
- Link text is now generated from:
  - Context title (e.g., article title, section heading)
  - URL path (extracted page name)
  - Link destination domain
  - Fallback to "Read article" instead of generic "Learn More"

**Files Created**:
- `src/utils/link-text.ts` - Utility functions for generating descriptive link text

**Files Modified**:
- `src/components/button-component/ButtonComponent.tsx` - Added `contextTitle` support to `ButtonBase` and `EditableButton`
- `src/components/vertical-image-accordion/VerticalImageAccordion.tsx` - Passes item title as context
- `src/components/article-listing/ArticleListing.tsx` - Passes section title as context
- `src/components/accordion-block/AccordionBlockDefault.dev.tsx` - Passes heading as context

**How It Works**:
1. Checks if link text is generic (e.g., "Learn More", "Read More", "Click Here")
2. If generic, generates descriptive text from context:
   - Uses surrounding title/heading: "Read about [Title]"
   - Extracts from URL: "Read [Page Name]"
   - Uses domain for external links: "Visit [domain]"
3. Preserves CMS text in editing mode
4. Only applies in production to improve SEO

## Benefits

1. **Improved SEO Score**: 
   - Robots.txt now allows indexing
   - Descriptive link text helps search engines understand content

2. **Better Accessibility**:
   - Descriptive link text is more accessible for screen readers
   - Users can understand link destinations without context

3. **Content Preservation**:
   - CMS content is preserved in editing mode
   - Only production builds get enhanced link text

## Testing

To verify the fixes:

1. **robots.txt**:
   - Visit `/robots.txt` on your site
   - Should see `Allow: /` directive
   - Should include sitemap reference

2. **Link Text**:
   - View source or inspect links in production build
   - Links with generic text should now have descriptive text
   - Check that context titles are being used correctly

## Notes

- The link text utility only enhances generic text - if content authors provide descriptive text, it's preserved
- Editing mode always shows CMS content as-is
- The robots.txt fix ensures indexing even if Sitecore configuration changes
