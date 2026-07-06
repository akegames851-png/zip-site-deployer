# PROJECT_CONTEXT.md — Faratech Medical Engineering Platform

**Last Updated:** 2026-06-26
**Session:** Phase 2A — Data Ingestion & Repository Integration
**Status:** Frontend prototype with real Persian master data. Backend not started.

---

## 1. Platform Overview

Faratech is an Iranian engineering and medical technology company specializing in mobility solutions (wheelchairs, patient lifts, mobility scooters). The website serves as the primary digital presence targeting B2B healthcare institutions and B2C customers in Persian, English, and Arabic markets.

The platform is built to evolve through 5 business phases (per PRD.md):
1. Corporate Website ← **Current phase**
2. Knowledge Platform (Article CMS + SEO)
3. Dealer Portal
4. Ecommerce
5. CRM Integration

---

## 2. Tech Stack

### Frontend (Active)
| Technology | Version | Role |
|-----------|---------|------|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Language |
| TanStack Start | 1.167 | SSR framework |
| TanStack Router | 1.168 | File-based routing |
| TailwindCSS | 4.2 | Styling |
| shadcn/ui | latest | UI primitives (Radix-based) |
| Vite | 8.0 | Build tool |
| Bun | latest | Package manager |
| Lovable | - | Deployment platform |

### Backend (Not Started — Planned)
| Technology | Version | Role |
|-----------|---------|------|
| NestJS | latest | API framework |
| PostgreSQL | latest | Primary database |
| Prisma | latest | ORM |
| Redis | latest | Cache + sessions |
| S3 Compatible | - | Media storage |
| PostHog | latest | Analytics |
| Meilisearch | latest | Search |

---

## 3. Repository Structure (Current)

```
/
├── src/
│   ├── components/
│   │   ├── faratech/           ← 12 domain components (flat — needs refactoring)
│   │   │   ├── hero.tsx
│   │   │   ├── hero-shortcuts.tsx
│   │   │   ├── stats.tsx
│   │   │   ├── products-section.tsx
│   │   │   ├── engineering.tsx
│   │   │   ├── solutions.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── cta.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── category-page.tsx
│   │   │   └── product-page.tsx
│   │   └── ui/                 ← 40+ shadcn/ui primitives
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── i18n.ts             ← All translations (EN/FA/AR) — 380 lines
│   │   ├── products.ts         ← Static product catalog — 38 products
│   │   ├── utils.ts
│   │   ├── error-capture.ts
│   │   └── error-page.ts
│   ├── routes/                 ← TanStack file-based routing
│   │   ├── __root.tsx          ← App shell, global head tags
│   │   ├── index.tsx           ← Redirects to /fa
│   │   ├── $lang.tsx           ← Lang layout (Navigation + Footer)
│   │   ├── $lang.index.tsx     ← Homepage
│   │   ├── $lang.spare-parts.tsx
│   │   ├── $lang.products.index.tsx
│   │   ├── $lang.products.$category.index.tsx
│   │   └── $lang.products.$category.$product.tsx
│   ├── styles.css              ← Global styles + CSS custom properties
│   ├── router.tsx
│   ├── server.ts               ← SSR error handling wrapper
│   └── start.ts               ← Middleware configuration
├── public/
│   ├── logo.png
│   ├── wheelchair-hero.png
│   └── site.webmanifest
├── src/assets/
│   ├── Peyda.woff.asset.json
│   └── Peyda.woff2.asset.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── bunfig.toml
├── components.json             ← shadcn/ui config
└── eslint.config.js
```

---

## 4. Routes (Current)

| Route | Component | Status |
|-------|-----------|--------|
| `/` | Redirect → `/fa` | ✅ |
| `/$lang` | Lang layout with Nav/Footer | ✅ |
| `/$lang/` | Home (all sections) | ✅ (placeholder images) |
| `/$lang/spare-parts` | Spare Parts listing | ✅ (placeholder images) |
| `/$lang/products` | Category overview | ✅ (placeholder images) |
| `/$lang/products/$category` | Category products | ✅ (placeholder images) |
| `/$lang/products/$category/$product` | Product detail | ✅ (placeholder specs) |

**Missing routes (planned):**
- `/$lang/articles` — Article hub
- `/$lang/articles/$slug` — Article detail
- `/admin/*` — Admin dashboard
- `/dealer/*` — Dealer portal

---

## 5. Internationalization

**Languages:** English (en), Persian (fa), Arabic (ar)
**Default language:** Persian (fa) — `/` redirects to `/fa`
**RTL:** Enabled for FA and AR via `html[dir]` attribute
**Implementation:** Custom lightweight i18n in `src/lib/i18n.ts`

**Font stack:**
- English: Inter (body), DM Sans (headings)
- Persian: Vazirmatn (body), Peyda (headings/display) — Peyda self-hosted
- Arabic: IBM Plex Sans Arabic (body + headings)

**Translation coverage:** All UI strings translated. Product-level content (specs, descriptions) has no FA/AR translations yet.

---

## 6. Product Catalog (Current State)

**Total:** 40 products across 5 categories (38 identity records + 2 new
products `delta35` and `fateh-luxury` added from `PRODUCTS_MASTER.txt`).

| Category | Key | Products | Enriched (FA) |
|----------|-----|---------|---------------|
| Power Wheelchairs | `power-wheelchairs` | 19 (2 series) | 9 |
| Manual Wheelchairs | `manual-wheelchairs` | 10 | 4 |
| Shower Wheelchairs | `shower-wheelchairs` | 3 | 0 |
| Patient Lifts | `patient-lifts` | 7 | 4 |
| Mobility Scooters | `mobility-scooters` | 1 | 1 |

Enriched products carry Persian short/long descriptions, structured technical
specifications, certifications, warranty/after-sales FAQ and a `published`
status from the master file. Non-enriched ("identity-only") records remain
`published` by default to preserve all existing public URLs but render no
extra editorial content (ProductPage hides empty sections).

**Product data model (`src/lib/products.ts`):**
```typescript
type Product = {
  // Identity & routing (unchanged — backward compatible)
  slug: string                        // URL slug — route identifier, immutable
  name: string                        // Model name — not translated
  code?: string                       // SKU / business code — NOT a route id
  series?: LocalizedText
  tagline?: LocalizedText
  // Phase 1A additions — all optional, CMS-supplied
  description?: LocalizedText
  shortDescription?: LocalizedText
  features?: LocalizedText[]
  specifications?: SpecificationGroup[]
  certifications?: Certification[]
  media?: { images?: ProductImage[]; videos?: ProductVideo[] }
  documents?: ProductDocument[]
  faq?: FAQItem[]
  related?: RelatedProductRef[]
  seo?: ProductSEO
  status?: "draft" | "published" | "archived"
  cmsId?: string
  createdAt?: string                  // ISO 8601
  updatedAt?: string                  // ISO 8601
}
```

**Note:** Full schema, field definitions, CMS migration notes, Prisma mapping
guidance and an example record live in [`docs/005_PRODUCT_MODEL.md`](./005_PRODUCT_MODEL.md).
Product pages no longer render hardcoded specifications or fake fallbacks —
sections appear only when real data is supplied.

---

## 7. Design System

**Brand colors (oklch):**
- Navy: `oklch(0.22 0.055 255)` → `#1b1f3b` approx
- Red: `oklch(0.52 0.22 25)` → accent/CTA
- Silver: `oklch(0.94 0.005 255)` → backgrounds

**Key CSS classes:**
- `.engineering-grid` — Background grid pattern used in hero/headers
- `.animate-ticker` — Certification badge scroll
- `.animate-fade-up` — Page entry animation
- `.font-heading` — DM Sans / Peyda / IBM Plex Arabic per lang

**Responsive grid (from DECISIONS.md):**
- Ultra Wide: 8 cards
- Desktop: 6 cards
- Laptop: 4 cards
- Tablet: 3 cards
- Mobile: 2 cards
- Small Mobile: 1 card

---

## 8. Known Issues

| ID | Severity | Description |
|----|----------|-------------|
| BUG-001 | Medium | ChevronRight icons in navigation not flipped for RTL (FA/AR) |
| BUG-002 | High | Contact form submits to nowhere — leads are lost |
| BUG-003 | High | Newsletter form not connected to any service |
| BUG-004 | High | Testimonials appear to be fabricated — reputational risk |
| BUG-005 | Low | `Product.tagline` field defined but never rendered |
| BUG-006 | Low | `sidebar.tsx` exceeds 500-line limit per DECISIONS.md |
| BUG-007 | Medium | No sitemap.xml or robots.txt |
| BUG-008 | High | No hreflang tags for multilingual SEO |

---

## 9. Architecture Decisions (Confirmed)

All decisions from DECISIONS.md are confirmed and must be respected:

- **Feature-Based Architecture** — mandatory, not yet implemented
- **No file above 500 lines** — `sidebar.tsx` violates this
- **No component above 300 lines** — currently all compliant
- **No business logic in UI components** — partially violated
- **Specification → Implementation → Review** — all features must follow this
- **GitHub is source of truth** — Lovable syncs from GitHub

---

## 10. What Has Been Completed

- [x] Project scaffold (TanStack Start + React 19 + TypeScript)
- [x] Global design system (colors, typography, CSS vars)
- [x] Navigation component (desktop + mobile + language switcher)
- [x] Footer component (newsletter form + links)
- [x] Homepage (7 sections: Hero, Shortcuts, Stats, Products, Engineering, Solutions, Testimonials, CTA)
- [x] Static product catalog (38 products, 5 categories)
- [x] Category listing page
- [x] Product detail page (shell)
- [x] Spare Parts page (shell)
- [x] Trilingual i18n system (EN/FA/AR)
- [x] RTL support for Persian and Arabic
- [x] Persian font (Peyda) self-hosted
- [x] SSR error handling
- [x] PWA manifest
- [x] Basic meta tags per route
- [x] **Phase 1A — Product Model Foundation** (2026-06-23) — Extended the
      `Product` schema with optional, CMS-ready field groups (localized
      descriptions, structured specifications, media refs, documents,
      certifications, FAQ, related products, SEO metadata, status, CMS
      migration metadata). Backward compatible with all 38 existing records.
      Product page now renders sections only when real data exists; all
      hardcoded generic specifications and fake fallbacks were removed. Full
      contract documented in `docs/005_PRODUCT_MODEL.md`.
- [x] **Phase 1C — Product CMS Foundation** (2026-06-25) — Introduced the
      CMS seam between the product schema and the future NestJS backend.
      Added `ProductRepository` interface, `InMemoryProductRepository`
      (seeded from the 38 static records), dependency-free validation
      layer, mock admin UI at `/admin/products` (list, create, edit,
      preview) with draft / publish / unpublish / archive lifecycle.
      No backend, no Prisma, no auth, no media uploads, no fake content.
      Public routes, visual design, SEO architecture, and product schema
      unchanged. Full architecture in `docs/006_PRODUCT_CMS.md`.
- [x] **Phase 2A — Data Ingestion & Repository Integration** (2026-06-26) —
      Ingested `COMPANY_PROFILE.txt`, `PRODUCT_CATEGORIES.txt`, and
      `PRODUCTS_MASTER.txt` into typed source modules under `src/lib/data/`.
      Added a sync read-side adapter (`listVisibleCategories`,
      `getVisibleCategory`, `getVisibleProduct`) layered over the same
      `CATEGORIES` array that seeds the `ProductRepository`, enforcing
      `status === "published"` for all public reads. Rewired
      `ProductsSection`, footer, and the `/$lang/products*` routes to the
      adapter. SEO `Organization` JSON-LD and footer contact info now come
      from `COMPANY_PROFILE`. Existing slugs preserved; two new products
      (`delta35`, `fateh-luxury`) appended from the master file. Validation
      layer runs at seed time and warns (never throws) on issues.
      No backend, no Prisma, no auth, no media uploads, no dashboards. Full
      handoff in `docs/008_SESSION_SUMMARY.md`.

---

## 11. What Is Pending (Prioritized)

### Immediate (Phase 0)
- [ ] Architecture refactor to feature-based modules
- [ ] Route contact form to temporary form service (Formspree)
- [ ] Add hreflang, canonical, sitemap.xml, robots.txt
- [ ] Fix RTL navigation icons
- [ ] Replace fabricated testimonials
- [ ] Add Schema.org Organization + Product markup

### Short-term (Phase 1)
- [ ] NestJS backend bootstrap
- [ ] PostgreSQL + Prisma schema
- [ ] Authentication (Google OAuth + Email + OTP)
- [ ] Role system (6 roles)
- [ ] Redis + S3 integration
- [ ] PostHog event tracking

### Medium-term (Phase 2)
- [ ] Product CMS (admin UI + API)
- [ ] Real product images
- [ ] Product specs, PDFs, videos per product
- [ ] Dynamic product routes (API-driven)

### Long-term (Phase 3+)
- [ ] Article CMS + rich editor
- [ ] Persian content clusters for SEO
- [ ] Full Schema.org + sitemap updates
- [ ] Dashboard (PostHog + analytics)
- [ ] Dealer portal

---

## 12. Performance Targets (from DECISIONS.md)

| Metric | Target | Current Status |
|--------|--------|---------------|
| LCP | < 2s | Unknown — hero image not preloaded |
| CLS | < 0.05 | Likely acceptable — no layout shifts identified |
| INP | < 150ms | Unknown — no real interaction yet |

---

## 13. AI Collaboration Context

- **Claude** = Lead Architect (specs, reviews, audits)
- **Lovable** = Implementation engine (frontend UI, component generation)
- **Claude Code / Other tools** = Backend implementation

**Workflow:**
```
Claude → Specification → Lovable → Implementation → Claude → Review
```

**Session summary files:** After each session, generate `SESSION_SUMMARY.md` with decisions, risks, and next steps.

**Context files to maintain:**
- `PROJECT_CONTEXT.md` — this file, updated after each phase
- `DECISIONS.md` — architectural decisions, never overridden without approval
- `SESSION_SUMMARY.md` — per-session log

---

*This file should be updated at the end of each work session.*
*Next recommended update: After Phase 0 architecture refactor is complete.*
