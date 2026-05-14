// Submits all URLs from public/sitemap.xml to IndexNow (Bing, Yandex, DuckDuckGo, etc.)
// Usage: node scripts/indexnow-submit.mjs [url1 url2 ...]
//   - With no args: submits every <loc> in public/sitemap.xml
//   - With args:    submits only the given URLs (must be on the same host)

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const HOST = "www.nexomind.ai";
const KEY = "fd5ed7217f1d51594244b5760b7a3f30";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

const argUrls = process.argv.slice(2).filter(Boolean);

let urls = argUrls;
if (urls.length === 0) {
  const xml = readFileSync(resolve(root, "public/sitemap.xml"), "utf8");
  urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1].trim());
}

// Same-host requirement per IndexNow spec
urls = urls.filter((u) => {
  try {
    return new URL(u).host === HOST;
  } catch {
    return false;
  }
});

if (urls.length === 0) {
  console.error("No URLs to submit.");
  process.exit(1);
}

// IndexNow allows up to 10,000 URLs per request — chunk to be safe.
const chunkSize = 1000;
const chunks = [];
for (let i = 0; i < urls.length; i += chunkSize) chunks.push(urls.slice(i, i + chunkSize));

let failures = 0;
for (const [i, chunk] of chunks.entries()) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: chunk,
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  // 200 = received, 202 = accepted (validation pending). Both are success.
  const ok = res.status === 200 || res.status === 202;
  console.log(
    `[chunk ${i + 1}/${chunks.length}] ${chunk.length} urls -> ${res.status} ${res.statusText}${text ? ` :: ${text.slice(0, 200)}` : ""}`,
  );
  if (!ok) failures++;
}

console.log(
  `\nSubmitted ${urls.length} URL(s) to IndexNow across ${chunks.length} request(s). Failures: ${failures}.`,
);
process.exit(failures > 0 ? 1 : 0);
