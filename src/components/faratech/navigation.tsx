import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown, Globe, Phone } from "lucide-react";
import { type Lang, LANGS, LANG_LABELS, T, t } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/products";

const PHONE = "021-7751 6927-28";
const LOGO_SRC = "/logo.png";

// Per-language font stacks for the language-switcher labels so each native
// label renders in its own script's font, independent of the active UI lang.
const LANG_LABEL_FONT: Record<Lang, string> = {
  en: "'Inter', system-ui, sans-serif",
  fa: "'Peyda', 'Vazirmatn', system-ui, sans-serif",
  ar: "'IBM Plex Sans Arabic', 'Vazirmatn', system-ui, sans-serif",
};

export function Navigation({ lang }: { lang: Lang }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLang = (next: Lang) => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts[0] === "en" || parts[0] === "fa" || parts[0] === "ar") parts[0] = next;
    else parts.unshift(next);
    navigate({ to: "/" + parts.join("/") });
    setLangOpen(false);
  };

  const navItems = [
    {
      label: t(T.products, lang),
      to: `/${lang}/products`,
      children: CATEGORIES.map((c) => ({
        label: c.title[lang],
        to: `/${lang}/products/${c.key}`,
      })),
    },
    { label: t(T.spareParts, lang), to: `/${lang}/spare-parts` },
    { label: t(T.about, lang), to: `/${lang}#about` },
    { label: t(T.contact, lang), to: `/${lang}#contact` },
  ];

  return (
    <>
      <div className="bg-[var(--modern-bg)] border-b border-[var(--modern-border)] text-[var(--modern-text-secondary)] text-xs py-2 hidden md:block relative z-[60]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between overflow-visible">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--modern-accent)] inline-block" />
              {t(T.iso, lang)}
            </span>
            <span>{t(T.ceFda, lang)}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-[var(--modern-text)] transition-colors" dir="ltr">
              <Phone size={11} />
              {PHONE}
            </a>
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 hover:text-[var(--modern-text)] transition-colors">
                <Globe size={11} />
                <span lang={lang} style={{ fontFamily: LANG_LABEL_FONT[lang] }}>{LANG_LABELS[lang]}</span>
                <ChevronDown size={10} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 bg-white text-[var(--modern-text)] rounded-lg shadow-lg border border-[var(--modern-border)] min-w-[120px] z-[100]">
                  {LANGS.map((l) => (
                    <button
                      key={l}
                      onClick={() => switchLang(l)}
                      lang={l}
                      dir={l === "en" ? "ltr" : "rtl"}
                      style={{ fontFamily: LANG_LABEL_FONT[l] }}
                      className={`block w-full text-left px-3 py-2 text-xs font-medium hover:bg-[var(--modern-bg)] ${l === lang ? "bg-[var(--modern-bg)]" : ""}`}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-[var(--modern-border)]" : "bg-white"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={`/${lang}`} className="flex items-center gap-3 flex-shrink-0" aria-label="FARATECH home">
            <img
              src={LOGO_SRC}
              alt="FARATECH"
              className="h-9 md:h-12 w-auto object-contain"
              decoding="async"
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-heading font-bold text-[var(--modern-text)] text-lg tracking-widest uppercase">FARATECH</span>
              <span className="text-[9px] text-[var(--modern-text-secondary)] tracking-[0.2em] uppercase">Mobility Systems</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.to}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--modern-text-secondary)] hover:text-[var(--modern-text)] transition-colors rounded-md hover:bg-[var(--modern-bg)]"
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown size={13} className={`transition-transform ${activeDropdown === item.label ? "rotate-180" : ""}`} />
                  )}
                </Link>
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 w-64 z-[70]">
                    <div className="bg-white border border-[var(--modern-border)] rounded-lg shadow-xl p-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.to}
                          className="flex flex-col px-3 py-2.5 rounded-md hover:bg-[var(--modern-bg)] group transition-colors"
                        >
                          <span className="text-sm font-medium text-[var(--modern-text)] group-hover:text-[var(--modern-accent)]">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href={`/${lang}#contact`} className="text-sm font-medium text-[var(--modern-text-secondary)] hover:text-[var(--modern-text)] transition-colors px-3 py-2">
              {t(T.findDistributor, lang)}
            </a>
            <a href={`/${lang}#contact`} className="bg-[var(--modern-accent)] hover:bg-[var(--modern-accent-dark)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5">
              {t(T.requestQuote, lang)}
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md hover:bg-[var(--modern-bg)] transition-colors" aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-[var(--modern-border)] px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-sm font-medium text-[var(--modern-text)] hover:text-[var(--modern-accent)] hover:bg-[var(--modern-bg)] rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[var(--modern-border)] mt-3 flex items-center gap-2 px-3" dir="ltr">
              <Phone size={12} className="text-[var(--modern-text-secondary)]" />
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="text-xs text-[var(--modern-text-secondary)]">{PHONE}</a>
            </div>
            <div className="flex gap-2 px-3 pt-2 flex-wrap">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  lang={l}
                  dir={l === "en" ? "ltr" : "rtl"}
                  style={{ fontFamily: LANG_LABEL_FONT[l] }}
                  className={`text-xs font-semibold px-2.5 py-1 border rounded ${l === lang ? "bg-[var(--modern-text)] text-white border-[var(--modern-text)]" : "border-[var(--modern-border)] text-[var(--modern-text-secondary)]"}`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <div className="pt-2">
              <a href={`/${lang}#contact`} className="block text-center bg-[var(--modern-accent)] text-white text-sm font-semibold px-5 py-3 rounded-lg">
                {t(T.requestQuote, lang)}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
