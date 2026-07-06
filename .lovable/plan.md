
# Phase 1C — Product CMS Foundation

## Repository findings

- Working tree matches the Phase 1A deliverable. No `foundation-phase-main/` overlay needed.
- `src/lib/products.ts` already exports the full hardened `Product` contract (identity, copy, specs, media, documents, FAQ, related, SEO, status, CMS metadata) plus 5 categories / 38 records, all currently identity-only.
- `docs/005_PRODUCT_MODEL.md` is complete and authoritative for the schema; Phase 1C must consume it, not redefine it.
- Routes are flat under `src/routes/`: `__root.tsx`, `index.tsx`, `$lang.tsx` (layout), `$lang.index.tsx`, `$lang.products.index.tsx`, `$lang.products.$category.index.tsx`, `$lang.products.$category.$product.tsx`, `$lang.spare-parts.tsx`. No admin namespace yet.
- shadcn/ui primitives present: button, input, label, textarea, form, table, sonner, dialog, tabs, badge, card, select, etc. — enough to build admin screens without new deps.
- No backend, no auth, no Cloud — and Phase 1C must not introduce any of these.

## Architecture findings

- Today, products are a static in-module catalog (`CATEGORIES`) read via `getCategory` / `getProduct`. Public pages import these directly. That is a hard dependency on the array shape, which will block any future swap to a real CMS.
- No repository/service indirection exists. No validation layer. No CMS write path. No status filtering — every record renders, regardless of `status`.
- Uploaded `PRODUCTS_MASTER.txt` / `PRODUCT_CATEGORIES.txt` / `SEO_Information.txt` contain rich Persian product copy + specs that map cleanly onto the existing schema. They will become CMS seed data later. **Per constraints, none of that content is shipped to the public site in 1C** — it stays as schema/CMS plumbing only.

## Risks

- **R1 — Public-page coupling.** Pages call `getProduct` directly. If we don't introduce a thin read adapter that goes through the repository, the future CMS swap touches every page. Mitigation: re-implement `getCategory` / `getProduct` as thin wrappers over `ProductRepository` (in-memory adapter) — same signatures, no behavior change, full backward compat.
- **R2 — `status` field is unused.** Public reads currently surface drafts/archived if any are added. Mitigation: repository's public methods filter to `status !== "archived"` and `status !== "draft"` (treating `undefined` as published to preserve current behavior); admin methods see everything.
- **R3 — Mock writes look real.** A mock repository with `create/update/archive/publish` could mislead operators. Mitigation: in-memory only, banner on every admin screen reading "Mock CMS — changes are not persisted", no network calls.
- **R4 — Admin routes exposed.** `/admin/*` placeholders ship to production. Mitigation: `noindex` meta on admin routes, a clear in-page notice, no links from public navigation, no real data mutation surface.
- **R5 — Validation drift from schema.** A hand-written validator can fall out of sync with `Product`. Mitigation: validators live next to the schema in `src/lib/products/validation.ts`, return typed `ValidationResult`, and are unit-shaped to mirror the Prisma model documented in `005`.
- **R6 — Future Prisma mismatch.** Repository interface must read like a Prisma repository, not like the static array. Mitigation: async methods returning `Promise<...>`, paginated list shape, and explicit DTOs for create/update so a Nest service can implement the same interface verbatim.

## Implementation plan

### 1. Repository abstraction (`src/lib/products/`)

New folder for CMS-facing modules (keeps `src/lib/products.ts` untouched as the public catalog source until the in-memory adapter is wired in):

- `src/lib/products/types.ts` — re-exports `Product`, plus CMS-only DTOs: `ProductListQuery`, `ProductListResult`, `CreateProductInput`, `UpdateProductInput`, `ValidationResult`, `ValidationIssue`.
- `src/lib/products/repository.ts` — `ProductRepository` interface:
  ```ts
  interface ProductRepository {
    list(q?: ProductListQuery): Promise<ProductListResult>;
    getBySlug(category: ProductCategoryKey, slug: string): Promise<Product | null>;
    getById(cmsId: string): Promise<Product | null>;
    create(input: CreateProductInput): Promise<Product>;
    update(cmsId: string, input: UpdateProductInput): Promise<Product>;
    archive(cmsId: string): Promise<Product>;
    publish(cmsId: string): Promise<Product>;
    unpublish(cmsId: string): Promise<Product>; // -> draft
  }
  ```
  All methods async, designed to be implementable by a future Nest/Prisma service.
- `src/lib/products/in-memory-repository.ts` — sole implementation in 1C. Seeds from existing `CATEGORIES`, generates `cmsId` for seeded records, holds state in a module-level `Map`. Lives only in the browser tab; reloads reset. No persistence.
- `src/lib/products/index.ts` — exports `productRepository` (singleton instance of the in-memory adapter) plus a `publicProductsAdapter` with the existing sync `getCategory` / `getProduct` signatures, so public pages don't change.
- `src/lib/products.ts` — re-export the new `publicProductsAdapter` helpers so existing imports keep working unchanged. No deletion. No schema edit.

### 2. Validation layer (`src/lib/products/validation.ts`)

- `validateProduct(input): ValidationResult` with sub-validators: `validateIdentity`, `validateDescription`, `validateSpecifications`, `validateDocuments`, `validateSEO`, `validateFAQ`, `validateRelated`.
- No new dependencies (no zod) — keep it dependency-free and Prisma-compatible. Issues shaped as `{ path: string[]; code: string; message: string }`.
- Rules drawn directly from `005_PRODUCT_MODEL.md` (slug regex, required `name`, valid category key, unique spec group keys, document `kind` enum, related ref consistency, ISO timestamps, SEO length caps).

### 3. Admin routes (placeholders, mock-only)

- `src/routes/admin.tsx` — pathless layout: shell with sidebar, "Mock CMS" banner, `noindex,nofollow` meta, no auth.
- `src/routes/admin.index.tsx` — redirects to `/admin/products`.
- `src/routes/admin.products.index.tsx` — Product List: table from `productRepository.list()` with search by slug/name, filter by category, filter by status, columns: name, code, category, status, updatedAt. Row actions: Edit, Preview, Publish/Unpublish, Archive.
- `src/routes/admin.products.new.tsx` — Create form (identity + description + status). Calls `productRepository.create`. On success → redirect to edit screen.
- `src/routes/admin.products.$id.tsx` — Edit screen using Tabs: Identity, Copy, Specifications, Media (refs only), Documents (refs only), FAQ, Related, SEO. Each tab edits the slice it owns, runs the matching validator on submit, calls `productRepository.update`.
- `src/routes/admin.products.$id.preview.tsx` — Read-only preview rendering the same conditional sections as the public product page (image-less if no refs), so editors can see what publishes.

All admin screens use existing shadcn primitives. No design tokens added.

### 4. CMS navigation

- Admin layout sidebar with: Products (active), Articles (disabled badge "Phase 1B"), Media (disabled badge "later"), Settings (disabled).
- No link from public nav to `/admin`. Direct URL access only.

### 5. Documentation

- Create `docs/006_PRODUCT_CMS.md`:
  - CMS architecture overview (frontend-only Phase 1C → Nest/Prisma Phase 2).
  - Repository contract + DTOs (mirrors `repository.ts`).
  - Validation rules table.
  - Admin workflow diagrams (ASCII): Create → Draft → Publish → Archive, Edit cycle, Preview path.
  - Migration path to NestJS: how a `ProductsService` implements `ProductRepository` 1:1.
  - Migration path to Prisma: maps each DTO field to the Prisma model from `005_PRODUCT_MODEL.md §6`.
  - Future media integration notes: `ProductImage.src` resolution via signed S3 URLs, document upload flow, CDN considerations. Explicitly out of scope for 1C.
- Append Phase 1C entry to `docs/# 004_PROJECT_CONTEXT.md`; bump Last Updated.

### 6. Out of scope (do not touch)

- `src/lib/products.ts` Product schema, `CATEGORIES` data, existing route files, public components, design tokens, i18n public API, SEO helpers, root layout, navigation, hero, footer, lead capture.
- No real product images, no PDFs, no fake content. The uploaded `PRODUCTS_MASTER.txt` etc. are NOT imported in 1C — they are reserved for a future seed migration.
- No auth, no Cloud, no Prisma, no NestJS code, no S3, no Meilisearch, no PostHog, no article CMS, no media uploader, no dashboard analytics.

## File map

**Created**
- `src/lib/products/types.ts`
- `src/lib/products/repository.ts`
- `src/lib/products/in-memory-repository.ts`
- `src/lib/products/validation.ts`
- `src/lib/products/index.ts`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/mock-cms-banner.tsx`
- `src/components/admin/product-form/*` (identity, copy, specifications, documents, media, faq, related, seo tab components)
- `src/routes/admin.tsx`
- `src/routes/admin.index.tsx`
- `src/routes/admin.products.index.tsx`
- `src/routes/admin.products.new.tsx`
- `src/routes/admin.products.$id.tsx`
- `src/routes/admin.products.$id.preview.tsx`
- `docs/006_PRODUCT_CMS.md`

**Modified**
- `src/lib/products.ts` — internal helpers now re-export from `src/lib/products/index.ts`; public API (`CATEGORIES`, `getCategory`, `getProduct`, all types) unchanged.
- `docs/# 004_PROJECT_CONTEXT.md` — Phase 1C entry + timestamp.

**Unchanged**
- All public route files, all components under `src/components/faratech/`, all `src/lib/` modules other than `products.ts`, `005_PRODUCT_MODEL.md`, design system, public assets.

## Success criteria check

- Product CMS architecture: ✅ repository + DTOs + validation + admin shell.
- Product management UI: ✅ list / new / edit / preview.
- Repository abstraction implementable by Nest: ✅ async, DTO-shaped, status-aware.
- Prisma migration path documented: ✅ in `006`.
- No backend dependency: ✅ in-memory only, no fetch, no Cloud.
- Backward compatibility: ✅ public catalog API unchanged, all 38 records still render.

## Recommended next phase

Phase 2A — **CMS backend skeleton**: NestJS module + Prisma schema implementing `ProductRepository`, plus a TanStack server-function adapter so the frontend swaps the in-memory repo for a real one with zero UI changes. Auth + role gating land in Phase 2B alongside the admin route protection.
