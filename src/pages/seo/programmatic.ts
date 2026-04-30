import { SeoPageConfig } from "@/components/SeoPage";

// ---- Source variables ----------------------------------------------------

export const EMOTIONS = [
  "overthinking",
  "anxiety",
  "stress",
  "confusion",
  "mental overload",
] as const;

export const SITUATIONS = [
  "at night",
  "at work",
  "in relationships",
  "before sleep",
  "when alone",
] as const;

export const INTENTS = [
  "how to stop",
  "how to reduce",
  "how to manage",
  "how to understand",
] as const;

type Emotion = (typeof EMOTIONS)[number];
type Situation = (typeof SITUATIONS)[number];
type Intent = (typeof INTENTS)[number];

// ---- Slug helpers --------------------------------------------------------

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export const buildSlug = (intent: Intent, emotion: Emotion, situation: Situation) =>
  `${slug(intent)}-${slug(emotion)}-${slug(situation)}`;

// ---- Copy fragments per variable -----------------------------------------

const emotionCopy: Record<Emotion, { noun: string; whyHappens: string; whyHard: string; whatHelps: string }> = {
  overthinking: {
    noun: "overthinking",
    whyHappens:
      "Overthinking is rarely about the topic on the surface. It's usually an unspoken feeling — fear, doubt, or something unresolved — looking for a place to land. The mind loops because the emotion underneath hasn't been named.",
    whyHard:
      "It feels productive. Replaying a conversation or rehearsing a decision can disguise itself as 'being responsible,' which is why we rarely interrupt it. The loop only tightens the longer it runs unobserved.",
    whatHelps:
      "Externalize the loop in writing — exactly as it sounds in your head. Then ask: what feeling is this loop protecting me from? Naming it usually loosens it more than solving it.",
  },
  anxiety: {
    noun: "anxiety",
    whyHappens:
      "Anxiety is a future-oriented emotion. It shows up when something feels uncertain and important at the same time. The body reacts as if the imagined outcome is already happening — which is why it feels so physical.",
    whyHard:
      "Anxiety borrows logic. It builds airtight arguments for worst-case scenarios, and trying to argue back rarely works. The mind isn't asking for proof — it's asking for safety.",
    whatHelps:
      "Slow the input. Write what's actually true right now, not what might be true later. Then name the underlying need — reassurance, rest, control, connection — and meet that need first.",
  },
  stress: {
    noun: "stress",
    whyHappens:
      "Stress is the gap between what's being asked of you and what you feel resourced to handle. It's not a personality trait — it's a math problem your nervous system is doing in real time.",
    whyHard:
      "Most stress hides as a to-do list. The list feels solvable, so we push through, while the real weight — emotional, relational, energetic — keeps accumulating quietly underneath.",
    whatHelps:
      "Separate the load from the list. Write what you're carrying, not what you have to do. Then choose one thing to make smaller today — not unimportant, just not heroic.",
  },
  confusion: {
    noun: "confusion",
    whyHappens:
      "Confusion usually isn't a lack of information. It's a collision between what you think, what you feel, and what you've been told to think. The mind freezes when these don't agree.",
    whyHard:
      "We try to think our way out, but confusion is rarely solved by more thinking. The clearer move is to name what each part of you actually wants — and let the contradiction be visible.",
    whatHelps:
      "Write three sentences: what your head says, what your gut says, what you'd say to a friend in the same spot. Clarity usually lives in the gap between the second and third.",
  },
  "mental overload": {
    noun: "mental overload",
    whyHappens:
      "Overload happens when the mind has more open tabs than working memory. It's not weakness — it's capacity. When everything feels equally urgent, nothing can be processed properly.",
    whyHard:
      "We try to push through, which adds new tabs without closing old ones. The result is a foggy, low-grade exhaustion that doesn't resolve with rest, only with reflection.",
    whatHelps:
      "Empty the tabs onto a page. Don't sort, don't prioritize — just externalize. Once everything is visible, the mind can finally tell the difference between what's heavy and what's just loud.",
  },
};

const situationCopy: Record<Situation, { phrase: string; context: string }> = {
  "at night": {
    phrase: "at night",
    context:
      "At night, the day's noise quiets down and the unprocessed parts get louder. Without distraction, the mind tries to file what wasn't filed during the day — which is why it picks the worst possible time.",
  },
  "at work": {
    phrase: "at work",
    context:
      "At work, the pressure to perform, decide, and be seen leaves little room to feel. Emotions don't disappear — they wait. They just show up as tension, second-guessing, or mid-meeting fog.",
  },
  "in relationships": {
    phrase: "in relationships",
    context:
      "Relationships amplify everything. The same thought you'd shrug off alone becomes heavy when another person is involved. It's not weakness — it's that connection raises the stakes of being misread.",
  },
  "before sleep": {
    phrase: "before sleep",
    context:
      "The minutes before sleep are when the mind reaches for whatever wasn't resolved. Without input, it scans the day for unfinished emotional business — and finds plenty.",
  },
  "when alone": {
    phrase: "when alone",
    context:
      "Solitude removes the buffer. Without conversation or distraction, whatever you've been carrying gets the floor. That's not a flaw of being alone — it's its quiet honesty.",
  },
};

const intentCopy: Record<Intent, { verb: string; angle: string }> = {
  "how to stop": {
    verb: "stop",
    angle:
      "Stopping isn't about willpower. It's about giving the loop a place to land — somewhere it can be seen instead of repeated. Once the underlying feeling is named, the loop usually loses its fuel.",
  },
  "how to reduce": {
    verb: "reduce",
    angle:
      "Reduction is gentler than elimination. The goal isn't a quiet mind — it's a mind that doesn't have to carry everything in private. Smaller, daily reflection lowers the baseline more than any one breakthrough.",
  },
  "how to manage": {
    verb: "manage",
    angle:
      "Management is the long game. It's less about reacting to hard moments and more about building a steady relationship with your own thoughts — so the hard moments arrive against a calmer backdrop.",
  },
  "how to understand": {
    verb: "understand",
    angle:
      "Understanding comes before fixing. Most of what looks like a thinking problem is an unnamed feeling. The shift happens the moment you can describe what's actually going on, in your own words.",
  },
};

// ---- Title casing --------------------------------------------------------

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bAt\b|\bIn\b|\bWhen\b|\bBefore\b/g, (w) => w.toLowerCase());

// ---- Page builder --------------------------------------------------------

function buildPage(intent: Intent, emotion: Emotion, situation: Situation): SeoPageConfig {
  const path = `/${buildSlug(intent, emotion, situation)}`;
  const e = emotionCopy[emotion];
  const s = situationCopy[situation];
  const i = intentCopy[intent];

  const niceTitle = titleCase(`${intent} ${emotion} ${situation}`);
  const splitIdx = niceTitle.lastIndexOf(" ");
  const titleHead = niceTitle.slice(0, splitIdx);
  const titleTail = niceTitle.slice(splitIdx + 1);

  const metaTitle = `${niceTitle} — A Calm, Practical Guide | NexoMind`;
  const metaDescription = `${niceTitle}. Understand why it happens, why it's hard, and a gentle, AI-supported way to find clarity with NexoMind.`;

  return {
    path,
    metaTitle: metaTitle.length > 65 ? `${niceTitle} | NexoMind` : metaTitle,
    metaDescription:
      metaDescription.length > 160
        ? `${niceTitle}. A calm, AI-supported way to find clarity with NexoMind.`
        : metaDescription,
    eyebrow: `${titleCase(emotion)} · ${titleCase(situation)}`,
    title: titleHead,
    italic: titleTail,
    intro: `${e.whyHappens.split(".")[0]}. And ${s.phrase}, that loop has its own gravity. Here's a calmer way through it.`,
    sections: [
      {
        h2: `Why ${e.noun} happens ${s.phrase}`,
        body: `${e.whyHappens}\n\n${s.context}`,
      },
      {
        h2: `Why it's hard to ${i.verb}`,
        body: `${e.whyHard}\n\n${i.angle}`,
      },
      {
        h2: "What actually helps",
        body: `${e.whatHelps}\n\nA few small, repeatable practices:\n\n• Set a 3-minute timer and write the loop down — unedited.\n• Name the feeling underneath in one word.\n• Ask: what would the calmest version of me say next?\n• Close with one honest sentence — not a solution, just a truth.`,
      },
      {
        h2: `How NexoMind helps with ${e.noun}`,
        body: `Write what's happening — messy, half-formed, whatever's there. NexoMind reads it and reflects back the emotion, the pattern, and a single grounded takeaway. It's not advice. It's your own thought, made clearer.\n\nUsed daily, it lowers the baseline of ${e.noun} ${s.phrase} — not by silencing thoughts, but by giving them somewhere to land.`,
      },
    ],
    related: [], // filled in pass 2
  };
}

// ---- Generate all combinations + internal links --------------------------

function generateAll(): SeoPageConfig[] {
  const pages: SeoPageConfig[] = [];
  for (const intent of INTENTS) {
    for (const emotion of EMOTIONS) {
      for (const situation of SITUATIONS) {
        pages.push(buildPage(intent, emotion, situation));
      }
    }
  }

  // Internal linking: 4 related per page — same emotion, same situation, same intent
  const byPath = new Map(pages.map((p) => [p.path, p]));
  for (const p of pages) {
    const [intentSlug, emotionSlug, situationSlug] = (() => {
      // Recover original tokens by matching the slug against known sets
      const path = p.path.replace(/^\//, "");
      const intent = INTENTS.find((x) => path.startsWith(slug(x)))!;
      const rest = path.slice(slug(intent).length + 1);
      const emotion = EMOTIONS.find((x) => rest.startsWith(slug(x)))!;
      const situation = SITUATIONS.find((x) => rest.endsWith(slug(x)))!;
      return [intent, emotion, situation] as const;
    })();

    const candidates = pages.filter((x) => x.path !== p.path);

    const sameEmotion = candidates.find((x) => x.path.includes(slug(emotionSlug)) && !x.path.includes(slug(situationSlug)));
    const sameSituation = candidates.find((x) => x.path.endsWith(slug(situationSlug)) && !x.path.includes(slug(emotionSlug)));
    const sameIntent = candidates.find(
      (x) =>
        x.path.startsWith(`/${slug(intentSlug)}-`) &&
        !x.path.includes(slug(emotionSlug)) &&
        !x.path.endsWith(slug(situationSlug)),
    );
    const wildcard = candidates.find(
      (x) =>
        ![sameEmotion?.path, sameSituation?.path, sameIntent?.path].includes(x.path) &&
        !x.path.includes(slug(emotionSlug)),
    );

    const picks = [sameEmotion, sameSituation, sameIntent, wildcard].filter(Boolean) as SeoPageConfig[];

    p.related = picks.slice(0, 4).map((r) => ({
      to: r.path,
      label: `${r.eyebrow}`,
      desc: r.intro.split(".")[0] + ".",
    }));

    void byPath;
  }

  return pages;
}

export const programmaticSeoPages: SeoPageConfig[] = generateAll();
