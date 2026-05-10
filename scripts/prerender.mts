/**
 * Build-time static prerendering.
 *
 * For every public route, generates `dist/<route>/index.html` containing:
 *  - Per-route <title>, <meta description>, canonical, OG/Twitter
 *  - Per-route JSON-LD (Article + BreadcrumbList + FAQPage where relevant)
 *  - Semantic body content inside a hidden #__prerender element so non-JS
 *    crawlers (Bing, Perplexity, ChatGPT, etc.) get real HTML to read.
 *
 * The React SPA continues to mount in #root; users always see the styled app.
 * On Lovable hosting, requesting /<slug> serves the prerendered file directly
 * because it exists on disk; deep refreshes still hit the SPA fallback.
 */
import { mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

import { allSeoPages } from "../src/pages/seo/DynamicSeoPage";
import type { SeoPageConfig } from "../src/components/SeoPage";
import { parseMarkdown, type BlogPost } from "../src/lib/blog";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(root, "dist");
const SITE_URL = "https://www.nexomind.ai";
const DEFAULT_OG = `${SITE_URL}/og-image.jpg`;

// ---------- HTML helpers --------------------------------------------------

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

const titleFromConfig = (c: SeoPageConfig) =>
  c.italic ? `${c.title} ${c.italic}` : c.title;

// ---------- Static (non-SEO-config) routes -------------------------------

interface StaticRoute {
  path: string;
  title: string;
  description: string;
  /** Optional H1 for the prerendered body; falls back to title. */
  h1?: string;
  /** Optional intro paragraph. */
  intro?: string;
}

const staticRoutes: StaticRoute[] = [
  {
    path: "/",
    title: "NexoMind — Clarity, one thought at a time",
    description:
      "NexoMind is an AI-powered journaling app that listens, understands, and helps you make sense of what's on your mind — privately, every day.",
    h1: "Understand your thoughts in seconds.",
    intro:
      "NexoMind is a private AI journaling app that turns scattered thoughts into clear reflection. Write what's looping in your head and get a calm, structured read on what's underneath — every day.",
  },
  {
    path: "/about",
    title: "About NexoMind — Private AI journaling for clarity",
    description:
      "Learn the story, values, and design principles behind NexoMind — a private AI journaling app built to help you stop overthinking and find clarity.",
    h1: "About NexoMind",
    intro:
      "NexoMind exists to make reflection feel light. We build a private AI journaling space that listens, understands, and helps you make sense of what's on your mind.",
  },
  {
    path: "/founder",
    title: "Founder's note — NexoMind",
    description:
      "A note from the founder of NexoMind on why private AI journaling matters and how the app was designed to quiet overthinking.",
    h1: "A note from the founder",
  },
  {
    path: "/contact",
    title: "Contact NexoMind",
    description: "Reach the NexoMind team — questions, feedback, partnerships, and press inquiries.",
    h1: "Contact NexoMind",
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy — NexoMind",
    description:
      "How NexoMind collects, stores, and protects your private journal entries and personal data.",
    h1: "Privacy Policy",
  },
  {
    path: "/terms-of-service",
    title: "Terms of Service — NexoMind",
    description: "The terms governing your use of NexoMind, our private AI journaling app.",
    h1: "Terms of Service",
  },
];

// ---------- JSON-LD builders ---------------------------------------------

function articleJsonLd(c: SeoPageConfig) {
  const url = `${SITE_URL}${c.path}`;
  const blobs: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: c.metaTitle,
      description: c.metaDescription,
      mainEntityOfPage: url,
      url,
      author: { "@type": "Organization", name: "NexoMind" },
      publisher: {
        "@type": "Organization",
        name: "NexoMind",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: c.eyebrow, item: url },
      ],
    },
  ];
  if (c.faqs && c.faqs.length > 0) {
    blobs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return blobs;
}

// ---------- Semantic body renderers --------------------------------------

function renderSeoBody(c: SeoPageConfig): string {
  const parts: string[] = [];
  parts.push(`<nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <span>${escapeHtml(c.eyebrow)}</span></nav>`);
  parts.push(`<p class="eyebrow">${escapeHtml(c.eyebrow)}</p>`);
  parts.push(`<h1>${escapeHtml(titleFromConfig(c))}</h1>`);
  parts.push(`<p class="intro">${escapeHtml(c.intro)}</p>`);

  if (c.answerBox) {
    parts.push(
      `<aside aria-label="Quick answer"><strong>Quick answer.</strong> ${escapeHtml(c.answerBox)}</aside>`,
    );
  }
  if (c.hook) parts.push(`<blockquote>${escapeHtml(c.hook)}</blockquote>`);

  if (c.sections.length > 1) {
    parts.push("<nav aria-label='On this page'><ol>");
    for (const s of c.sections) {
      parts.push(`<li><a href="#${slugify(s.h2)}">${escapeHtml(s.h2)}</a></li>`);
    }
    parts.push("</ol></nav>");
  }

  for (const s of c.sections) {
    const id = slugify(s.h2);
    parts.push(`<section id="${id}"><h2>${escapeHtml(s.h2)}</h2>`);
    for (const para of s.body.split(/\n+/)) {
      if (para.trim()) parts.push(`<p>${escapeHtml(para)}</p>`);
    }
    parts.push("</section>");
  }

  if (c.faqs && c.faqs.length > 0) {
    parts.push("<section id='faq'><h2>Frequently asked questions</h2><dl>");
    for (const f of c.faqs) {
      parts.push(`<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`);
    }
    parts.push("</dl></section>");
  }

  if (c.related.length > 0) {
    parts.push("<aside aria-label='Continue reading'><h2>Continue reading</h2><ul>");
    for (const r of c.related) {
      parts.push(`<li><a href="${escapeHtml(r.to)}">${escapeHtml(r.label)}</a> — ${escapeHtml(r.desc)}</li>`);
    }
    parts.push("</ul></aside>");
  }

  return parts.join("\n");
}

function renderStaticBody(r: StaticRoute): string {
  const parts: string[] = [];
  parts.push(`<h1>${escapeHtml(r.h1 ?? r.title)}</h1>`);
  if (r.intro) parts.push(`<p>${escapeHtml(r.intro)}</p>`);
  return parts.join("\n");
}

// ---------- HTML page assembler ------------------------------------------

interface PageInputs {
  path: string;
  title: string;
  description: string;
  body: string;
  jsonLd?: Record<string, unknown>[];
  ogType?: string;
}

function buildPageHtml(template: string, p: PageInputs): string {
  const url = `${SITE_URL}${p.path === "/" ? "/" : p.path}`;
  const ogType = p.ogType ?? "website";

  // 1. Replace the static <title>
  let html = template.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(p.title)}</title>`,
  );

  // 2. Replace the static <meta name="description">
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeHtml(p.description)}" />`,
  );

  // 3. Replace canonical link
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
  );

  // 4. Replace OG/Twitter title + description + url
  html = html.replace(
    /<meta property="og:title"[^>]*>/g,
    `<meta property="og:title" content="${escapeHtml(p.title)}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title"[^>]*>/g,
    `<meta name="twitter:title" content="${escapeHtml(p.title)}" />`,
  );
  html = html.replace(
    /<meta property="og:description"[^>]*>/g,
    `<meta property="og:description" content="${escapeHtml(p.description)}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description"[^>]*>/g,
    `<meta name="twitter:description" content="${escapeHtml(p.description)}" />`,
  );

  // 5. Inject og:url (not present in template yet)
  const ogUrlTag = `<meta property="og:url" content="${escapeHtml(url)}" />`;
  const ogTypeTag = `<meta property="og:type" content="${escapeHtml(ogType)}" />`;
  html = html.replace(
    /<meta property="og:type"[^>]*>/,
    `${ogTypeTag}\n    ${ogUrlTag}`,
  );

  // 6. Inject per-route JSON-LD before </head>
  if (p.jsonLd && p.jsonLd.length > 0) {
    const ldScripts = p.jsonLd
      .map(
        (blob) =>
          `<script type="application/ld+json">${JSON.stringify(blob).replace(/</g, "\\u003c")}</script>`,
      )
      .join("\n");
    html = html.replace("</head>", `${ldScripts}\n</head>`);
  }

  // 7. Inject prerendered body content as a sibling of #root, hidden from
  //    sighted users but readable by non-JS crawlers.
  const prerenderBlock = `<div id="__prerender" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden" aria-hidden="true">\n${p.body}\n</div>`;
  html = html.replace(
    '<script type="module" src="/src/main.tsx"></script>',
    `${prerenderBlock}\n    <script type="module" src="/src/main.tsx"></script>`,
  );

  return html;
}

// ---------- Main ---------------------------------------------------------

function main() {
  const templatePath = resolve(distDir, "index.html");
  let template: string;
  try {
    template = readFileSync(templatePath, "utf8");
  } catch {
    console.error(`[prerender] dist/index.html not found — run \`vite build\` first.`);
    process.exit(0); // do not fail the build
  }

  const written: string[] = [];

  // Static routes
  for (const r of staticRoutes) {
    const html = buildPageHtml(template, {
      path: r.path,
      title: r.title,
      description: r.description,
      body: renderStaticBody(r),
    });
    const outDir = r.path === "/" ? distDir : resolve(distDir, r.path.replace(/^\//, ""));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "index.html"), html);
    written.push(r.path);
  }

  // SEO routes (configs)
  for (const c of allSeoPages as SeoPageConfig[]) {
    const html = buildPageHtml(template, {
      path: c.path,
      title: c.metaTitle,
      description: c.metaDescription,
      body: renderSeoBody(c),
      jsonLd: articleJsonLd(c),
      ogType: "article",
    });
    const outDir = resolve(distDir, c.path.replace(/^\//, ""));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "index.html"), html);
    written.push(c.path);
  }

  console.log(`[prerender] wrote ${written.length} static HTML files.`);
}

main();
