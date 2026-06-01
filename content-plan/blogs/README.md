# NexoMind Blog Content Plan - Replication System

## The System

One master blog. Four to five platform versions. Every week.

The master article is the source of truth. It contains the full argument, all anecdotes, the complete structure. Platform versions are rewritten (not reformatted) to feel native to each platform.

This is not cross-posting. Cross-posting is lazy and platforms punish it. This is replication - same core idea, different expression for different audiences.

---

## How the Replication Works

```
master.md (1,800 words, full argument)
    ├── medium.md (emotional, storytelling, SEO-optimized)
    ├── devto.md (builder-focused, technical framing, YAML frontmatter)
    ├── hashnode.md (tutorial/educational, dev SEO)
    ├── reddit.md (short, discussion-first, no links unless asked)
    └── hackernews.md (technical, terse, only if strong angle)
```

Each version is rewritten from the master. Not shortened. Not reformatted. Rewritten for the native audience of that platform.

---

## Publishing Schedule

One article per week. Four weeks planned.

| Week | Theme | Publish Date Target |
|------|-------|-------------------|
| 1 | The Hidden Loop Behind Overthinking | Week 1 |
| 2 | Why I Built an AI That Listens Instead of Talks | Week 2 |
| 3 | Your Mind Has Patterns You Can't See | Week 3 |
| 4 | Privacy in Mental Health Apps Is Broken | Week 4 |

---

## Platform Roles

| Platform | Role | Audience | What wins here |
|----------|------|----------|---------------|
| Medium | SEO authority, canonical source | General readers, self-improvement crowd | Emotion, storytelling, length ok |
| Dev.to | Builder discovery | Developers, indie hackers | Technical framing, "I built X" stories |
| Hashnode | Dev SEO, technical authority | Developer-leaning readers | Tutorial format, how-it-works angles |
| Reddit | Social validation, discussion seeding | Subreddit-specific communities | Short, genuine, question-first, no promotion |
| Hacker News | Viral spike potential | Technical, skeptical, high-signal readers | Terse, system-level, zero marketing |

---

## Workflow Steps

1. Write master.md - full argument, all anecdotes, complete structure
2. Rewrite medium.md - emotional hook, storytelling, SEO keywords woven in
3. Rewrite devto.md - technical reframe, builder lessons, YAML frontmatter with canonical_url
4. Rewrite hashnode.md - educational angle, tutorial-ish, dev SEO
5. Write reddit.md - short discussion post, no links, ends with question
6. Write hackernews.md - only if there's a strong technical angle. Skip if not.
7. Publish Medium first (it becomes canonical)
8. Wait 24-48 hours
9. Publish Dev.to + Hashnode (both pointing canonical_url to Medium)
10. Post Reddit (timing based on subreddit activity)
11. Post HN (only if article got traction or topic is trending)

---

## SEO Keywords Per Article

### Week 1: Overthinking Loops
- overthinking loops
- cognitive patterns
- mental clarity
- thought spirals
- overthinking patterns
- how to stop overthinking
- rumination cycles

### Week 2: AI That Listens
- AI reflection tool
- AI journaling
- less is more AI
- AI product design
- mindful AI
- AI that helps you think

### Week 3: Pattern Recognition
- cognitive patterns you can't see
- self-awareness blind spots
- journaling patterns
- pattern recognition mental health
- recurring thought patterns
- emotional patterns

### Week 4: Privacy in Mental Health
- mental health app privacy
- end-to-end encryption journaling
- E2EE mental health
- journal app security
- private journaling app
- encrypted thoughts

---

## Canonical URL Strategy

Medium is always the canonical source. Here's why:

1. Medium has the strongest domain authority for essay-style content
2. Dev.to and Hashnode both support canonical_url in frontmatter/settings
3. SEO equity from all platforms consolidates on the Medium version
4. Medium links flow equity back to nexomind.ai via in-article links

### Implementation:
- Publish to Medium first
- Copy the published Medium URL
- Set canonical_url in Dev.to YAML frontmatter
- Set canonical URL in Hashnode post settings (UI field)
- Reddit and HN don't use canonical (they're discussion posts, not articles)

---

## Publishing Cadence

- **Day 0:** Publish Medium version
- **Day 1-2:** Wait. Let Medium index. Let early readers engage.
- **Day 2-3:** Publish Dev.to and Hashnode (same day is fine for these two)
- **Day 3-5:** Post Reddit (time based on subreddit peak hours)
- **Day 5-7:** Post HN (only if Medium got 50+ claps or topic is trending)

Never post all platforms same day. Looks spammy. Search engines notice. Readers notice.

---

## Voice Rules (Apply to All)

- Sound like a founder writing at midnight, not a content marketer
- Short paragraphs. 2-4 sentences max.
- Lowercase "i" in casual/personal moments
- No em dashes. Hyphens or period-separated sentences.
- Banned words: game-changer, leverage, unlock, journey, deep dive
- Start some paragraphs mid-thought
- Mix vulnerability with insight
- Reference specific moments: 3am, the DM, the metric
- Each platform version should feel native, not copy-pasted

---

## Metrics to Track

- Medium: claps, reads, read ratio, follower growth
- Dev.to: reactions, comments, saves, profile views
- Hashnode: views, reactions, newsletter signups
- Reddit: upvotes, comment count, saves
- HN: points, comment quality, referral traffic

Success = qualified traffic to nexomind.ai, not vanity metrics. Track referrer source in analytics for each platform.
