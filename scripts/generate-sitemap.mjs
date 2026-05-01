import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredSeoFile = readFileSync(resolve(root, "src/pages/seo/requiredSeoPages.ts"), "utf8");
const seoPagesFile = readFileSync(resolve(root, "src/pages/seo/seoPages.ts"), "utf8");
const programmaticFile = readFileSync(resolve(root, "src/pages/seo/programmatic.ts"), "utf8");

const extractPaths = (source) =>
  Array.from(source.matchAll(/path:\s*"(\/[a-z0-9-]+)"/g), (match) => match[1]);

const slug = (value) => value.toLowerCase().replace(/\s+/g, "-");
const extractArray = (name, source) => {
  const match = source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const;`));
  if (!match) return [];
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);
};

const emotions = extractArray("EMOTIONS", programmaticFile);
const situations = extractArray("SITUATIONS", programmaticFile);
const intents = extractArray("INTENTS", programmaticFile);

const programmaticPaths = intents.flatMap((intent) =>
  emotions.flatMap((emotion) =>
    situations.map((situation) => `/${slug(intent)}-${slug(emotion)}-${slug(situation)}`),
  ),
);

const paths = Array.from(
  new Set(["/", ...extractPaths(requiredSeoFile), ...extractPaths(seoPagesFile), ...programmaticPaths]),
);

const siteUrl = "https://nexomind.app";
const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(resolve(root, "dist/sitemap.xml"), xml);