import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navigation } from "@/components/faratech/navigation";
import { Footer } from "@/components/faratech/footer";
import { isLang, dirOf, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => { if (!isLang(params.lang)) throw notFound(); },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const l = lang as Lang;
  useEffect(() => {
    const html = document.documentElement;
    html.lang = l;
    html.dir = dirOf(l);
    return () => { html.dir = "ltr"; };
  }, [l]);
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation lang={l} />
      <main className="flex-1"><Outlet /></main>
      <Footer lang={l} />
    </div>
  );
}
