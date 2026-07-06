import { createFileRoute, Link } from "@tanstack/react-router";
import { listVisibleCategories } from "@/lib/products";
import { T, t, type Lang } from "@/lib/i18n";
import { buildLocaleMeta, breadcrumbJsonLd } from "@/lib/seo";
import { DirChevron, DirArrow } from "@/components/faratech/dir-icon";

export const Route = createFileRoute("/$lang/products/")({
  head: ({ params }) => {
    const lang = (params?.lang as Lang) ?? "fa";
    const locale = buildLocaleMeta(lang, (l) => `/${l}/products`);
    return {
      meta: [
        { title: "Products — FARATECH" },
        { name: "description", content: "Browse FARATECH mobility products." },
        ...locale.meta,
      ],
      links: locale.links,
    };
  },
  component: ProductsOverview,
});

function ProductsOverview() {
  const { lang } = Route.useParams();
  const l = lang as Lang;
  const categories = listVisibleCategories();
  const crumbs = breadcrumbJsonLd([
    { name: t(T.home, l), path: `/${l}` },
    { name: t(T.products, l), path: `/${l}/products` },
  ]);
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: crumbs }} />
      <section className="bg-[var(--brand-navy)] text-white relative overflow-hidden">
        <div className="absolute inset-0 engineering-grid opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--brand-red)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50 mb-6">
            <Link to="/$lang" params={{ lang: l }} className="hover:text-white">{t(T.home, l)}</Link>
            <DirChevron lang={l} size={12} />
            <span className="text-white">{t(T.products, l)}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[var(--brand-red)]" />
            <span className="text-xs tracking-[0.25em] uppercase text-white/60 font-medium">{t(T.overviewEyebrow, l)}</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{t(T.overviewTitle, l)}</h1>
          <p className="text-white/65 max-w-2xl leading-relaxed">{t(T.overviewSub, l)}</p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Link
                key={c.key}
                to="/$lang/products/$category"
                params={{ lang: l, category: c.key }}
                className="group bg-white border border-border rounded-lg overflow-hidden hover:border-[var(--brand-navy)] hover:shadow-lg transition-all"
              >
                <div className="aspect-[16/10] bg-[var(--brand-silver)] border-b border-border flex items-center justify-center text-muted-foreground text-[10px] tracking-widest uppercase">
                  {t(T.imagePlaceholderShort, l)}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="font-heading text-lg font-bold text-[var(--brand-navy)]">{c.title[l]}</h3>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {c.products.length} {t(T.models, l)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.blurb[l]}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-red)] group-hover:gap-2 transition-all">
                    {t(T.viewCategory, l)} <DirArrow lang={l} size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
