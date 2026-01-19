# Semantic HTML Checklist for kit-nextjs-article-starter

This document provides a comprehensive checklist for semantic HTML implementation and structured data (schema.org) usage in the kit-nextjs-article-starter application.

## Overview

Semantic HTML improves accessibility, SEO, and code maintainability by using HTML elements that convey meaning about the content structure. This checklist ensures consistent implementation across all components.

## Semantic HTML Tags

### ✅ `<article>`
**Purpose**: Represents a self-contained composition that could be distributed independently.

**Usage**:
- ✅ ArticleHeader component - wraps article content
- ✅ ArticleListing component - each article card uses `<article>`

**Implementation**:
```tsx
<article itemScope itemType="https://schema.org/Article">
  {/* Article content */}
</article>
```

**Checklist**:
- [x] ArticleHeader uses `<article>` tag
- [x] ArticleListing uses `<article>` for each article card
- [ ] Individual article pages use `<article>` for main content
- [ ] Blog posts use `<article>` wrapper

### ✅ `<aside>`
**Purpose**: Represents content that is tangentially related to the main content.

**Usage**:
- ✅ FooterNavigationCallout component - uses `<aside>` for supplementary content

**Implementation**:
```tsx
<aside>
  {/* Supplementary content like callouts, related links, etc. */}
</aside>
```

**Checklist**:
- [x] FooterNavigationCallout uses `<aside>`
- [ ] Sidebar components use `<aside>`
- [ ] Related content sections use `<aside>`
- [ ] Advertisement blocks use `<aside>`

### ✅ `<details>` and `<summary>`
**Purpose**: Creates a disclosure widget where information is visible only when the widget is toggled into an "open" state.

**Usage**:
- ⚠️ AccordionBlock uses custom Accordion component (consider native `<details>` for simple cases)

**Implementation**:
```tsx
<details>
  <summary>Question or heading</summary>
  <div>Answer or content</div>
</details>
```

**Checklist**:
- [ ] Simple accordions use native `<details>` and `<summary>`
- [x] Complex accordions (AccordionBlock) have FAQPage schema
- [ ] FAQ components use `<details>` and `<summary>`

### ✅ `<figure>` and `<figcaption>`
**Purpose**: Represents self-contained content, typically with a caption.

**Usage**:
- ✅ ImageBlock component - uses `<figure>` and `<figcaption>` for images with captions

**Implementation**:
```tsx
<figure>
  <ImageWrapper image={image} />
  <figcaption>
    <Text field={caption} />
  </figcaption>
</figure>
```

**Checklist**:
- [x] ImageBlock uses `<figure>` and `<figcaption>`
- [ ] MediaSection uses `<figure>` when captions are present
- [ ] Article images with captions use `<figure>`
- [ ] Video components with captions use `<figure>`

### ✅ `<footer>`
**Purpose**: Represents a footer for its nearest sectioning content or sectioning root element.

**Usage**:
- ✅ Layout.tsx - main page footer
- ✅ GlobalFooter component

**Checklist**:
- [x] Main page footer uses `<footer>`
- [x] GlobalFooter component uses `<footer>`
- [ ] Article footers use `<footer>` when present

### ✅ `<header>`
**Purpose**: Represents introductory content, typically a group of introductory or navigational aids.

**Usage**:
- ✅ Layout.tsx - main page header
- ✅ GlobalHeader component
- ✅ ArticleHeader component

**Checklist**:
- [x] Main page header uses `<header>`
- [x] GlobalHeader uses `<header>`
- [x] ArticleHeader uses `<header>`

### ✅ `<main>`
**Purpose**: Represents the dominant content of the body of a document.

**Usage**:
- ✅ Layout.tsx - main content area

**Checklist**:
- [x] Main content area uses `<main>`
- [ ] Only one `<main>` per page
- [ ] `<main>` contains the primary content

### ✅ `<mark>`
**Purpose**: Represents text which is marked or highlighted for reference or notation purposes.

**Usage**:
- ⚠️ Not currently implemented

**Implementation**:
```tsx
<mark>Highlighted text</mark>
```

**Checklist**:
- [ ] Search results highlight matching terms with `<mark>`
- [ ] Important inline highlights use `<mark>`
- [ ] Quoted text highlights use `<mark>`

### ✅ `<nav>`
**Purpose**: Represents a section of a page whose purpose is to provide navigation links.

**Usage**:
- ✅ GlobalHeader - mobile navigation uses `<nav>`
- ✅ Breadcrumbs component - wrapped in `<nav>`

**Implementation**:
```tsx
<nav aria-label="Breadcrumb">
  {/* Navigation links */}
</nav>
```

**Checklist**:
- [x] Breadcrumbs use `<nav>` with aria-label
- [x] GlobalHeader mobile menu uses `<nav>`
- [ ] Desktop navigation uses `<nav>`
- [ ] Footer navigation uses `<nav>`
- [ ] Pagination uses `<nav>`

### ✅ `<section>`
**Purpose**: Represents a generic standalone section of a document.

**Usage**:
- ✅ PageHeader component
- ✅ ArticleListing component
- ✅ AccordionBlock component

**Checklist**:
- [x] PageHeader uses `<section>`
- [x] ArticleListing uses `<section>`
- [x] AccordionBlock uses `<section>`
- [ ] Content sections use `<section>` with appropriate headings
- [ ] Each `<section>` should have a heading (h1-h6)

### ✅ `<summary>`
**Purpose**: Specifies a summary, caption, or legend for a `<details>` element's disclosure box.

**Usage**:
- ⚠️ See `<details>` above

**Checklist**:
- [ ] Used with `<details>` elements
- [ ] Provides clear, concise summary text

### ✅ `<time>`
**Purpose**: Represents a specific period in time.

**Usage**:
- ✅ ArticleHeader component - publication dates use `<time>`

**Implementation**:
```tsx
<time dateTime={isoDateString} itemProp="datePublished">
  {formattedDate}
</time>
```

**Checklist**:
- [x] ArticleHeader dates use `<time>` with `dateTime` attribute
- [ ] ArticleListing dates use `<time>`
- [ ] Event dates use `<time>`
- [ ] All dates include ISO 8601 `dateTime` attribute
- [ ] Relative dates (e.g., "2 days ago") still use `<time>` with `dateTime`

## Schema.org Structured Data (JSON-LD)

### ✅ Article Schema
**Purpose**: Describes a news article, blog post, or other article.

**Usage**:
- ✅ ArticleHeader component - generates Article schema

**Implementation**:
```tsx
import { StructuredData, generateArticleSchema } from '@/components/structured-data/StructuredData';

const articleSchema = generateArticleSchema({
  headline: 'Article Title',
  description: 'Article description',
  image: ['image-url.jpg'],
  datePublished: '2024-01-01T00:00:00Z',
  author: { name: 'Author Name' },
  url: 'https://example.com/article',
});

<StructuredData data={articleSchema} />
```

**Checklist**:
- [x] ArticleHeader generates Article schema
- [ ] Article pages include Article schema
- [ ] All required fields are present (headline, datePublished)
- [ ] Optional fields are included when available (author, image, etc.)

### ✅ FAQPage Schema
**Purpose**: Describes a page containing frequently asked questions.

**Usage**:
- ✅ AccordionBlock component - generates FAQPage schema

**Implementation**:
```tsx
import { StructuredData, generateFAQPageSchema } from '@/components/structured-data/StructuredData';

const faqSchema = generateFAQPageSchema({
  faqs: [
    { question: 'Question?', answer: 'Answer.' },
  ],
});

<StructuredData data={faqSchema} />
```

**Checklist**:
- [x] AccordionBlock generates FAQPage schema
- [ ] FAQ pages include FAQPage schema
- [ ] Each FAQ has both question and answer
- [ ] Answers are complete and meaningful

### ✅ Organization Schema
**Purpose**: Describes an organization such as a company, school, or NGO.

**Usage**:
- ✅ GlobalFooter component - generates Organization schema

**Implementation**:
```tsx
import { StructuredData, generateOrganizationSchema } from '@/components/structured-data/StructuredData';

const organizationSchema = generateOrganizationSchema({
  name: 'Company Name',
  url: 'https://example.com',
  logo: 'logo-url.png',
  sameAs: ['https://twitter.com/company', 'https://linkedin.com/company'],
});

<StructuredData data={organizationSchema} />
```

**Checklist**:
- [x] GlobalFooter generates Organization schema
- [ ] Organization name is accurate
- [ ] Logo URL is valid
- [ ] Social media links are included in `sameAs`

### ✅ BreadcrumbList Schema
**Purpose**: Describes a breadcrumb trail navigation.

**Usage**:
- ✅ Breadcrumbs component - generates BreadcrumbList schema

**Implementation**:
```tsx
import { StructuredData, generateBreadcrumbListSchema } from '@/components/structured-data/StructuredData';

const breadcrumbSchema = generateBreadcrumbListSchema({
  items: [
    { name: 'Home', url: '/', position: 1 },
    { name: 'Category', url: '/category', position: 2 },
  ],
});

<StructuredData data={breadcrumbSchema} />
```

**Checklist**:
- [x] Breadcrumbs generate BreadcrumbList schema
- [ ] Position numbers are sequential starting from 1
- [ ] URLs are absolute or relative paths
- [ ] Names match visible breadcrumb text

### ✅ Person Schema
**Purpose**: Describes a person.

**Usage**:
- ✅ ArticleHeader component - generates Person schema for authors

**Implementation**:
```tsx
import { StructuredData, generatePersonSchema } from '@/components/structured-data/StructuredData';

const personSchema = generatePersonSchema({
  name: 'John Doe',
  jobTitle: 'Senior Writer',
  image: 'author-photo.jpg',
  url: 'https://example.com/author/john-doe',
});

<StructuredData data={personSchema} />
```

**Checklist**:
- [x] ArticleHeader generates Person schema for authors
- [ ] Author pages include Person schema
- [ ] Person name is complete
- [ ] Job title is included when available

### ⚠️ Product Schema
**Purpose**: Describes a product.

**Status**: Not currently implemented

**Checklist**:
- [ ] Product pages include Product schema
- [ ] Product name, description, and price are included
- [ ] Product images are included
- [ ] Availability status is included

### ⚠️ Place Schema
**Purpose**: Describes a physical location.

**Status**: Not currently implemented

**Checklist**:
- [ ] Location pages include Place schema
- [ ] Address information is included
- [ ] Geographic coordinates are included when available
- [ ] Opening hours are included when applicable

## Component-Specific Checklist

### ArticleHeader
- [x] Uses `<article>` tag
- [x] Uses `<time>` for publication dates
- [x] Uses `<figure>` for featured image
- [x] Generates Article schema
- [x] Generates Person schema for authors
- [x] Uses `<header>` tag

### ArticleListing
- [x] Uses `<section>` tag
- [x] Each article card uses `<article>` tag
- [ ] Generates ItemList schema (optional enhancement)

### ImageBlock
- [x] Uses `<figure>` tag
- [x] Uses `<figcaption>` for captions
- [ ] Generates ImageObject schema (optional enhancement)

### AccordionBlock
- [x] Uses `<section>` tag
- [x] Generates FAQPage schema
- [ ] Consider native `<details>` for simple accordions

### GlobalFooter
- [x] Uses `<footer>` tag
- [x] Generates Organization schema
- [ ] Footer navigation uses `<nav>` tag

### GlobalHeader
- [x] Uses `<header>` tag
- [x] Mobile navigation uses `<nav>` tag
- [ ] Desktop navigation uses `<nav>` tag

### Breadcrumbs
- [x] Uses `<nav>` tag with aria-label
- [x] Generates BreadcrumbList schema

### FooterNavigationCallout
- [x] Uses `<aside>` tag

## General Best Practices

### Accessibility
- [ ] All semantic elements have appropriate ARIA labels when needed
- [ ] Headings follow proper hierarchy (h1 → h2 → h3, etc.)
- [ ] Landmark regions are properly identified
- [ ] Skip links are provided for main content

### SEO
- [ ] Structured data is validated using Google's Rich Results Test
- [ ] All required schema.org fields are present
- [ ] URLs in structured data are absolute
- [ ] Images in structured data have absolute URLs

### Code Quality
- [ ] Semantic HTML is used instead of generic `<div>` where appropriate
- [ ] HTML5 semantic elements are preferred over ARIA roles when possible
- [ ] Components are tested for semantic correctness
- [ ] Documentation is updated when semantic changes are made

## Validation Tools

### Structured Data Testing
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [JSON-LD Playground](https://json-ld.org/playground/)

### HTML Validation
- [W3C HTML Validator](https://validator.w3.org/)
- [WAVE Accessibility Evaluator](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Maintenance

This checklist should be reviewed and updated:
- When new components are added
- When semantic HTML standards change
- When schema.org types are updated
- During code reviews
- Quarterly as part of technical debt review

## Notes

- Some components use custom UI libraries (e.g., shadcn/ui Accordion) which may not use native semantic HTML. In these cases, we add structured data and ensure accessibility through ARIA attributes.
- The `<main>` tag should only appear once per page and contain the primary content.
- All dates should use the `<time>` element with a valid `dateTime` attribute in ISO 8601 format.
- Images with captions should always use `<figure>` and `<figcaption>`.

## Related Documentation

- [MDN Semantic HTML](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)
- [Schema.org Documentation](https://schema.org/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [HTML5 Semantic Elements](https://www.w3schools.com/html/html5_semantic_elements.asp)
