import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SeoLayout from "@/components/SeoLayout";
import { trackEvent } from "@/lib/analytics";

const OverthinkingAnalyzer = lazy(() => import("@/components/seo/OverthinkingAnalyzer"));
const InstantAiDemo = lazy(() => import("@/components/seo/InstantAiDemo"));
const ClarityQuiz = lazy(() => import("@/components/seo/ClarityQuiz"));

type Section = { h2: string; body: string };
type Related = { to: string; label: string; desc: string };
type Faq = { q: string; a: string };
export type HowToStep = { name: string; text: string };
export type HowTo = { name: string; description?: string; steps: HowToStep[] };

export type SeoWidget = "overthinking-analyzer" | "instant-ai-demo" | "clarity-quiz";

/**
 * Page type discriminator.
 * - "article" (default) — long-form SEO content. Emits Article JSON-LD.
 * - "tool" — interactive utility page where the widget is the hero. Emits
 *   WebApplication JSON-LD instead of Article, hides the reading-time line,
 *   and renders the widget above the body sections.
 */
export type SeoPageType = "article" | "tool";

export interface SeoPageConfig {
  path: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  italic: string;
  intro: string;
  sections: Section[];
  related: Related[];
  /** 40–60 word definition shown at top — optimized for AI answer boxes (Perplexity, ChatGPT, Google AIO). */
  answerBox?: string;
  /** Optional hook — short emotional opening shown above the body content. */
  hook?: string;
  /** 3–5 FAQs — rendered as a section + emitted as FAQPage JSON-LD. */
  faqs?: Faq[];
  /** Optional HowTo steps — emitted as HowTo JSON-LD for step-based pages. */
  howTo?: HowTo;
  /** Optional interactive widget slug. Lazy-loaded. */
  widget?: SeoWidget;
  /** Optional CTA text shown after content. */
  ctaText?: string;
  /** Page type — "article" (default) or "tool". Controls JSON-LD type and widget placement. */
  pageType?: SeoPageType;
  /** Absolute or root-relative OG image URL for this page. Falls back to /og-image.jpg. */
  ogImage?: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const wordCount = (s: string) => (s.match(/\S+/g) ?? []).length;

const SeoPage = ({ config }: { config: SeoPageConfig }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? Math.min(100, (h.scrollTop / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const readingMinutes = useMemo(() => {
    const total =
      wordCount(config.intro) +
      wordCount(config.answerBox ?? "") +
      config.sections.reduce((n, s) => n + wordCount(s.h2) + wordCount(s.body), 0) +
      (config.faqs?.reduce((n, f) => n + wordCount(f.q) + wordCount(f.a), 0) ?? 0);
    return Math.max(1, Math.round(total / 220));
  }, [config]);

  const toc = useMemo(
    () => config.sections.map((s) => ({ id: slugify(s.h2), label: s.h2 })),
    [config.sections],
  );

  const jsonLd = useMemo(() => {
    const url = `https://www.nexomind.ai${config.path}`;
    const isTool = config.pageType === "tool";
    const blobs: Record<string, unknown>[] = [];

    if (isTool) {
      // Tool pages emit WebApplication so AI assistants and search engines
      // identify the page as an interactive utility (not an article).
      blobs.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: config.metaTitle,
        description: config.metaDescription,
        url,
        applicationCategory: "HealthApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript.",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          name: "NexoMind",
          url: "https://www.nexomind.ai",
          logo: {
            "@type": "ImageObject",
            url: "https://www.nexomind.ai/og-image.jpg",
          },
        },
      });
    } else {
      blobs.push({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: config.metaTitle,
        description: config.metaDescription,
        mainEntityOfPage: url,
        url,
        author: { "@type": "Organization", name: "NexoMind" },
        publisher: {
          "@type": "Organization",
          name: "NexoMind",
          logo: { "@type": "ImageObject", url: "https://www.nexomind.ai/og-image.jpg" },
        },
      });
    }

    blobs.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.nexomind.ai/" },
        { "@type": "ListItem", position: 2, name: config.eyebrow, item: url },
      ],
    });

    if (config.faqs && config.faqs.length > 0) {
      blobs.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: config.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
    if (config.howTo && config.howTo.steps.length > 0) {
      blobs.push({
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: config.howTo.name,
        description: config.howTo.description ?? config.metaDescription,
        step: config.howTo.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      });
    }
    return blobs;
  }, [config]);

  return (
    <>
      <Seo
        title={config.metaTitle}
        description={config.metaDescription}
        canonical={`https://www.nexomind.ai${config.path}`}
        jsonLd={jsonLd}
        ogImage={config.ogImage}
        type={config.pageType === "tool" ? "website" : "article"}
      />

      {/* Sticky reading progress bar */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-[#111] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Sticky floating CTA — appears after user scrolls past the fold */}
      {progress > 8 && progress < 95 && (
        <Link
          to="/auth"
          aria-label="Start your first reflection"
          onClick={() => trackEvent("cta_click_seo_page", { path: config.path, location: "sticky" })}
          className="hidden md:inline-flex fixed bottom-6 right-6 z-[55] items-center gap-2 rounded-full bg-[#111] text-white px-5 py-3 font-barlow text-[14px] font-medium shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:bg-black transition-all"
        >
          Begin reflection <span aria-hidden>→</span>
        </Link>
      )}

      <SeoLayout
        eyebrow={config.eyebrow}
        title={config.title}
        italic={config.italic}
        intro={config.intro}
        related={config.related}
      >
        {(() => {
          const isTool = config.pageType === "tool";
          const widgetSlot = config.widget ? (
            <Suspense fallback={<div className="h-40" aria-hidden />}>
              {config.widget === "overthinking-analyzer" && <OverthinkingAnalyzer />}
              {config.widget === "instant-ai-demo" && (
                <div className="my-16">
                  <InstantAiDemo />
                </div>
              )}
              {config.widget === "clarity-quiz" && <ClarityQuiz />}
            </Suspense>
          ) : null;

          return (
            <>
              {/* Reading time + answer box (reading time hidden for tool pages) */}
              <div className="mb-10">
                {!isTool && (
                  <p className="font-barlow text-[12px] tracking-[0.18em] uppercase text-[#111]/45 mb-4">
                    {readingMinutes} min read
                  </p>
                )}

                {config.answerBox && (
                  <aside
                    role="note"
                    aria-label="Quick answer"
                    className="bg-white/80 border border-black/5 rounded-[20px] p-6 md:p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
                  >
                    <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-[#111]/45 mb-3">
                      Quick answer
                    </p>
                    <p className="font-barlow text-[16px] md:text-[17px] leading-relaxed text-[#111]/85">
                      {config.answerBox}
                    </p>
                  </aside>
                )}
              </div>

              {/* For tool pages, the widget is the hero — show it before any body content. */}
              {isTool && widgetSlot}

              {/* Hook */}
              {config.hook && (
                <p className="mb-12 font-instrument italic text-[24px] md:text-[30px] leading-snug text-[#111]/85 border-l-2 border-[#111]/15 pl-5">
                  {config.hook}
                </p>
              )}

              {/* Table of contents */}
              {toc.length > 1 && (
                <nav
                  aria-label="Table of contents"
                  className="mb-12 border-l border-black/10 pl-5"
                >
                  <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-[#111]/45 mb-3">
                    On this page
                  </p>
                  <ol className="space-y-2 font-barlow text-[15px] text-[#111]/70">
                    {toc.map((item, i) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="hover:text-[#111] transition-colors"
                        >
                          <span className="text-[#111]/40 mr-2">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Body sections */}
              <div className="space-y-12 font-barlow text-[17px] leading-relaxed text-[#111]/75">
                {config.sections.map((s) => {
                  const id = slugify(s.h2);
                  return (
                    <section key={s.h2} id={id} className="scroll-mt-28">
                      <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
                        <a href={`#${id}`} className="hover:underline underline-offset-4">
                          {s.h2}
                        </a>
                      </h2>
                      <p className="whitespace-pre-line">{s.body}</p>
                    </section>
                  );
                })}
              </div>

              {/* For article pages, the widget appears after the body content. */}
              {!isTool && widgetSlot}

              {/* Bottom CTA */}
              <div className="mt-16 rounded-[24px] bg-[#111] text-white p-8 md:p-12 text-center">
                <p className="font-instrument text-[28px] md:text-[36px] leading-tight mb-6">
                  {config.ctaText ?? "Start your first reflection and break the loop instantly."}
                </p>
                <Link
                  to="/auth"
                  onClick={() => trackEvent("cta_click_seo_page", { path: config.path, location: "bottom" })}
                  className="inline-block bg-white text-[#111] rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-white/90 transition"
                >
                  Open NexoMind →
                </Link>
              </div>
              {/* FAQ */}
              {config.faqs && config.faqs.length > 0 && (
                <section id="faq" className="mt-20 scroll-mt-28">
                  <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
                    ( FAQ )
                  </p>
                  <h2 className="font-instrument text-[32px] md:text-[44px] leading-tight text-[#111] mb-8">
                    Frequently asked questions
                  </h2>
                  <div className="divide-y divide-black/10 border-y border-black/10">
                    {config.faqs.map((f) => (
                      <details key={f.q} className="group py-5">
                        <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-instrument text-[20px] md:text-[24px] leading-snug text-[#111]">
                          <span>{f.q}</span>
                          <span className="font-barlow text-[20px] text-[#111]/40 transition-transform group-open:rotate-45 mt-1">
                            +
                          </span>
                        </summary>
                        <p className="mt-3 font-barlow text-[16px] leading-relaxed text-[#111]/70">
                          {f.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </>
          );
        })()}
      </SeoLayout>
    </>
  );
};

export default SeoPage;
