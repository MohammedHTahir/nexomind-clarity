/**
 * Browser-side blog loader. Pulls all posts via Vite glob import.
 */
import { parseMarkdown, renderMarkdown, type BlogPost } from "./blog-core";

export type { BlogPost };
export { parseMarkdown, renderMarkdown };

const modules = import.meta.glob("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const allPosts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split("/").pop()!.replace(/\.md$/, "");
    return parseMarkdown(slug, raw);
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const getPost = (slug: string) => allPosts.find((p) => p.slug === slug);
