import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Building2,
  HeartPulse,
  Home,
  Trophy,
  Play,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { type Lang, T, t } from "@/lib/i18n";
import { listVisibleCategories } from "@/lib/products";
import { contactSchema, submitContact, type ContactInput } from "@/lib/lead-capture";
import { DirArrow } from "@/components/faratech/dir-icon";

const HERO_IMAGE = "/wheelchair-hero.png";
const PHONE = "021-7751 6927-28";

const accent = "#2563EB";
const accentDark = "#1D4ED8";
const accentLight = "#DBEAFE";
const text = "#1A1A18";
const textSecondary = "#6B6B68";
const border = "#E5E5E0";
const bg = "#FAFAF8";

function useCounter(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    setCount(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * eased));
      if (progress >= 1) { setCount(target); clearInterval(timer); }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, trigger]);
  return count;
}

function StatCard({ value, suffix, label, format, triggered, index }: {
  value: number; suffix: string; label: string; format?: string; triggered: boolean; index: number;
}) {
  const count = useCounter(value, 2000 + index * 100, triggered);
  const display = format ? format : value >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count.toLocaleString();
  return (
    <div className="text-center px-4">
      <div className="font-heading text-4xl md:text-5xl font-bold text-[var(--modern-accent)] mb-1">
        {display}{suffix}
      </div>
      <div className="text-sm font-medium text-[var(--modern-text-secondary)]">{label}</div>
    </div>
  );
}

function ContactForm({ lang }: { lang: Lang }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [form, setForm] = useState<ContactInput>({ name: "", email: "", organization: "", message: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof ContactInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput;
        const dict = (T as Record<string, Partial<Record<Lang, string>>>)?.[issue.message];
        fieldErrors[key] = dict ? t(dict, lang) : issue.message;
      }
      setErrors(fieldErrors);
      setStatus("idle");
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      await submitContact(parsed.data);
      setStatus("success");
    } catch {
      setStatus("error");
      setServerError(t(T.submitError, lang));
    }
  };

  const reset = () => {
    setStatus("idle");
    setForm({ name: "", email: "", organization: "", message: "" });
    setErrors({});
    setServerError(null);
  };

  const inputBase = "w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--modern-accent)]/20 focus:border-[var(--modern-accent)] transition-colors bg-white";
  const inputClass = (k: keyof ContactInput) =>
    `${inputBase} ${errors[k] ? "border-red-400" : "border-[var(--modern-border)]"}`;

  if (status === "success") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-16" role="status" aria-live="polite">
        <div className="w-16 h-16 bg-[var(--modern-accent-light)] rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-[var(--modern-accent)]" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-[var(--modern-text)] mb-3">{t(T.thankYou, lang)}</h3>
        <p className="text-sm text-[var(--modern-text-secondary)] max-w-sm">{t(T.contactSuccessBody, lang)}</p>
        <button onClick={reset} className="mt-6 text-sm font-medium text-[var(--modern-accent)] hover:underline">
          {t(T.sendAnother, lang)}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate aria-busy={status === "submitting"}>
      <h3 className="font-heading text-xl font-bold text-[var(--modern-text)]">{t(T.requestQuote, lang)}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <input
            required type="text" autoComplete="name" placeholder={t(T.formName, lang)} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass("name")}
            aria-invalid={!!errors.name} aria-describedby={errors.name ? "err-name" : undefined}
          />
          {errors.name && <p id="err-name" className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <input
            required type="email" autoComplete="email" placeholder={t(T.formEmail, lang)} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass("email")}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined}
          />
          {errors.email && <p id="err-email" className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
        <input
          type="text" autoComplete="organization" placeholder={t(T.formOrg, lang)} value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })} className={`md:col-span-2 ${inputClass("organization")}`}
        />
      </div>
      <div>
        <textarea
          required rows={5} placeholder={t(T.formMessage, lang)} value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass("message")}
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "err-message" : undefined}
        />
        {errors.message && <p id="err-message" className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>
      {status === "error" && serverError && (
        <div role="alert" className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> <span>{serverError}</span>
        </div>
      )}
      <button
        type="submit" disabled={status === "submitting"}
        className="inline-flex items-center gap-2 bg-[var(--modern-accent)] hover:bg-[var(--modern-accent-dark)] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
      >
        {status === "submitting" ? <><Loader2 size={15} className="animate-spin" /> {t(T.submitting, lang)}</> : t(T.requestQuote, lang)}
      </button>
    </form>
  );
}

export function ModernHomepage({ lang }: { lang: Lang }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsTriggered, setStatsTriggered] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsTriggered(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const categories = listVisibleCategories();

  const stats = [
    { value: 35, suffix: "+", label: t(T.stat1Label, lang) },
    { value: 2400000, suffix: "+", label: t(T.stat2Label, lang), format: "2.4M" },
    { value: 60, suffix: "+", label: t(T.stat3Label, lang) },
    { value: 1200, suffix: "+", label: t(T.stat4Label, lang) },
    { value: 98, suffix: "%", label: t(T.stat5Label, lang) },
    { value: 340, suffix: "+", label: t(T.stat6Label, lang) },
  ];

  const solutions = [
    { Icon: Building2, title: t(T.sol1Title, lang), desc: t(T.sol1Desc, lang) },
    { Icon: HeartPulse, title: t(T.sol2Title, lang), desc: t(T.sol2Desc, lang) },
    { Icon: Home, title: t(T.sol3Title, lang), desc: t(T.sol3Desc, lang) },
    { Icon: Trophy, title: t(T.sol4Title, lang), desc: t(T.sol4Desc, lang) },
  ];

  const steps = [
    { step: "01", title: t(T.pillar1Title, lang), desc: t(T.pillar1Desc, lang) },
    { step: "02", title: t(T.pillar2Title, lang), desc: t(T.pillar2Desc, lang) },
    { step: "03", title: t(T.pillar3Title, lang), desc: t(T.pillar3Desc, lang) },
    { step: "04", title: t(T.pillar4Title, lang), desc: t(T.pillar4Desc, lang) },
  ];

  const testimonials = [
    { text: t(T.testi1Text, lang), role: t(T.testi1Role, lang), name: t(T.testiName1, lang) },
    { text: t(T.testi2Text, lang), role: t(T.testi2Role, lang), name: t(T.testiName2, lang) },
    { text: t(T.testi3Text, lang), role: t(T.testi3Role, lang), name: t(T.testiName3, lang) },
  ];

  const certifications = ["ISO 13485", "CE Mark", "FDA Cleared", "TÜV Rheinland", "EN 12183", "EN 12184", "ISO 9001", "MDR 2017/745"];

  return (
    <div className="bg-[var(--modern-bg)] text-[var(--modern-text)]">
      {/* HERO */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-8 ${mounted ? "animate-fade-up" : "opacity-0"}`}>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--modern-accent)]">
                {t(T.heroEyebrow, lang)}
              </span>
              <h1
                className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-[var(--modern-text)]"
                style={{ textWrap: "balance" }}
              >
                {t(T.heroH1a, lang)} {t(T.heroH1b, lang)}<br />
                <span className="text-[var(--modern-accent)]">{t(T.heroH1c, lang)}</span>
              </h1>
              <p className="text-lg md:text-xl text-[var(--modern-text-secondary)] leading-relaxed max-w-xl">
                {t(T.heroSub, lang)}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={`/${lang}/products`}
                  className="group inline-flex items-center gap-2 bg-[var(--modern-accent)] hover:bg-[var(--modern-accent-dark)] text-white font-semibold px-7 py-4 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  {t(T.exploreProducts, lang)}
                  <DirArrow lang={lang} size={16} className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Link>
                <a
                  href={`/${lang}#engineering`}
                  className="group inline-flex items-center gap-2 border border-[var(--modern-border)] hover:border-[var(--modern-text)] text-[var(--modern-text)] hover:bg-white font-medium px-7 py-4 rounded-lg transition-all"
                >
                  <Play size={14} className="fill-[var(--modern-accent)] text-[var(--modern-accent)]" />
                  {t(T.ourStory, lang)}
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-2">
                {[
                  { v: "35+", l: t(T.years, lang) },
                  { v: "60+", l: t(T.countries, lang) },
                  { v: "1,200+", l: t(T.partners, lang) },
                  { v: "98%", l: t(T.satisfaction, lang) },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-x-6 gap-y-4">
                    {i > 0 && <div className="hidden sm:block w-px h-10 bg-[var(--modern-border)]" />}
                    <div className="text-center">
                      <div className="font-heading text-2xl font-bold text-[var(--modern-text)]">{s.v}</div>
                      <div className="text-xs text-[var(--modern-text-secondary)] mt-1 tracking-wide uppercase">{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`relative flex items-center justify-center ${mounted ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-[var(--modern-accent-light)] rounded-full blur-3xl scale-75 opacity-60" />
              <div className="relative w-full max-w-lg aspect-square">
                <img
                  src={HERO_IMAGE}
                  alt="FARATECH Capitan power wheelchair"
                  decoding="async"
                  className="w-full h-full object-contain rounded-2xl"
                />
                <div className="absolute top-8 -left-4 bg-white text-[var(--modern-text)] px-4 py-3 rounded-xl shadow-lg border border-[var(--modern-border)] text-xs font-semibold">
                  <div className="text-[var(--modern-accent)] font-bold text-sm">7.8 kg</div>
                  <div className="text-[var(--modern-text-secondary)] font-normal">{t(T.badgeFrameWeight, lang)}</div>
                </div>
                <div className="absolute bottom-16 -right-4 bg-white text-[var(--modern-text)] px-4 py-3 rounded-xl shadow-lg border border-[var(--modern-border)] text-xs font-semibold">
                  <div className="text-[var(--modern-accent)] font-bold text-sm">T700</div>
                  <div className="text-[var(--modern-text-secondary)] font-normal">{t(T.badgeCarbonGrade, lang)}</div>
                </div>
                <div className="absolute top-1/2 -right-6 bg-[var(--modern-accent)] text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold">
                  {t(T.badgeNew2025, lang)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATION STRIP */}
      <div className="border-y border-[var(--modern-border)] bg-white py-4 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...certifications, ...certifications].map((cert, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs text-[var(--modern-text-muted)] font-medium tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--modern-accent)]/60 flex-shrink-0" />
              {cert}
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section ref={statsRef} className="py-20 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--modern-accent)] block mb-3">
              {t(T.byTheNumbers, lang)}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--modern-text)] max-w-2xl mx-auto">
              {t(T.statsHeadline, lang)}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((s, i) => <StatCard key={i} value={s.value} suffix={s.suffix} label={s.label} format={s.format} triggered={statsTriggered} index={i} />)}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-20 md:py-28 px-6 bg-[var(--modern-bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--modern-accent)] block mb-3">
                {t(T.overviewEyebrow, lang)}
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--modern-text)] mb-4 leading-tight">
                {t(T.overviewTitle, lang)}
              </h2>
              <p className="text-[var(--modern-text-secondary)] leading-relaxed">{t(T.overviewSub, lang)}</p>
            </div>
            <Link to={`/${lang}/products`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--modern-text)] hover:text-[var(--modern-accent)] transition-colors">
              {t(T.viewCategory, lang)} <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Link
                key={c.key}
                to={`/${lang}/products/${c.key}`}
                className="group bg-white border border-[var(--modern-border)] rounded-xl overflow-hidden hover:border-[var(--modern-text)] transition-all duration-200 hover:shadow-lg hover:-translate-y-2"
              >
                <div className="aspect-[16/10] bg-[var(--modern-bg)] border-b border-[var(--modern-border)] flex items-center justify-center text-[var(--modern-text-muted)] text-[10px] tracking-widest uppercase">
                  {t(T.imagePlaceholderShort, lang)}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading text-lg font-bold text-[var(--modern-text)]">{c.title[lang]}</h3>
                    <span className="text-[10px] font-semibold text-[var(--modern-text-secondary)] bg-[var(--modern-bg)] px-2 py-0.5 rounded">
                      {c.products.length} {t(T.models, lang)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--modern-text-secondary)] leading-relaxed mb-4">{c.blurb[lang]}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--modern-accent)] group-hover:gap-2 transition-all">
                    {t(T.viewCategory, lang)} <DirArrow lang={lang} size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--modern-accent)] block mb-3">
              {t(T.useCases, lang)}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--modern-text)]">
              {t(T.solutionsTitle, lang)}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((i, idx) => (
              <div
                key={idx}
                className="bg-white border border-[var(--modern-border)] rounded-xl p-6 hover:border-[var(--modern-text)] hover:shadow-lg hover:-translate-y-2 transition-all duration-200"
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--modern-accent-light)] flex items-center justify-center mb-5">
                  <i.Icon size={20} className="text-[var(--modern-accent)]" />
                </div>
                <h3 className="font-heading font-bold text-lg text-[var(--modern-text)] mb-2">{i.title}</h3>
                <p className="text-sm text-[var(--modern-text-secondary)] leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGINEERING PROCESS */}
      <section id="engineering" className="py-20 md:py-28 px-6 bg-[var(--modern-bg)]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--modern-accent)] block mb-3">
              {t(T.engineering, lang)}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--modern-text)] mb-4">
              {t(T.engHeadline, lang)}
            </h2>
            <p className="text-lg text-[var(--modern-text-secondary)] leading-relaxed max-w-2xl">
              {t(T.engSub, lang)}
            </p>
          </div>
          <div className="space-y-6">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-6 md:gap-8 p-6 bg-white border border-[var(--modern-border)] rounded-xl hover:border-[var(--modern-text)] transition-all duration-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[var(--modern-accent-light)] flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--modern-accent)]">{item.step}</span>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-heading text-xl font-bold text-[var(--modern-text)] mb-2">{item.title}</h3>
                  <p className="text-[var(--modern-text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 px-6 bg-white border-y border-[var(--modern-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--modern-accent)] block mb-3">
              {t(T.voicesField, lang)}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--modern-text)]">
              {t(T.testimonialsTitle, lang)}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((tmi, i) => (
              <div key={i} className="bg-[var(--modern-bg)] border border-[var(--modern-border)] rounded-xl p-6 flex flex-col">
                <p className="text-[var(--modern-text-secondary)] leading-relaxed mb-6 flex-1">"{tmi.text}"</p>
                <div>
                  <div className="font-semibold text-[var(--modern-text)] text-sm">{tmi.name}</div>
                  <div className="text-xs text-[var(--modern-text-muted)]">{tmi.role}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[var(--modern-text-muted)] mt-8">{t(T.testimonialsDisclaimer, lang)}</p>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-20 md:py-28 px-6 bg-[var(--modern-bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--modern-accent)] block mb-3">
              {t(T.ctaEyebrow, lang)}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--modern-text)] mb-6">
              {t(T.ctaTitle, lang)}
            </h2>
            <p className="text-lg text-[var(--modern-text-secondary)] leading-relaxed">{t(T.ctaSub, lang)}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="bg-[var(--modern-text)] rounded-2xl p-8 text-white">
                <h3 className="font-heading text-lg font-bold mb-6">{t(T.getInTouch, lang)}</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-[var(--modern-accent)] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-white/50 mb-1">{t(T.intlSales, lang)}</div>
                      <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="text-sm font-medium hover:text-[var(--modern-accent)] transition-colors" dir="ltr">{PHONE}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-[var(--modern-accent)] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-white/50 mb-1">{t(T.email, lang)}</div>
                      <a href="mailto:info@faratech.com" className="text-sm font-medium hover:text-[var(--modern-accent)] transition-colors">info@faratech.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-[var(--modern-accent)] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-white/50 mb-1">{t(T.hq, lang)}</div>
                      <address className="text-sm font-medium not-italic leading-relaxed whitespace-pre-line">{t(T.hqAddress, lang)}</address>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white border border-[var(--modern-border)] rounded-2xl p-8">
              <ContactForm lang={lang} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
