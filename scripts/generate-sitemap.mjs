import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredSeoFile = readFileSync(resolve(root, "src/pages/seo/requiredSeoPages.ts"), "utf8");
const seoPagesFile = readFileSync(resolve(root, "src/pages/seo/seoPages.ts"), "utf8");
const targetSeoFile = readFileSync(resolve(root, "src/pages/seo/targetSeoPages.ts"), "utf8");
const comparisonSeoFile = readFileSync(resolve(root, "src/pages/seo/comparisonSeoPages.ts"), "utf8");
const programmaticFile = readFileSync(resolve(root, "src/pages/seo/programmatic.ts"), "utf8");

const extractPaths = (source) =>
  Array.from(source.matchAll(/path:\s*"(\/[a-z0-9-]+)"/g), (match) => match[1]);

const slug = (value) => value.toLowerCase().replace(/\s+/g, "-");
const extractArray = (name, source) => {
  const match = source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const;`));
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);
};

// Extract the curated allowlist of programmatic combinations.
// Format in source: ["how to stop", "overthinking", "at night"],
const curatedMatch = programmaticFile.match(/CURATED[^=]*=\s*\[([\s\S]*?)\];/);
const programmaticPaths = curatedMatch
  ? Array.from(curatedMatch[1].matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g), (m) =>
      `/${slug(m[1])}-${slug(m[2])}-${slug(m[3])}`,
    )
  : [];

// Note: /terms removed (it's a duplicate of /terms-of-service and now 301-redirects to it)
const staticPaths = ["/", "/about", "/founder", "/contact", "/privacy-policy", "/terms-of-service", "/pricing", "/blog", "/compare"];

// Blog posts
const blogDir = resolve(root, "src/content/blog");
const blogPaths = existsSync(blogDir)
  ? readdirSync(blogDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => `/blog/${f.replace(/\.md$/, "")}`)
  : [];

const paths = Array.from(
  new Set([
    ...staticPaths,
    ...blogPaths,
    ...extractPaths(requiredSeoFile),
    ...extractPaths(seoPagesFile),
    ...extractPaths(targetSeoFile),
    ...extractPaths(comparisonSeoFile),
    ...programmaticPaths,
  ]),
);

// Real per-file lastmod from git history; fall back to today if git is unavailable.
const today = new Date().toISOString().slice(0, 10);

const gitLastMod = (filePath) => {
  if (!existsSync(filePath)) return today;
  try {
    const out = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return out ? out.slice(0, 10) : today;
  } catch {
    return today;
  }
};

// Map a URL path to the source file most likely to determine its last modified date.
const sourceFor = (path) => {
  if (path === "/") return "src/pages/Index.tsx";
  if (path === "/about") return "src/pages/About.tsx";
  if (path === "/founder") return "src/pages/Founder.tsx";
  if (path === "/contact") return "src/pages/Contact.tsx";
  if (path === "/privacy-policy") return "src/pages/PrivacyPolicy.tsx";
  if (path === "/terms-of-service") return "src/pages/TermsOfService.tsx";
  if (path === "/blog") return "src/pages/Blog.tsx";
  if (path === "/pricing") return "src/pages/Pricing.tsx";
  if (path === "/compare") return "src/pages/Compare.tsx";
  if (path.startsWith("/blog/")) {
    const slug = path.replace("/blog/", "");
    return `src/content/blog/${slug}.md`;
  }
  if (path === "/stop-overthinking") return "src/pages/seo/StopOverthinking.tsx";
  if (path === "/ai-journaling-app") return "src/pages/seo/AiJournalingApp.tsx";
  if (path === "/mental-clarity") return "src/pages/seo/MentalClarity.tsx";
  // Programmatic and dynamic SEO pages all derive from these data files
  return "src/pages/seo/seoPages.ts";
};

const siteUrl = "https://nexomind.ai";
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    const lastmod = gitLastMod(resolve(root, sourceFor(path)));
    return `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "/" ? "1.0" : "0.8"}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(resolve(root, "public/sitemap.xml"), xml);
writeFileSync(resolve(root, "dist/sitemap.xml"), xml);
