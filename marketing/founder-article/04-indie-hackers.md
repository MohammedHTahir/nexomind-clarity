<!--
INDIEHACKERS PUBLISHING CHECKLIST
─────────────────────────────────
Title: "I built an AI journal because my brain wouldn't switch off — here's what I learned"

Where to post: IndieHackers "Stories" → "Building". Not "Showing", not
"Asking" — Stories rewards reflective, lessons-learned founder writing.

IH does NOT support canonical_url. This version is rewritten enough at the
ends (different intro framing, different close) to read as a native IH
post, not a republish. The middle is intentionally similar to the other
versions because the core story doesn't change.

Comment etiquette: reply to every comment within 24 hours. IH's algorithm
heavily weights early discussion. The fastest path to landing on the
homepage is generating a real conversation, not gaming engagement.

Posting checklist:
- [ ] Personalize the opening scene
- [ ] Personalize "the hard part" if your real story differs
- [ ] Add a low-key question at the end of one of your replies to invite
      back-and-forth ("anyone else cut features that early users said they
      wanted?" works well)
-->

Most "I built an AI thing" stories start with the model. This one doesn't.

It starts at 2:47 AM, with me in bed, staring at the ceiling, replaying a conversation I'd already had eleven hours earlier.

> [PERSONALIZE] — Replace this opening with your real one. The IH audience can spot a fabricated moment from twenty feet away. Be specific, be brief.

The other person had moved on. I was the only one still in the room, doing the math.

I opened a journaling app. Stared at the blank page. Closed it. Opened a chatbot. Got a pep talk that made it worse. Opened Notes. Wrote half a sentence. Deleted it.

Nothing on my phone fit the shape of what I needed.

So I started building NexoMind. Here's what the build taught me.

## The product I actually wanted didn't exist

Three categories of app are competing for the "I'm overthinking" moment:

**Journaling apps.** Assume you know what to write about. They prompt with "what are you grateful for?" — not useful when your brain has fourteen unresolved threads from the day.

**Chatbots.** Want a conversation. They keep going. By message six you're solving a different problem than the one you came in with.

**Therapy apps.** Want a structure that takes twenty minutes and a clear head. I had neither at 2:47 AM.

What I wanted was something that would just read what was looping in my head and tell me what was actually inside it. Not advice. Not a coping strategy. Just — what's there.

## The insight that became the design brief

I spent a few weeks reading about why thought loops happen. Most of what I found was advice. *Try meditation. Try CBT. Try grounding.* All useful. None addressed the mechanic of the loop.

The thing I kept coming back to: **a thought loops when the feeling underneath it hasn't been named.**

Not "felt." Not "expressed." Named, in a single word.

Once the emotion is named, the loop has somewhere to land. That sentence — *the loop has somewhere to land* — became the design brief.

## What I built

NexoMind is small on purpose. You write what's on your mind. It reads it once and reflects it back as four short pieces:

- **Trigger** — what set this off
- **Thought loop** — what your mind keeps doing with it
- **Distortion** — the angle the loop is running at
- **Clarity** — a calmer reading of the same situation

Four labels, four sentences. That's the whole reflection. The longer journal inside the app surfaces patterns over time, but the [single-screen reflection](https://www.nexomind.ai/ai-journaling) is the heart of it.

## The hard part — and the lesson I keep relearning

> [PERSONALIZE] — Keep the shape if it fits, or swap in your actual hard part. IH readers want the *real* hard part, not the polished version.

The hard part wasn't the model. The hard part was the temptation to make it say more.

Every early demo, I'd watch a user read the four-line result, sit with it for two seconds, and then look at me. Wanting more. Wanting comfort. Wanting a five-step plan. And every time, I had to remember: the comfort comes from being seen accurately, not from being told what to do.

I cut features for months:

- Cut the suggested next steps
- Cut the "want to keep talking?" prompt
- Cut the mood score
- Cut the streak counter
- Cut every nudge to do something with the result

The product got smaller every week and felt better every week.

## What I'd tell a builder thinking about this space

A few things I didn't expect:

1. **A typed-output prompt changes the feel of an AI product more than the model does.** Forcing the model to commit to four labeled fields stopped it from drifting into chatbot mode. The constraint became the brand.

2. **Mental-clarity users are not productivity users.** They don't want streaks. They don't want gamification. The minute you put a number on the experience, they bounce. I learned this twice before I believed it.

3. **The most useful CTA in this category is "try it without signing up."** I built a [public version of the analyzer](https://www.nexomind.ai/overthinking-analyzer) that runs once and forgets. It's the highest-converting page on the site by a long way — because it answers the only question a skeptical user has: *will this actually do something for me?*

4. **Software is mostly the practice of not adding things.** I keep relearning that. I'll probably keep relearning it forever.

## Where it lives

NexoMind is what I wish I'd had on every 2:47 AM that sent me looking. Not therapy. Not a chatbot. Not a habit tracker. A quiet way to [stop overthinking](https://www.nexomind.ai/how-to-stop-overthinking) without being told to think differently.

The whole thing is at [nexomind.ai](https://www.nexomind.ai). The free analyzer link above is the fastest way to feel whether it works for you.

Happy to answer anything in the comments — especially the build questions, the design tradeoffs, or the "why didn't you just use chat" decisions. Those are the most interesting parts to talk about.
