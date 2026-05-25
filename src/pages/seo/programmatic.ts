import { SeoPageConfig } from "@/components/SeoPage";

// ---- Curated, high-intent combinations -----------------------------------
//
// We previously generated 100 templated pages (4 intents × 5 emotions × 5
// situations). Google flagged most as "Discovered – currently not indexed"
// because they read as near-duplicates. We now ship a small, deliberate set
// of combinations that match real search demand, each with its own answer
// box and FAQ block so no two pages look the same to a crawler.

type Intent = "how to stop" | "how to reduce" | "how to manage" | "how to understand";
type Emotion = "overthinking" | "anxiety" | "stress" | "confusion" | "mental overload";
type Situation = "at night" | "at work" | "in relationships" | "before sleep" | "when alone";

// Kept exports so other files (sitemap generator) keep type-checking, but
// the matrix is no longer enumerated by these arrays.
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

const CURATED: Array<[Intent, Emotion, Situation]> = [
  ["how to stop", "overthinking", "at night"],
  ["how to stop", "overthinking", "at work"],
  ["how to stop", "overthinking", "in relationships"],
  ["how to stop", "overthinking", "before sleep"],
  ["how to reduce", "anxiety", "at night"],
  ["how to reduce", "anxiety", "at work"],
  ["how to manage", "stress", "at work"],
  ["how to manage", "mental overload", "at work"],
  ["how to understand", "overthinking", "when alone"],
  ["how to understand", "anxiety", "in relationships"],
  ["how to stop", "confusion", "when alone"],
  ["how to reduce", "mental overload", "before sleep"],
];

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export const buildSlug = (intent: Intent, emotion: Emotion, situation: Situation) =>
  `${slug(intent)}-${slug(emotion)}-${slug(situation)}`;

// ---- Copy fragments ------------------------------------------------------

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

// ---- Unique answer box + FAQ per page (the differentiator) ---------------

type Extra = { answerBox: string; faqs: { q: string; a: string }[] };

const extras: Record<string, Extra> = {
  "how-to-stop-overthinking-at-night": {
    answerBox:
      "To stop overthinking at night, externalize the loop instead of replaying it. Write the exact sentence circling in your head, name the feeling underneath in one word (fear, regret, doubt), and close with one honest line you'd say to a friend. Most loops loosen within three minutes once seen on the page.",
    faqs: [
      { q: "Why does my mind race the moment I lie down?", a: "Lying down removes the day's distractions, so unprocessed feelings rise to the surface. The mind isn't broken — it's finally getting a quiet enough room to file what it couldn't earlier." },
      { q: "Is it better to get up or stay in bed?", a: "If you're still spinning after ~20 minutes, get up. Sit somewhere dim, write for three minutes, then return. Staying in bed teaches the brain that bed = thinking. Brief reset breaks that link." },
      { q: "Does journaling at night actually help?", a: "Yes, when it's expressive rather than analytical. The point isn't to solve anything — it's to give the loop somewhere to land outside your head so the nervous system can stand down." },
    ],
  },
  "how-to-stop-overthinking-at-work": {
    answerBox:
      "To stop overthinking at work, separate the decision from the performance of deciding. Write the actual choice in one sentence, list the two real options, and pick the one your calmest self would defend. Most workplace overthinking is rehearsal for being judged — naming that drains it.",
    faqs: [
      { q: "Why do I overthink small work decisions?", a: "Small decisions feel safer to obsess over than big ones. The mind uses them as proxies — replaying an email is easier than facing the bigger question of whether you feel safe and valued at work." },
      { q: "How do I stop replaying meetings afterward?", a: "Write the meeting as three sentences: what happened, what you wish you'd said, what you'll do next. Compressing it forces a closing — the loop usually only continues because nothing closed it." },
      { q: "Is this a sign of burnout?", a: "Sometimes. When overthinking persists even on weekends and you can't stop rehearsing work, the issue is rarely the work itself — it's that your nervous system hasn't been allowed to fully exit." },
    ],
  },
  "how-to-stop-overthinking-in-relationships": {
    answerBox:
      "To stop overthinking in relationships, write what you're actually afraid of, not what you think they're thinking. Most relationship overthinking is your mind running simulations to prevent rejection. Naming the fear directly — being misread, abandoned, not enough — usually quiets the simulations more than analyzing them does.",
    faqs: [
      { q: "Why do I overanalyze every text?", a: "Texts strip out tone, timing, and body language — so the mind fills the gap with whatever it's already worried about. The text isn't ambiguous; your underlying feeling about the relationship is." },
      { q: "Is overthinking ruining my relationships?", a: "It strains them, but the deeper cost is to you — overthinking turns moments of connection into surveillance. Most partners feel the watchfulness even when they can't name it." },
      { q: "How do I trust someone without obsessively reading signals?", a: "Trust is built by tolerating ambiguity, not eliminating it. Each time you sit with not-knowing for ten minutes before reacting, you teach yourself the discomfort isn't dangerous." },
    ],
  },
  "how-to-stop-overthinking-before-sleep": {
    answerBox:
      "To stop overthinking before sleep, write a three-line nightly close: one thing that's still open, one thing you're carrying, one thing you can put down until morning. The mind usually keeps you up because nothing officially ended the day. A written close gives it permission to stop scanning.",
    faqs: [
      { q: "Why does my brain wait until bedtime to bring everything up?", a: "Bedtime is the first quiet window the brain gets all day. It uses the silence to process — which is healthy in principle, but unbearable when it happens against a deadline of sleep." },
      { q: "Should I journal in bed?", a: "Journal before bed — not in it. Use a chair or the floor, somewhere your body associates with being upright. Bed should stay a place for sleep and rest, not problem-solving." },
      { q: "What if I wake up at 3am still thinking?", a: "Don't try to argue the thoughts down. Write them in two sentences, then read one paragraph of something unrelated. The point is to interrupt the loop's grip, not win against it." },
    ],
  },
  "how-to-reduce-anxiety-at-night": {
    answerBox:
      "To reduce anxiety at night, slow the input before you slow the body. Write what's actually true right now — in your room, in this hour — separate from what might be true tomorrow. Anxiety shrinks fastest when the present moment is named in concrete, sensory language.",
    faqs: [
      { q: "Why is anxiety always worse at night?", a: "Cortisol drops, your defenses lower, and the mind has time to register what it pushed aside. Night doesn't create anxiety — it reveals what daytime busyness was masking." },
      { q: "Do breathing exercises actually help?", a: "Yes, especially long exhales (longer than the inhale). They directly signal the vagus nerve that you're safe. Pair breathing with writing for compounding effect — body and mind both need the cue." },
      { q: "When should I be concerned about night anxiety?", a: "When it disrupts sleep more than two nights a week for several weeks, or when it shows up with physical symptoms (chest tightness, panic). That's a signal to talk to a clinician, not just journal harder." },
    ],
  },
  "how-to-reduce-anxiety-at-work": {
    answerBox:
      "To reduce anxiety at work, name the specific worst case in writing, then name the most likely case beside it. Anxiety inflates because the worst case lives unchallenged in your head. Putting both on paper, side by side, restores proportion faster than reassurance from anyone else can.",
    faqs: [
      { q: "How do I calm down before a meeting?", a: "Write the sentence you're afraid to say. Then write what would actually happen if you said it. Most pre-meeting anxiety is fear of a sentence you've never let yourself check against reality." },
      { q: "Should I tell my manager I'm anxious?", a: "Usually no, in those words. Translate it into needs: 'I'd like clearer scope on X,' or 'I need an extra day on Y.' Managers respond to needs more readily than to emotional labels." },
      { q: "Is workplace anxiety a sign I'm in the wrong job?", a: "Not necessarily. Some anxiety is the job. Persistent dread on Sunday evenings, though — that pattern usually deserves a more honest conversation with yourself about fit." },
    ],
  },
  "how-to-manage-stress-at-work": {
    answerBox:
      "To manage stress at work, write what you're carrying (not what you have to do) once a day. The to-do list captures tasks; it doesn't capture weight. Five minutes of naming the weight — uncertainty, unfairness, fatigue — keeps stress from compounding into burnout.",
    faqs: [
      { q: "What's the difference between stress and burnout?", a: "Stress is the load. Burnout is what happens when the load goes unnamed and unrelieved for too long. You can carry heavy stress and recover; burnout is what stress becomes when there's no exit." },
      { q: "How do I stop bringing work stress home?", a: "Build a closing ritual — a 5-minute write at the end of the day where you name what's open and what can wait. The brain needs a marker that work has ended, not just a calendar saying so." },
      { q: "Is taking time off enough?", a: "Time off rests the body but rarely the mind. Without reflection, you return to the same patterns that produced the stress. Use part of the time to write what you don't want to walk back into." },
    ],
  },
  "how-to-manage-mental-overload-at-work": {
    answerBox:
      "To manage mental overload at work, do a 'tab dump' — write every open thought on one page without sorting. Overload isn't from too much work; it's from too many unfinished thought-threads competing for working memory. Once they're visible, the mind can finally distinguish urgent from just loud.",
    faqs: [
      { q: "Why does everything feel equally urgent?", a: "When the mind is overloaded, it loses its ability to rank. Cortisol flattens priority. The fix isn't a better to-do app — it's emptying the mental queue onto paper so ranking becomes possible again." },
      { q: "How often should I do a brain dump?", a: "Once a day is plenty for most people. Twice on heavy days — once mid-morning, once before logging off. The goal is preventing accumulation, not constant management." },
      { q: "Is mental overload a productivity problem?", a: "It looks like one, but it's almost always an emotional-processing problem in disguise. The mind is full because feelings are unfiled, not because tasks are." },
    ],
  },
  "how-to-understand-overthinking-when-alone": {
    answerBox:
      "To understand overthinking when alone, treat the loop as a messenger, not a malfunction. Write what the loop is repeating and ask: what is it trying to protect me from feeling? Most solitary overthinking is the mind's way of staying busy so an underlying emotion stays unmet.",
    faqs: [
      { q: "Why do I overthink more when I'm alone?", a: "Solitude removes external regulation. Without conversation or distraction to redirect attention, whatever you've been carrying has the floor. That's not a flaw of being alone — it's its honesty." },
      { q: "Is overthinking a form of avoidance?", a: "Often, yes. It feels like engagement but functions as distraction — the mind picks a solvable-feeling thought to chew on so it doesn't have to feel something harder underneath." },
      { q: "How do I tell deep thinking from overthinking?", a: "Deep thinking moves somewhere. Overthinking circles. If after 20 minutes you're no closer to insight or relief, the activity has stopped being thought and become avoidance." },
    ],
  },
  "how-to-understand-anxiety-in-relationships": {
    answerBox:
      "To understand anxiety in relationships, look beneath the trigger to the early belief it activates. Relational anxiety is usually old — a story about being too much, not enough, or unsafe to depend on. Naming the story turns 'they're pulling away' into 'I'm afraid of being left,' which is workable.",
    faqs: [
      { q: "Why am I anxious even in healthy relationships?", a: "Because anxiety isn't about the present partner — it's about the pattern the nervous system learned long before them. Safe relationships actually surface anxiety more, not less, because there's finally space for old material to come up." },
      { q: "What's an anxious attachment style?", a: "A pattern where closeness feels essential but never quite safe — so you scan for signs of distance and overreact to small cues. It's a learned response, not a personality flaw, and it changes with consistent, secure experience." },
      { q: "Will my partner ever be enough to calm my anxiety?", a: "No — and that's not their job. Partners can offer safety, but the anxiety calms when you learn to self-soothe alongside their reassurance, not instead of doing your own work." },
    ],
  },
  "how-to-stop-confusion-when-alone": {
    answerBox:
      "To stop confusion when alone, separate the voices inside it. Write three lines: what your head says, what your gut says, what you'd tell a close friend in the same spot. Confusion usually lifts the moment those three are visible side by side — clarity lives in the gap, not in more thinking.",
    faqs: [
      { q: "Why does being alone make me more confused?", a: "Alone, the contradictions you usually outsource to other people's opinions get returned to you. That's not a bad thing — it's just unfamiliar. Confusion is often the moment before clarity, not the opposite of it." },
      { q: "Should I make big decisions when I'm confused?", a: "Not the same day. Write everything down, sleep on it, and reread it in the morning. Confusion almost always softens with rest — the same data reads differently to a settled nervous system." },
      { q: "How do I know what I actually want?", a: "Notice what you keep returning to in unguarded moments — what you daydream about, what you resent in others. Wants reveal themselves more in pattern than in declaration." },
    ],
  },
  "how-to-reduce-mental-overload-before-sleep": {
    answerBox:
      "To reduce mental overload before sleep, do a 'park, don't process' write — list every open thought in 5 minutes without trying to solve any of them. The mind keeps loops open because it's afraid you'll forget. A written list reassures it the threads are safe, so it can finally release them.",
    faqs: [
      { q: "Why is my mind louder right before sleep?", a: "Because it's the first uninterrupted window of the day. Whatever you didn't process between meetings, messages, and tasks comes back asking for attention. The volume isn't new — the silence is." },
      { q: "Should I keep a notepad by my bed?", a: "Yes — but write before getting in bed, not after. The bed-to-page motion teaches your brain that bed equals thinking. Better: write at your desk or a chair, then climb into bed empty-handed." },
      { q: "What if writing makes me more awake?", a: "Then you're writing to solve, not to park. Use shorter, declarative sentences. 'I'm worried about X. I'll look at it at 9am.' The goal is closure, not insight." },
    ],
  },
};

// ---- Title casing --------------------------------------------------------

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bAt\b|\bIn\b|\bWhen\b|\bBefore\b/g, (w) => w.toLowerCase());

// ---- Page builder --------------------------------------------------------

function buildPage(intent: Intent, emotion: Emotion, situation: Situation): SeoPageConfig {
  const pathSlug = buildSlug(intent, emotion, situation);
  const path = `/${pathSlug}`;
  const e = emotionCopy[emotion];
  const s = situationCopy[situation];
  const i = intentCopy[intent];
  const extra = extras[pathSlug];

  const niceTitle = titleCase(`${intent} ${emotion} ${situation}`);
  const splitIdx = niceTitle.lastIndexOf(" ");
  const titleHead = niceTitle.slice(0, splitIdx);
  const titleTail = niceTitle.slice(splitIdx + 1);

  const metaTitle = `${niceTitle} — A Calm, Practical Guide`;
  const metaDescription = `${niceTitle}. Understand why it happens, why it's hard, and a gentle, AI-supported way to find clarity with NexoMind.`;

  return {
    path,
    metaTitle: metaTitle.length > 60 ? `${niceTitle} | NexoMind` : metaTitle,
    metaDescription:
      metaDescription.length > 160
        ? `${niceTitle}. A calm, AI-supported way to find clarity with NexoMind.`
        : metaDescription,
    eyebrow: `${titleCase(emotion)} · ${titleCase(situation)}`,
    title: titleHead,
    italic: titleTail,
    intro: `${e.whyHappens.split(".")[0]}. And ${s.phrase}, that loop has its own gravity. Here's a calmer way through it.`,
    answerBox: extra?.answerBox,
    faqs: extra?.faqs,
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

// ---- Generate curated pages + internal links -----------------------------

function generateAll(): SeoPageConfig[] {
  const pages = CURATED.map(([intent, emotion, situation]) => buildPage(intent, emotion, situation));

  // Internal linking: link each curated page to the 3 most thematically
  // related curated pages (shared emotion, then shared situation, then any).
  for (const p of pages) {
    const others = pages.filter((x) => x.path !== p.path);
    const [emotionPart] = p.eyebrow.split(" · ").map((s) => s.toLowerCase());
    const [, situationPart] = p.eyebrow.split(" · ").map((s) => s.toLowerCase());

    const sameEmotion = others.filter((x) => x.eyebrow.toLowerCase().startsWith(emotionPart));
    const sameSituation = others.filter((x) =>
      x.eyebrow.toLowerCase().endsWith(situationPart) && !sameEmotion.includes(x),
    );
    const rest = others.filter((x) => !sameEmotion.includes(x) && !sameSituation.includes(x));

    const picks = [...sameEmotion, ...sameSituation, ...rest].slice(0, 3);
    p.related = picks.map((r) => ({
      to: r.path,
      label: r.eyebrow,
      desc: r.intro.split(".")[0] + ".",
    }));
  }

  return pages;
}

export const programmaticSeoPages: SeoPageConfig[] = generateAll();
