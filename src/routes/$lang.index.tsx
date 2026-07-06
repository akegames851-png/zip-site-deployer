import { createFileRoute } from "@tanstack/react-router";
import { ModernHomepage } from "@/components/faratech/modern-homepage";
import type { Lang } from "@/lib/i18n";
import { buildLocaleMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = (params?.lang as Lang) ?? "fa";
    const locale = buildLocaleMeta(lang, (l) => `/${l}`);
    return {
      meta: [
        { title: "FARATECH — Engineering Mobility Excellence" },
        { name: "description", content: "Premium wheelchair systems trusted by hospitals and rehabilitation centers worldwide." },
        ...locale.meta,
      ],
      links: [
        { rel: "preload", as: "image", href: "/wheelchair-hero.png", fetchpriority: "high" },
        ...locale.links,
      ],
    };
  },
  component: Home,
});

function Home() {
  const { lang } = Route.useParams();
  const l = lang as Lang;
  return <ModernHomepage lang={l} />;
}
