import { createFileRoute, notFound } from "@tanstack/react-router";
import { CategoryPage } from "@/components/faratech/category-page";
import { getVisibleCategory } from "@/lib/products";
import type { Lang } from "@/lib/i18n";
import { buildLocaleMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/products/$category/")({
  loader: ({ params }) => {
    const cat = getVisibleCategory(params.category);
    if (!cat) throw notFound();
    return cat;
  },
  head: ({ loaderData, params }) => {
    const lang = (params?.lang as Lang) ?? "fa";
    const cat = params?.category ?? "";
    const locale = buildLocaleMeta(lang, (l) => `/${l}/products/${cat}`);
    const title = loaderData?.title[lang] ?? loaderData?.title.en ?? "Category";
    const description = loaderData?.blurb[lang] ?? loaderData?.blurb.en ?? "";
    return {
      meta: [
        { title: `${title} — FARATECH` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — FARATECH` },
        { property: "og:description", content: description },
        ...locale.meta,
      ],
      links: locale.links,
    };
  },
  component: CategoryView,
});

function CategoryView() {
  const { lang } = Route.useParams();
  const category = Route.useLoaderData();
  return <CategoryPage lang={lang as Lang} category={category} />;
}
