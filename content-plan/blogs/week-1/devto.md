---
title: "I Built a System That Detects Thought Loops in Human Writing"
published: true
description: "Treating overthinking like recursive loops. Pattern detection in unstructured text. Building NexoMind."
tags: ai, mentalhealth, building, productivity
canonical_url: https://medium.com/@nexomind68/5b0384d86b98
---

# I Built a System That Detects Thought Loops in Human Writing

Most people frame overthinking as a feelings problem. i started treating it like a systems problem.

What if overthinking isn't about thinking too much - but about the same computation running repeatedly without reaching a termination condition? What if the brain is just stuck in a recursive loop with no base case?

That reframe changed how i built NexoMind. And it changed what the product actually does.

---

## The problem: recursive thoughts without exit conditions

Here's what overthinking looks like if you model it structurally:

```
function think(problem, emotionalState) {
  const newEmotion = reprocess(problem, emotionalState)
  // no exit condition
  // no new information generated
  // just re-invocation with mutated state
  return think(problem, newEmotion)
}
```

The thought content stays static. The emotional wrapper mutates each cycle. That mutation creates the illusion of progress. "i'm getting closer to figuring this out." You're not. You're just recursing with a different emotional parameter.

No stack overflow though. The brain happily runs this forever.

---

## 5 loop types i identified

After reading pattern data across users (we see pattern types and frequencies, never content - E2EE), these structures kept appearing:

**1. Replay Loop** - Re-executing a past event trying to find the branch where the outcome changes. It never does. The past is immutable state.

**2. Preparation Spiral** - Generating increasingly catastrophic scenarios under the label "planning." No action items produced. Just escalating threat models with no mitigations.

**3. What-If Fork** - Toggling between N bad outcomes. Classic busy-wait. CPU usage at 100%, throughput at zero.

**4. Clarity Illusion** - The belief that more cycles = eventual convergence. But there's no convergence condition. The function never returns.

**5. Identity Loop** - Meta-recursion. "What does it say about me that i'm thinking this?" Thought about thought. Infinite regress disguised as introspection.

---

## How detection works (conceptually)

The interesting technical challenge: how do you detect when someone is looping vs. genuinely processing?

The signal isn't in any single entry. It's across entries over time.

What we look for:
- **Semantic similarity clustering** - same theme appearing in entries that the user frames as "different problems"
- **Emotional variance without content variance** - the feeling changes but the underlying concern doesn't
- **Trigger recurrence** - same environmental trigger producing same response pattern
- **Resolution absence** - no new information, decisions, or action items across multiple entries on the same topic

Single-entry analysis catches the obvious loops (replay, what-if fork). Cross-entry pattern detection catches the subtle ones (identity loop, preparation spiral that spans weeks).

---

## What i learned about building this

**Less AI output = better UX.** Early version gave 300-word responses. Users read them, said "helpful," never came back. Cut to 4 lines. Return rate doubled. The AI's job is naming, not explaining.

**The base case is external.** You can't detect your own loops from inside them. That's the whole reason the tool exists. Something outside the system has to say "this is the same pattern you had last tuesday."

**Precision > comfort.** Users don't want to feel validated. They want to feel seen. "You're experiencing the replay loop and the underlying concern is about respect" lands harder than two paragraphs of empathetic filler.

**Privacy is load-bearing.** People won't write honestly if they think someone's reading it. The whole detection system becomes useless if the input is self-censored. E2EE isn't a feature checkbox. It's what makes the data honest enough to be useful.

---

## The moment that validated the approach

3am on a tuesday. Second night stuck on the same thought loop about a collaborator interaction. Two nights of my brain telling me it was "almost" figured out.

Opened my notes app. Wrote one sentence: "i think i'm afraid they don't respect me and i'm using the comment as evidence."

Loop broke. Not because i solved the problem. Because i named what the thought was doing instead of engaging with what it was about.

That's the entire product thesis in one interaction. Help people name the function, not just the argument being passed to it.

---

## Current state

NexoMind does:
- Single-entry loop detection (names the pattern type)
- Cross-entry pattern clustering (surfaces recurring themes over time)
- Cognitive distortion labeling (standard CBT taxonomy)
- One-line reframes (precision, not essays)

What i'm still figuring out:
- When to surface a pattern vs. letting the user discover it naturally
- How much historical context improves detection accuracy vs. adds noise
- The right threshold for "this is a pattern" vs. "this happened twice" (currently calibrating)

---

If you're building in the AI-for-thinking space, i'd love to compare notes. The interesting problems aren't the LLM calls. They're the data modeling and UX constraints around when to reflect something back vs. when silence is better.

[NexoMind](https://nexomind.ai) if you want to try it.
