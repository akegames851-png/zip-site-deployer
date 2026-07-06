import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Play, Share2, Loader2, Check, AlertCircle } from "lucide-react";
import { type Lang, T, t } from "@/lib/i18n";
import { listVisibleCategories } from "@/lib/products";
import { COMPANY_PROFILE } from "@/lib/data/company";
import { newsletterSchema, submitNewsletter } from "@/lib/lead-capture";
import { DirArrow } from "@/components/faratech/dir-icon";

const PHONE = COMPANY_PROFILE.contact.phoneNumbers.join(" / ");
const LOGO_SRC = "/logo.png";
const certBadges = [
  ...COMPANY_PROFILE.certificates.standards,
  "CE",
  "FDA",
  "TÜV",
  "EN 12183",
  "EN 12184",
];

type NewsletterStatus = "idle" | "submitting" | "success" | "error";

export function Footer({ lang }: { lang: Lang }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(t(T.validation_email, lang));
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      await submitNewsletter(parsed.data);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError(t(T.submitError, lang));
    }
  };

  return (
    <footer className="bg-white border-t border-[var(--modern-border)] text-[var(--modern-text)]">
      <div className="border-b border-[var(--modern-border)]">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="font-heading text-xl font-bold mb-1">{t(T.newsletter, lang)}</h3>
            <p className="text-sm text-[var(--modern-text-secondary)]">{t(T.newsletterSub, lang)}</p>
          </div>
          <form className="flex flex-col gap-2 w-full min-w-0" onSubmit={onSubscribe} noValidate aria-busy={status === "submitting"}>
            <div className="flex flex-col sm:flex-row gap-2 w-full min-w-0">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                placeholder={t(T.emailPlaceholder, lang)}
                aria-invalid={status === "error"}
                aria-describedby={status === "error" ? "newsletter-err" : status === "success" ? "newsletter-ok" : undefined}
                disabled={status === "submitting"}
                className={`flex-1 min-w-0 bg-[var(--modern-bg)] border rounded-lg px-4 py-2.5 text-sm placeholder:text-[var(--modern-text-muted)] focus:outline-none focus:border-[var(--modern-accent)] focus:ring-2 focus:ring-[var(--modern-accent)]/20 disabled:opacity-60 ${status === "error" ? "border-red-400" : "border-[var(--modern-border)]"}`}
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="shrink-0 bg-[var(--modern-accent)] hover:bg-[var(--modern-accent-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t(T.submitting, lang)}
                  </>
                ) : (
                  <>
                    {t(T.subscribe, lang)}
                    <DirArrow lang={lang} size={14} />
                  </>
                )}
              </button>
            </div>
            {status === "success" && (
              <p id="newsletter-ok" role="status" className="inline-flex items-center gap-1.5 text-xs text-[var(--modern-accent)]">
                <Check size={13} /> {t(T.newsletterSuccess, lang)}
              </p>
            )}
            {status === "error" && error && (
              <p id="newsletter-err" role="alert" className="inline-flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={13} /> {error}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <Link to={`/${lang}`} className="inline-flex items-center gap-3 mb-6" aria-label="FARATECH home">
              <img
                src={LOGO_SRC}
                alt="FARATECH"
                className="h-14 w-auto object-contain"
                decoding="async"
              />
              <div className="flex flex-col leading-none">
                <span className="font-heading font-bold text-[var(--modern-text)] text-lg tracking-widest uppercase">FARATECH</span>
                <span className="text-[9px] text-[var(--modern-text-secondary)] tracking-[0.2em] uppercase">Mobility Systems</span>
              </div>
            </Link>
            <p className="text-sm text-[var(--modern-text-secondary)] leading-relaxed mb-6 max-w-xs">{t(T.heroSub, lang)}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {certBadges.map((b) => (
                <span key={b} className="text-[10px] font-semibold px-2.5 py-1 border border-[var(--modern-border)] rounded text-[var(--modern-text-secondary)] tracking-wide">{b}</span>
              ))}
            </div>
            <div className="flex gap-3">
              {[ExternalLink, Play, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 border border-[var(--modern-border)] rounded-md flex items-center justify-center text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] hover:border-[var(--modern-accent)] hover:bg-[var(--modern-accent-light)] transition-all">
                  <Icon size={15} />
                </a>
              ))}
            </div>
            <div className="mt-6 text-xs text-[var(--modern-text-secondary)]" dir="ltr">{PHONE}</div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--modern-text-muted)] mb-5">{t(T.products, lang)}</h4>
            <ul className="space-y-3">
              {listVisibleCategories().map((c) => (
                <li key={c.key}>
                  <Link to={`/${lang}/products/${c.key}`} className="text-sm text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] transition-colors">
                    {c.title[lang]}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={`/${lang}/spare-parts`} className="text-sm text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] transition-colors">
                  {t(T.spareParts, lang)}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--modern-text-muted)] mb-5">{t(T.engineering, lang)}</h4>
            <ul className="space-y-3">
              {[t(T.fnMaterials, lang), t(T.fnManufacturing, lang), t(T.fnCertifications, lang), t(T.fnSustainability, lang)].map((l) => (
                <li key={l}><a href={`/${lang}#engineering`} className="text-sm text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--modern-text-muted)] mb-5">{t(T.solutions, lang)}</h4>
            <ul className="space-y-3">
              {[t(T.fnHospitals, lang), t(T.fnRehab, lang), t(T.fnHomecare, lang), t(T.fnSport, lang)].map((l) => (
                <li key={l}><a href={`/${lang}#solutions`} className="text-sm text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--modern-text-muted)] mb-5">{t(T.contact, lang)}</h4>
            <ul className="space-y-3">
              <li><a href={`/${lang}#contact`} className="text-sm text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] transition-colors">{t(T.findDistributor, lang)}</a></li>
              <li><a href={`/${lang}#contact`} className="text-sm text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] transition-colors">{t(T.requestQuote, lang)}</a></li>
              <li><a href={`/${lang}#contact`} className="text-sm text-[var(--modern-text-secondary)] hover:text-[var(--modern-accent)] transition-colors">{t(T.about, lang)}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--modern-border)]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--modern-text-muted)]">© {new Date().getFullYear()} FARATECH. {t(T.rights, lang)}</p>
          <div className="flex gap-6">
            {[t(T.fnPrivacy, lang), t(T.fnTerms, lang), t(T.fnImprint, lang)].map((l) => (
              <a key={l} href="#" className="text-xs text-[var(--modern-text-muted)] hover:text-[var(--modern-text)] transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
