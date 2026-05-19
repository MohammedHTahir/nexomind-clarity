# Founder Article — Backlink Kit

Drafts of the founder story, tuned per platform. Ship in the order below.

The article exists to:

1. Earn 4 real backlinks (one per platform) to the homepage,
   `/how-to-stop-overthinking`, `/ai-journaling`, and the new
   `/overthinking-analyzer`.
2. Drive readers to **try the analyzer with no signup** — that's the
   strongest conversion path on the site right now.
3. Establish a calm, honest founder voice that matches the rest of
   NexoMind's writing.

---

## Before you publish — personalize the opening

The canonical article opens with a 2:47 AM scene. **Replace that scene with
your real one.** It can be 2 sentences. The whole emotional weight of the
article hangs on the reader believing the moment.

Look for `[PERSONALIZE]` markers in the files. There are two:

1. **Opening scene** (in all 4 files) — the specific 2 AM beat.
2. **The hard part** (in all 4 files) — the moment in building the product
   where you almost did the wrong thing. Your real version of "I cut features
   for months" or whatever the actual hard part was.

If your real story is different from the placeholder, **rewrite freely**.
The shape (problem → insight → what I built → hard part → try it → close)
matters more than the words.

---

## Posting order and why it matters

Medium first, IndieHackers last. Reason: DEV.to and Hashnode both support
`canonical_url`, which tells search engines "this is a republish, please
credit the original." If Medium is the canonical, the SEO equity from all
three platforms consolidates there + flows back to NexoMind via the
in-article links.

| # | Platform | File | Notes |
|---|---|---|---|
| 1 | Medium | `01-medium.md` | Canonical. No frontmatter. Post the body as-is. Note the published URL — you'll need it for #2 and #3. |
| 2 | DEV.to | `02-dev-to.md` | Has YAML frontmatter. Update `canonical_url` to your Medium URL before posting. |
| 3 | Hashnode | `03-hashnode.md` | Set canonical URL to your Medium URL in Hashnode's post settings (it's a UI field, not frontmatter). |
| 4 | IndieHackers | `04-indie-hackers.md` | Slightly different title and structure. IH doesn't support canonical, so this version is rewritten enough to read native. |

Wait 24–48 hours between Medium and the other three. Lets Medium index first.

---

## Anchor link convention

Every version uses the same 4 anchors. **Don't add more.** Excess
self-linking looks promotional and hurts trust:

- Homepage → `https://www.nexomind.ai`
- `/how-to-stop-overthinking` → linked once near the close
- `/ai-journaling` → linked once mid-article when describing the product
- `/overthinking-analyzer` → linked once in the "try it" section (the conversion link)

The links are written so they read as natural reading recommendations, not
as a CTA. That's intentional. Marketing-speak in a founder essay tanks the
piece.

---

## UTM tags — don't use them

UTM parameters on backlinks signal "marketing campaign" to search engines
and read like ads to humans. The point of these articles is to look like
honest founder writing, not a funnel. Track referrers in your analytics
provider instead — Plausible, GA4, etc. all show referrer domains
natively.

---

## After you publish — clean up this folder

Once all 4 are live:

- **Option A (recommended):** Move this folder out of the public repo.
  Drop it into a private gist, Notion, or a private branch. Keeps your
  drafts off public GitHub search.
- **Option B:** Delete the folder. The articles live on the platforms now.
- **Option C:** Leave it. GitHub markdown rarely outranks Medium for the
  same content, but if you care about avoiding any duplicate-content
  ambiguity, pick A or B.

---

## What success looks like

Realistic 30-day numbers if the personalization is honest:

- 200–800 reads on Medium (with maybe 1 boost from the platform)
- 1k–3k reads on DEV.to (DEV's algorithm rewards "I built X" stories)
- 300–1k reads on Hashnode
- 50–300 reads on IndieHackers, plus ~5–15 founder comments

Of those, expect ~3–8% to click through to NexoMind. The analyzer link is
your conversion event — track clicks on that one specifically.

That's how the article earns its place in the backlink plan. Not from
volume. From sending qualified, curious readers directly to a tool they
can use without signing up.
