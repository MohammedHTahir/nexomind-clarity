---
title: "I built an AI journal that doesn't try to fix you"
published: false
description: "A small founder note on building NexoMind — and why subtraction beat addition every single time."
tags: ai, mentalhealth, building, indiehackers
canonical_url: https://medium.com/p/8b91794f9b9d
cover_image:
---

> Before publishing on DEV: change `published` to `true`. The `canonical_url` is already set to your Medium permalink (`https://medium.com/p/8b91794f9b9d`). If you want the slug-based URL instead (e.g. `https://medium.com/@yourhandle/i-built-an-ai-journal-...`), open your published Medium post, copy the URL from the address bar, and swap it in. Both work — slug form is slightly preferred for SEO clarity.

It was 2:47 AM when I gave up trying to sleep.

> [PERSONALIZE] — Replace this opening scene with your real one. The reader needs a specific moment, not a description of overthinking in general. Two or three sentences is enough.

I'd been replaying a conversation from earlier that day — one that, by any reasonable measure, had already ended fine. The other person had moved on. I was the only one still in the room, doing the math.

I opened a journaling app. Stared at the blank page for a minute. Closed it. Opened a chatbot. Got an over-eager pep talk that made it worse. Opened my notes app. Wrote half a sentence. Deleted it.

Nothing on my phone fit the shape of what I actually needed.

That's when I started building NexoMind.

## What I actually wanted (and couldn't find)

Most journaling apps assume you know what to write about. They hand you prompts like "what are you grateful for today?" That's not the problem at 2:47 AM. The problem is that your brain has fourteen unresolved threads from the day and it's trying to file them all at once. Asking it to be grateful is like asking a fire alarm to consider its tone.

Most chatbots want a conversation. They keep going. Each reply pulls you a little further from what you came in with. By message six you're solving a different problem.

Therapy apps want a structure that takes twenty minutes and a clear head. I had neither.

What I wanted was something that would just **read what was looping in my head and tell me what was actually inside it**. Not advice. Not a quote. Not a coping strategy. Just — what's there?

## The shift that changed what I was building

I spent a few weeks reading about why thought loops happen. Most of what I found was advice. *Try meditation. Try CBT. Try grounding techniques.* All useful. None of them addressed the actual mechanic of the loop.

The thing I kept coming back to: a thought loops when the feeling underneath it hasn't been named.

Not "felt." Not "expressed." **Named.** In a single word.

You can write three pages about a difficult conversation and still not know whether what you're holding is hurt, or pressure, or fear of being misunderstood. The loop keeps running because it's protecting an emotion that hasn't been identified yet. Once you name the emotion, the loop has somewhere to land.

That sentence — *the loop has somewhere to land* — became the design brief.

## What I actually built

NexoMind is small. You write what's on your mind. It reads it once and reflects it back as four short pieces:

- The **trigger** — what set this off
- The **thought loop** — what your mind keeps doing with it
- The **distortion** — the angle the loop is running at
- The **clarity** — a calmer reading of the same situation

That's the whole product. There's a longer-form version inside the app that tracks patterns over time, but that one screen — four labels, four sentences — is the heart of it.

It's a [different shape of journaling](https://www.nexomind.ai/ai-journaling) than I'd seen before. It doesn't try to make you write more. It does the structuring step you'd otherwise skip. The bet is that *naming* the loop is what releases it — not arguing with it, not reframing it, not solving it.

## A note on the architecture

The public analyzer is intentionally minimal:

- React on the front, single edge function on the back, structured-output prompt that returns a four-field JSON object.
- The public-tool input is processed once and discarded. No database write, no user identifier. The full journal app stores reflections, but the public tool deliberately doesn't — it's a single-shot reflection, not a session.
- The four-field shape constrains the model. Open-ended chat completions kept giving me wandering, comforting answers. A typed schema forces the model to commit to *naming* the parts instead of *consoling* the user. That single design choice changed the feel of the whole product.

## The hard part

> [PERSONALIZE] — Keep the shape ("I almost added too much, here's what I cut and why") or swap in your actual hard part if it was different.

The hard part wasn't the model. The hard part was the temptation to make it say more.

Every time I showed an early version to someone, I'd watch them read the result, sit with it for two seconds, and then look at me — wanting more. Wanting comfort. Wanting a five-step plan. And every time, I had to remind myself: the comfort comes from being seen accurately, not from being told what to do.

I cut features for months. I cut the suggested next steps. I cut the "would you like to talk about this more?" prompt. I cut the mood score. I cut the streak counter. I cut everything that asked the user to *do* something with the result.

The product got smaller every week and felt better every week.

Software is mostly the practice of not adding things. I keep relearning that.

## You can try it without signing up

There's a [public version of the analyzer](https://www.nexomind.ai/overthinking-analyzer) — no account, no email, nothing stored. Paste a thought that's been looping and it'll show you the four parts. It runs once and forgets.

If the result doesn't land, that's useful too. It tells you the model didn't catch what's underneath, which usually means the thought has more layers than one read can reach. The full app handles that with longer reflections over time.

## Where it's going

NexoMind is what I wished I'd had on every 2:47 AM that sent me looking. It's not therapy. It's not a chatbot. It's not a habit tracker. It's a quiet way to [stop overthinking](https://www.nexomind.ai/how-to-stop-overthinking) without being told to think differently.

If you've ever wanted a tool that just reads what's there, [it lives here](https://www.nexomind.ai).

Thanks for reading. Happy to answer questions about the architecture or the design constraints in the comments.
