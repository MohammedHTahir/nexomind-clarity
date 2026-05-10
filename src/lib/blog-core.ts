/**
 * Pure parsing utilities for blog markdown — safe to import from Node (tsx)
 * and the browser. No Vite-specific globs here.
 */
import { marked } from "marked";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  body: string;
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

export function parseMarkdown(slug: string, raw: string): BlogPost {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return {
      slug,
      title: slug,
      description: "",
      date: "",
      author: "NexoMind",
      tags: [],
      excerpt: "",
      body: raw,
    };
  }
  const [, fm, body] = match;
  const meta: Record<string, string | string[]> = {};
  for (const line of fm.split("\n")) {
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, valRaw] = m;
    let v: string | string[] = valRaw.trim();
    if (typeof v === "string" && v.startsWith('"') && v.endsWith('"')) {
      v = v.slice(1, -1);
    } else if (typeof v === "string" && v.startsWith("[") && v.endsWith("]")) {
      v = v
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
    }
    meta[key] = v;
  }
  return {
    slug,
    title: (meta.title as string) || slug,
    description: (meta.description as string) || "",
    date: (meta.date as string) || "",
    author: (meta.author as string) || "NexoMind",
    tags: (meta.tags as string[]) || [],
    excerpt: (meta.excerpt as string) || "",
    body: body.trim(),
  };
}

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}
