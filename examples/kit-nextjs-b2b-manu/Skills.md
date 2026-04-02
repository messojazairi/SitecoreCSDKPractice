# Skills: This Starter (B2B Industrial Manufacturing)

## Purpose

This file provides a starter-specific capability view for the **kit-nextjs-b2b-manu** (B2B Industrial Manufacturing) app. Use it with the repository skills map to choose the right patterns for industrial product catalogs, service listings, dealer locators, and editor-safe components.

---

## Repository capability map

Use the repository-level skill areas as the primary capability reference:

**[Repository Skills (docs/Skills.md)](../../docs/Skills.md)**

---

## This starter in short

- **Focus:** B2B industrial manufacturing — product catalogs, service/solutions pages, dealer/distributor locators, technical specs, and enterprise content.
- **Router:** Next.js App Router (`src/app/`).
- **Route pattern:** Catch-all at `src/app/[site]/[locale]/[[...path]]/page.tsx`; pass `site` and `locale` into layout fetch. Uses next-intl; config in `src/i18n/`.
- **Capabilities:** All repo skill areas apply. Product catalog, industrial services, dealer locator, and any manufacturing-specific APIs or endpoints follow this starter's patterns — use this Skills file and the repo Skills together when working on manufacturing or catalog features.

---

## Starter-specific notes

Apply all **When to use**, **How to perform**, and **Hard rules** from the [Repository Skills](../../docs/Skills.md) (Component Registration, Data Strategy, Local Dev, Editing & Preview, Routing, Project Structure). In this starter only:

- **Product catalog / industrial listings:** Fetch catalog or layout data at the catch-all page; pass as props into listing components. Do not fetch catalog or layout inside child listing components. Use existing product and listing components and types; extend rather than replace.
- **Service and solutions pages:** Use this starter's content structures and field patterns; pass only serializable data to client components.
- **Dealer/distributor locator:** Leverage location search components for finding authorized distributors and service centers.
- **Component maps:** Use server map (`.sitecore/component-map.ts`) and client map (`.sitecore/component-map.client.ts`); register with the same name as in the layout.
- **Project structure:** `src/app/`, `src/components/`, `src/lib/`, `src/i18n/`; follow existing patterns for new manufacturing components.
- **Local dev:** Copy `.env.remote.example` to `.env.local` in this folder; set XM Cloud and any catalog/API values; run the dev server from this folder.

---

## Stop conditions (for this starter)

- App loads with connected XM Cloud content locally.
- Product catalog and service pages resolve and render from layout data.
- Manufacturing content and specifications display correctly; filtering/listing behavior matches starter patterns.
- New or updated components resolve from component maps without binding errors.
- Editing and preview remain functional for all components.

---

## Related

- [This starter's README](README.md)
- [Root README — How to run a starter locally](../../README.md#how-to-run-a-nextjs-starter-locally)
- [Root README — Getting started guide](../../README.md#getting-started-guide)
