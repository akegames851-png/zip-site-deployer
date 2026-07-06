import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductPage } from "@/components/faratech/product-page";
import { getVisibleCategory, getVisibleProduct } from "@/lib/products";
import type { Lang } from "@/lib/i18n";
import { buildLocaleMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/products/$category/$product")({
  loader: ({ params }) => {
    const category = getVisibleCategory(params.category);
    const product = getVisibleProduct(params.category, params.product);
    if (!category || !product) throw notFound();
    return { category, product };
  },
  head: ({ loaderData, params }) => {
    const lang = (params?.lang as Lang) ?? "fa";
    const cat = params?.category ?? "";
    const prod = params?.product ?? "";
    const locale = buildLocaleMeta(lang, (l) => `/${l}/products/${cat}/${prod}`);
    const name = loaderData?.product.name ?? "Product";
    const description = `${name} — engineered by FARATECH.`;
    return {
      meta: [
        { title: `${name} — FARATECH` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} — FARATECH` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...locale.meta,
      ],
      links: locale.links,
    };
  },
  component: ProductView,
});

function ProductView() {
  const { lang } = Route.useParams();
  const { category, product } = Route.useLoaderData();
  return <ProductPage lang={lang as Lang} category={category} product={product} />;
}
