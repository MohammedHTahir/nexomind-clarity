import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  type?: string;
}

const SITE_URL = "https://www.nexomind.ai";
const DEFAULT_OG = `${SITE_URL}/og-image.jpg`;

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const Seo = ({ title, description, canonical, jsonLd, ogImage, type = "website" }: SeoProps) => {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);

    // Canonical (absolute, derived from window if not provided)
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const href = canonical ?? `${SITE_URL}${path}`;
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    // OpenGraph
    const og = ogImage ?? DEFAULT_OG;
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", type, "property");
    setMeta("og:url", href, "property");
    setMeta("og:image", og, "property");
    setMeta("og:site_name", "NexoMind", "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", og);

    // Robots / theme
    setMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1");

    // JSON-LD (supports array or single)
    const scripts: HTMLScriptElement[] = [];
    const blobs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    for (const blob of blobs) {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.text = JSON.stringify(blob);
      document.head.appendChild(s);
      scripts.push(s);
    }
    return () => {
      for (const s of scripts) {
        if (s.parentNode) s.parentNode.removeChild(s);
      }
    };
  }, [title, description, canonical, jsonLd, ogImage, type]);

  return null;
};

export default Seo;
