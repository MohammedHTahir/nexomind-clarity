import type { SeoPageConfig } from "@/components/SeoPage";

/**
 * High-priority "money keyword" SEO pages.
 * Each page: answer box (40–60 words for AI search) + 1200–1800 words of body + FAQs.
 */
export const targetSeoPages: SeoPageConfig[] = [
  // ───────────────────────────────────────────────────────────────────
  {
    path: "/how-to-stop-overthinking-at-night",
    metaTitle: "How to Stop Overthinking at Night — A Calm Method",
    metaDescription:
      "A calm, practical method to stop overthinking at night. Why it happens, what helps in 5 minutes, and how AI journaling quiets the loop.",
    eyebrow: "Stop Overthinking at Night",
    title: "How to stop overthinking",
    italic: "at night.",
    intro:
      "Most nighttime overthinking isn't a sleep problem — it's an unfinished-thought problem. This is the calm, repeatable way to put the day down so the night can be quiet again.",
    answerBox:
      "Overthinking at night happens because the day's distractions disappear and the mind tries to file what it didn't process. The fastest way to stop the loop is to externalize it — write the exact thought, name the emotion underneath, and let a brief reflection close it before bed.",
    sections: [
      {
        h2: "Why your mind gets louder when the lights go out",
        body: "During the day, your attention is occupied. Meetings, messages, errands, scrolling — they all use working memory and crowd out unfinished emotional business. At night, that traffic stops, and your mind does what it was always going to do: it scans for what hasn't been resolved.\n\nThis is why nighttime overthinking rarely follows logic. It picks the conversation you almost forgot about, the email you half-read, the moment you brushed aside earlier. None of these were urgent at noon. At 11pm, with no other input competing for attention, they get the floor.\n\nThis is not a malfunction. It's a feature of a tired but still-working mind. The bug is only that the timing is awful.",
      },
      {
        h2: "The three patterns that show up most",
        body: "First, the replay loop: rewinding a conversation, rewriting your part, rehearsing the version you wish had happened. This is almost always anxiety wearing the costume of 'self-improvement.'\n\nSecond, the rehearsal loop: anticipating tomorrow — a meeting, a difficult message, an unknown outcome. Your mind tries to control the future by simulating it, which only succeeds in keeping you awake for it.\n\nThird, the meaning loop: zooming out into questions that aren't tonight's problem (am I on the right path, is this enough, what am I doing). These questions are real, but 1am is not the time they're going to be answered well.\n\nNoticing which loop you're in is half the work. Each one needs a slightly different exit.",
      },
      {
        h2: "A 5-minute method that actually works",
        body: "Forget breathing exercises for a moment. They help — but if your mind is racing, they're not where to start. Start by externalizing.\n\n1. Open a blank space (paper, notes app, NexoMind).\n2. Write the loop in plain language. Not a polished version — the actual sentence that's repeating. 'I think I sounded too defensive.' 'I don't know if I made the right call.' 'I keep imagining tomorrow going badly.'\n3. Underneath, write the feeling in one word: tense, guilty, unsure, hurt, exposed, tired. Don't argue with the feeling. Just name it.\n4. Write one honest sentence about what you actually need: rest, reassurance, a boundary, a decision in the morning, permission to not solve this tonight.\n5. Close the page. Say it out loud if you can: 'Not tonight. Tomorrow.'\n\nThe loop loosens because you've answered what it was actually asking — to be seen.",
      },
      {
        h2: "Why this beats 'just stop thinking about it'",
        body: "Telling an overactive mind to stop is like telling a leaking tap to be drier. The mind isn't being stubborn; it's holding something. Suppression makes it hold tighter.\n\nNaming and externalizing work because they signal completion. The thought has been received. It has somewhere to be other than your skull. Studies on expressive writing have shown it reduces both rumination and time-to-sleep — not because writing is magical, but because reflection is a closing motion the mind recognizes.\n\nYou don't need to fix the thing. You need to acknowledge it, give it shape, and put it down.",
      },
      {
        h2: "How AI journaling helps the loop close faster",
        body: "Writing alone is good. Writing into something that reflects back is better — especially at midnight, when the analytical part of your brain is offline.\n\nNexoMind reads what you wrote and returns four things: a short summary in plain language, the most likely emotion underneath it, the pattern (replay vs. rehearsal vs. meaning), and a single grounded reflection. It doesn't give advice. It hands the thought back to you, more clearly, so you can stop arguing with it.\n\nFor most people, the loop loses 60–70% of its grip the moment it's named accurately. That's the entire job.",
      },
      {
        h2: "The 5 small habits that lower nighttime overthinking over time",
        body: "If late-night spirals are a regular visitor, the goal isn't a perfect night. It's a lower baseline.\n\n• A 3-minute reflection before bed — same time, same place. Most people feel a shift inside a week.\n• A 'parking lot' note for tomorrow: anything you catch yourself rehearsing gets written down with 'address tomorrow.' The mind only loops on things it thinks will be forgotten.\n• A no-screens 20 minutes before sleep when possible. Not for melatonin reasons — for input reasons. Your mind needs a quiet runway.\n• A boundary on news and email after 9pm. Most overthinking is fed by inputs you didn't need.\n• Permission to not resolve everything tonight. Most decisions are quietly made by the morning version of you, who is wiser and better rested.\n\nNone of these are dramatic. They're small. The point is small.",
      },
      {
        h2: "When to take overthinking more seriously",
        body: "Occasional nighttime spirals are part of being human. But if loops are nightly, last hours, come with panic, or are tied to ongoing low mood — that's a signal worth listening to. Reflection is a tool, not a substitute for care. A therapist, a doctor, or a trusted person can do things an app can't, and reaching out is its own kind of clarity.",
      },
      {
        h2: "A gentle close",
        body: "You're not overthinking because something is wrong with you. You're overthinking because something inside the thought wants to be understood. Tonight, give it three honest minutes. Then close the page. The day was enough. So are you.",
      },
    ],
    faqs: [
      {
        q: "Why does my brain race only at night?",
        a: "Because the daytime distractions that kept unprocessed thoughts at bay disappear. With no input, your mind reaches for whatever wasn't resolved earlier — which is why it picks the worst possible time. It's not a flaw; it's an unfinished filing job.",
      },
      {
        q: "Should I journal in bed or get up?",
        a: "Either works. If you've been lying awake more than 20 minutes with a racing mind, getting up briefly to write the loop down often resets the cycle faster than forcing sleep. Keep the lights low and the writing short — 3–5 minutes is plenty.",
      },
      {
        q: "Does AI journaling work as well as traditional journaling?",
        a: "For nighttime use, often better. AI journaling removes the 'what do I write' problem and reflects your thoughts back as a calm summary, which is exactly the closing motion your mind needs before sleep.",
      },
      {
        q: "Is overthinking the same as anxiety?",
        a: "They overlap but aren't identical. Overthinking is the loop; anxiety is often the fuel underneath it. Naming the emotion underneath the loop is what separates them — and what tends to release both.",
      },
      {
        q: "How long until nighttime overthinking improves?",
        a: "Most people notice a meaningful shift within 5–10 days of a short, daily reflection. Not silence — a lower baseline. The goal isn't a quiet mind; it's a mind that doesn't have to carry everything in private.",
      },
    ],
    related: [
      { to: "/how-to-stop-overthinking", label: "How to stop overthinking", desc: "The calm, practical version of breaking the loop." },
      { to: "/why-do-i-overthink", label: "Why do I overthink?", desc: "What recurring loops are really asking for." },
      { to: "/clear-your-mind", label: "Clear your mind", desc: "Simple ways to quiet the noise before bed." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  {
    path: "/mental-clarity-for-founders",
    metaTitle: "Mental Clarity for Founders — A Calm Operating System",
    metaDescription:
      "A calm, practical guide to mental clarity for founders. How to think more clearly under pressure, decide faster, and stop carrying the company in your head.",
    eyebrow: "Mental Clarity for Founders",
    title: "Mental clarity for",
    italic: "founders.",
    intro:
      "Founders don't lack drive — they lack a place to put what they're carrying. This is the calm, repeatable way to think clearly when the noise is the loudest.",
    answerBox:
      "Mental clarity for founders isn't about working harder; it's about externalizing what you're holding. The mind decides poorly when it's also doing the storage. Daily reflection — even 5 minutes — separates the signal from the static, so decisions take minutes instead of weeks.",
    sections: [
      {
        h2: "The hidden tax on founder thinking",
        body: "Most founders aren't tired from work. They're tired from holding work. Every unmade decision, half-finished conversation, and unspoken doubt rents space in your head until you put it somewhere else.\n\nThe brain is a terrible storage device. It was built to think — fast, contextual, intuitive — but it loses precision the moment it's forced to remember. When founders talk about feeling 'foggy,' they almost always describe a mind that has too many open tabs. The fog is full memory, not low capability.\n\nThe fix is not more discipline. It's externalization.",
      },
      {
        h2: "Why founder overthinking looks like productivity",
        body: "Founder overthinking is socially acceptable. Replaying a board call sounds like 'preparation.' Rewriting a hire decision sounds like 'rigor.' Rehearsing a pitch for the fourth time sounds like 'commitment.' Most of it is anxiety in costume.\n\nThe tell is timing. Useful preparation happens once, with a clear question. Anxiety preparation happens in loops, late at night, with no defined output. If you're 'thinking about it' more than once with no new information, you're not analyzing — you're holding.",
      },
      {
        h2: "The 5-minute clarity protocol",
        body: "Use this once a day. Same time, same surface (notebook, doc, NexoMind).\n\n1. State the situation in one sentence. 'I can't decide whether to extend our runway by raising or by cutting.' Concrete is the rule.\n2. Name the feeling underneath in one word. Tired. Defensive. Excited. Embarrassed. Founders skip this step and pay for it later — every decision is 30% emotion you didn't account for.\n3. Write the version of you who is calm and rested. What would they say? Not a dream answer. A real one.\n4. Write the next 24-hour move. Not the strategy — the next concrete action.\n5. Close the loop with one honest sentence: 'The clearest thing I know right now is…'\n\nFive minutes. Most founders find their backlog of 'unmade decisions' shrinks dramatically within a week.",
      },
      {
        h2: "Decision velocity is a clarity problem",
        body: "Speed in early-stage companies is often discussed as a personality trait. It isn't. It's a function of how cleanly you can separate three layers: what's true, what you feel, and what you should do.\n\nWhen those three are tangled, every decision drags. When they're separated — even crudely — decisions take minutes. Reflection is the cheapest way to separate them. It's also the most underused.\n\nA founder who reflects 5 minutes a day will, over a year, reclaim hundreds of decision-hours. Not because they think faster, but because they stop re-thinking what they've already decided.",
      },
      {
        h2: "Why your team feels your unprocessed thoughts",
        body: "Unspoken founder anxiety leaks. It shows up as inconsistent feedback, sudden strategy shifts, abrupt all-hands tone changes, and the kind of weekend Slack messages that scare your COO.\n\nThe team doesn't need you to be calm. They need you to be coherent. Coherence comes from having reflected before broadcasting. The 90 seconds it takes to write down what you're actually feeling, before sending the message, is the highest-leverage 90 seconds in the company.",
      },
      {
        h2: "How AI journaling fits a founder's day",
        body: "Most founders won't journal — they'll mean to, then skip it. AI journaling lowers the barrier to almost zero: write three messy sentences, get back a calm structured reflection.\n\nNexoMind reads what you wrote and returns: the situation in plain language, the emotion underneath it, the recurring pattern, and one grounded next thought. It's not advice. It's your own thinking, clarified.\n\nUsed daily, the compounding effect is hard to overstate. Founders describe it as 'I can hear myself again' — which is, mostly, the entire point.",
      },
      {
        h2: "Three signals you've lost clarity (and how to recover it)",
        body: "1. Your decisions take longer than they used to. Recovery: pick the smallest unmade decision and decide it today, even imperfectly.\n2. You're explaining the same thing to your team multiple ways. Recovery: write it once, clearly, before talking. The clarity transfers.\n3. You're working long hours but shipping less. Recovery: a no-meeting morning + a 10-minute reflection. Output usually doubles for a week.\n\nNone of this is exotic. The discipline is small and boring. That's the point.",
      },
      {
        h2: "The quiet superpower",
        body: "The most successful founders aren't the loudest or fastest. They're the ones who carry less in their head — because they've put it somewhere they can see it. Clarity is the unfair advantage that compounds.\n\nFive minutes a day. Three honest sentences. One grounded next move. That's the operating system.",
      },
    ],
    faqs: [
      {
        q: "I don't have time to journal — how is this realistic?",
        a: "It's realistic because it's three sentences, not three pages. The point isn't volume; it's contact. Most founders save more time by reflecting 5 minutes than they spend doing it — fewer reopened decisions, fewer late-night loops, less re-explaining.",
      },
      {
        q: "Is this just for early-stage founders?",
        a: "No. Later-stage founders often need it more — the cost of unprocessed thinking scales with the size of the team that has to interpret your signals.",
      },
      {
        q: "How is this different from coaching or therapy?",
        a: "Coaching and therapy are deeper, slower work. AI journaling is a daily clarity tool that complements them — it gives your sessions better material and your day fewer unprocessed loops.",
      },
      {
        q: "Will my reflections be private?",
        a: "Yes. NexoMind encrypts entries, doesn't sell data, and doesn't train public models on what you write. Privacy is non-negotiable for honest reflection.",
      },
    ],
    related: [
      { to: "/mental-clarity", label: "Mental clarity", desc: "What clarity actually means — and how to reach it." },
      { to: "/think-more-clearly", label: "Think more clearly", desc: "Calm, structured ways to clear the static." },
      { to: "/private-ai-journaling", label: "Private AI journaling", desc: "Why privacy is the entire point." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  {
    path: "/ai-journaling-for-anxiety",
    metaTitle: "AI Journaling for Anxiety — A Calmer Approach",
    metaDescription:
      "How AI journaling helps with anxiety: name the feeling, externalize the loop, and find structured clarity in 3 minutes a day with NexoMind.",
    eyebrow: "AI Journaling for Anxiety",
    title: "AI journaling for",
    italic: "anxiety.",
    intro:
      "Anxiety is rarely about the topic on the surface. It's a future-shaped feeling looking for somewhere to land. AI journaling gives it a place — and gives you back the moment you're actually in.",
    answerBox:
      "AI journaling for anxiety helps by externalizing the loop and naming the emotion underneath it, which is the step anxiety usually skips. NexoMind reads what you write and reflects back the feeling, the pattern, and one grounded thought — turning a spiral into a sentence in under three minutes.",
    sections: [
      {
        h2: "What anxiety actually is",
        body: "Anxiety is a future-oriented emotion. It shows up when something feels uncertain and important at the same time. Your nervous system reacts as if the imagined outcome is already happening — which is why it can feel so physical: tight chest, shallow breath, restlessness, a stomach that knows something your mind hasn't named yet.\n\nThis isn't weakness. It's a body doing exactly what it was designed to do, just for the wrong threat. Modern anxieties — emails, decisions, conversations, futures — don't need the same response that helped our ancestors avoid predators. But the system doesn't know that.\n\nNaming what's happening is the first calming move. Writing it down, with structure, is the second.",
      },
      {
        h2: "Why traditional journaling can backfire for anxiety",
        body: "If you've ever tried to journal during an anxious moment and felt worse, you're not alone. Anxiety borrows logic. Given a blank page, it builds airtight arguments for worst-case scenarios. Open writing without structure can deepen the spiral instead of softening it.\n\nWhat anxiety actually responds to is a structured surface — something that asks the right questions, then closes the page. Not 'tell me everything.' But 'what's the actual sentence underneath this?'",
      },
      {
        h2: "How AI journaling redirects the spiral",
        body: "AI journaling doesn't ask you to be articulate. You write whatever's in your head — fragments, half-thoughts, lists, contradictions. The AI reads it and returns four things: a short summary in plain language, the most likely emotion, the pattern, and a single grounded next thought.\n\nThis matters because anxiety is often a feeling without a name. Once it's named — 'I'm scared of being seen as incompetent,' 'I'm afraid of disappointing them,' 'I'm worried I made the wrong call' — the volume drops noticeably. Not because the situation changed, but because the feeling stopped being unidentified.\n\nNexoMind's job isn't to fix anxiety. It's to make it visible.",
      },
      {
        h2: "A 3-minute anxious-moment protocol",
        body: "Try this the next time the spiral starts:\n\n1. Open NexoMind (or a blank page).\n2. Write: 'Right now I'm anxious about ____.' Don't make it sound calm. Write it the way it actually feels.\n3. Underneath, answer one question: 'If this fear came true, what would it really mean about me?' This is where anxiety tells the truth.\n4. Read what you wrote. Notice it's a sentence — not a fog.\n5. Close with one grounded line: 'What's actually true right now is ____.'\n\nThree minutes. Most anxious moments don't survive being looked at directly.",
      },
      {
        h2: "Why naming the feeling lowers the volume",
        body: "There's a well-studied phenomenon called affect labeling: the act of naming an emotion reduces its physiological intensity. Brain scans show measurable reductions in amygdala activity when people simply put words to what they're feeling.\n\nThis is why journaling helps anxiety while pure rumination makes it worse. Rumination loops the feeling. Naming it gives it a destination. AI journaling makes naming easier because the AI does the labeling step for you when you can't quite get there alone.",
      },
      {
        h2: "The slow, daily version",
        body: "Anxious-moment use is the rescue tool. Daily use is the prevention tool.\n\nA 3-minute reflection at the same time each day — morning coffee, lunch break, before bed — lowers your anxiety baseline more than any one breakthrough moment. It works because it gives small feelings somewhere to go before they become large ones. Most loops you'd be having at 11pm get processed at 8am instead.\n\nThis isn't about producing insights. It's about not carrying everything in private.",
      },
      {
        h2: "When AI journaling isn't enough",
        body: "AI journaling is a reflection tool, not a medical or psychological one. It complements professional support — it doesn't replace it. If anxiety is interfering with sleep, work, relationships, or daily function — or if it ever feels unsafe — please reach out to a qualified professional. Reflection works best when it's part of a wider, gentler ecosystem of care.",
      },
      {
        h2: "What changes after a few weeks",
        body: "Most people who use NexoMind for anxiety describe the same shift: the spirals don't disappear, but they get smaller and shorter. The feeling arrives, gets named, gets put down — and the rest of the day stays mostly intact.\n\nThat's the entire promise. Not silence. Not productivity. Just a mind that doesn't have to carry every feeling alone, and a moment of clarity that's reachable in three minutes.",
      },
    ],
    faqs: [
      {
        q: "Can AI journaling replace therapy for anxiety?",
        a: "No. It's a reflection tool that supports — never replaces — professional care. If anxiety is significantly affecting your life, please speak to a qualified clinician. AI journaling pairs well with therapy by giving you clearer material between sessions.",
      },
      {
        q: "Will writing about anxiety make it worse?",
        a: "Open, unstructured writing can sometimes deepen rumination. Structured reflection — naming the feeling, writing one honest sentence, closing the page — does the opposite. AI journaling adds the structure most people are missing.",
      },
      {
        q: "How fast does it work in an anxious moment?",
        a: "Most users report a noticeable drop in intensity within 2–3 minutes of writing and reading the reflection back. The mechanism is affect labeling — naming a feeling reduces its grip on the body.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. Entries are encrypted, never sold, and not used to train public AI models. Privacy is the foundation — anxiety can't be honest in a place that doesn't feel safe.",
      },
      {
        q: "How often should I use it?",
        a: "Most people benefit from a 3-minute daily reflection plus 'rescue' use during anxious moments. Daily use lowers baseline anxiety; rescue use shortens spirals.",
      },
    ],
    related: [
      { to: "/private-ai-journaling", label: "Private AI journaling", desc: "Why honest reflection needs real privacy." },
      { to: "/why-do-i-feel-overwhelmed", label: "Why do I feel overwhelmed?", desc: "What overwhelm is really pointing to." },
      { to: "/how-to-stop-overthinking", label: "How to stop overthinking", desc: "The calm, practical way through the loop." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  {
    path: "/private-ai-journaling",
    metaTitle: "Private AI Journaling — Encrypted, Honest, Yours",
    metaDescription:
      "Private AI journaling that's encrypted, never sold, and never used to train public AI models. NexoMind keeps reflection honest by keeping it yours.",
    eyebrow: "Private AI Journaling",
    title: "Private AI",
    italic: "journaling.",
    intro:
      "Reflection only works when it's honest. Honesty only works when it's private. NexoMind is built on the assumption that your thoughts should never be a product.",
    answerBox:
      "Private AI journaling means your entries are encrypted, never sold to third parties, and never used to train public AI models. NexoMind treats reflection as private by default — your thoughts stay yours, only visible to you, and deletable at any time.",
    sections: [
      {
        h2: "Why privacy is the entire point",
        body: "Most journaling apps treat privacy as a feature. We treat it as the foundation. The reason is simple: if you don't fully trust where your thoughts are going, you won't write honestly. And without honesty, reflection doesn't work.\n\nYou'll write the polished version. The version that sounds healthy. The version you'd be okay with someone reading. That's not journaling — that's content. The most valuable entries — the messy, contradictory, embarrassing, tender ones — only happen in spaces that feel completely safe.\n\nNexoMind exists to be that space.",
      },
      {
        h2: "What 'private' actually means here",
        body: "We mean four specific things, and we'll keep meaning them:\n\n1. Your entries are encrypted in transit and at rest.\n2. Authentication is handled by industry-standard providers — only you can access your account.\n3. We do not sell, rent, or share your reflections with advertisers or data brokers. Ever.\n4. Your entries are not used to train public AI models. The AI processes your entry to produce your reflection, and that's where it ends.\n\nIf any of those ever change, we'll tell you before they do, and you'll have the option to delete everything.",
      },
      {
        h2: "How AI journaling can be both AI and private",
        body: "There's a fair question hiding underneath all of this: how can an app that uses AI also be private?\n\nThe answer is in the architecture. AI processes your entry to generate the reflection — but processing is not the same as training. Training is when your data becomes part of a model's permanent learning. Processing is when your data is read once, in the moment, to do a job. NexoMind uses the latter, not the former.\n\nIn practical terms: the AI doesn't 'remember' your entry into its weights. It reads, reflects, returns. The retention that exists is so you can revisit your own entries — not for anyone else.",
      },
      {
        h2: "What we don't do",
        body: "We don't sell your data. We don't rent it. We don't share it with advertisers or analytics partners that require content access. We don't use your reflections as marketing material. We don't read individual entries unless legally required (which we'd push back on) or if you specifically ask us to (for support).\n\nThe absence of these things is the product. We'd rather charge you a fair subscription than build a business model that requires your honesty to be inventory.",
      },
      {
        h2: "The deletion guarantee",
        body: "You can delete any single entry from your dashboard. You can delete your entire account, with all entries, by writing to us. When you do, we delete — not deactivate, not 'soft delete,' not 'archive for 30 days, just in case.' We mean delete.\n\nThe ability to leave cleanly is part of what makes staying meaningful.",
      },
      {
        h2: "Why this matters more, not less, with AI",
        body: "We're at a moment where many products are quietly using user content to improve their models. Some disclose it. Many bury it in terms of service. The default is drifting in the wrong direction.\n\nJournaling deserves a different default. It's the most personal kind of writing — not a tweet, not a doc, not a draft. It's the part of your thinking that wasn't meant for anyone. Treating that with anything less than full privacy isn't a tradeoff. It's a category error.\n\nThis is why NexoMind starts from privacy and builds outward — instead of starting from features and bolting privacy on later.",
      },
      {
        h2: "What this enables",
        body: "When journaling is genuinely private, three things change:\n\n• You write what you actually think, not what you'd publish.\n• You return to entries from months ago and find honest material to learn from — not edited reruns.\n• You stop performing reflection and start doing it.\n\nThe difference shows up in what you notice about yourself over time. The honest version of you is far more useful than the polished one. NexoMind is just the place that makes the honest version safe to write down.",
      },
      {
        h2: "A simple promise",
        body: "Your thoughts belong to you. We'll act like that, not as a slogan, but as the operating principle behind every decision. If we ever stop, we'll be honest about it — and you'll have full ownership and a clean way out.\n\nThat's the whole policy. The rest is just the product.",
      },
    ],
    faqs: [
      {
        q: "Are my journal entries encrypted?",
        a: "Yes. Entries are encrypted in transit and at rest. Only you, signed in to your account, can read them.",
      },
      {
        q: "Are my reflections used to train AI models?",
        a: "No. Your entries are processed once to generate your reflection and are never used to train public AI models.",
      },
      {
        q: "Do you sell or share my data?",
        a: "Never. We do not sell, rent, or share your reflections or personal data with advertisers, data brokers, or third-party marketers.",
      },
      {
        q: "Can I delete my entries?",
        a: "Yes — any single entry from your dashboard, or your full account on request. Deletion means deletion, not archival.",
      },
      {
        q: "Why does privacy matter so much for journaling?",
        a: "Because honesty needs safety. If you don't fully trust where your thoughts are going, you won't write the entries that actually help — and reflection stops working.",
      },
    ],
    related: [
      { to: "/ai-journaling", label: "AI journaling", desc: "What AI journaling is — and what it isn't." },
      { to: "/ai-journaling-for-anxiety", label: "AI journaling for anxiety", desc: "How structured reflection lowers spirals." },
      { to: "/reflect-alternative", label: "Reflect alternative", desc: "How NexoMind compares for honest, private reflection." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  {
    path: "/reflect-alternative",
    metaTitle: "Reflect Alternative — A Calmer AI Journal",
    metaDescription:
      "Looking for a Reflect alternative? NexoMind is a calm, private AI journaling app focused on emotional clarity, not note-taking.",
    eyebrow: "Reflect Alternative",
    title: "A calmer Reflect",
    italic: "alternative.",
    intro:
      "Reflect is a powerful note-taking tool with AI features. NexoMind is a different thing entirely — a private journaling app focused on emotional clarity. Here's what to consider if you're choosing between them.",
    answerBox:
      "NexoMind is a Reflect alternative for people who want emotional clarity, not note-taking. Reflect organizes thinking with backlinks and AI search; NexoMind reflects feelings into a structured summary, emotion, pattern, and grounded takeaway — so messy thoughts become clearer in three minutes.",
    sections: [
      {
        h2: "Two different shapes of 'thinking tool'",
        body: "Reflect and NexoMind both use AI, both involve writing, and both promise more clarity. But they solve different problems.\n\nReflect is built around note-taking. Its strengths are backlinks, search across your knowledge base, and AI features that help you organize what you've already written. It's excellent for people building a long-term knowledge graph — researchers, writers, knowledge workers.\n\nNexoMind is built around reflection. The unit isn't a note — it's an emotion. You write what's in your head, and NexoMind returns a calm structured response: summary, emotional state, pattern, and one grounded takeaway. It's not where your knowledge lives. It's where your day gets quieter.",
      },
      {
        h2: "When Reflect is the better choice",
        body: "If your main need is to capture, link, and search a growing body of work — meeting notes, research, ideas, references — Reflect is purpose-built for that. It's a strong system of record. It rewards the kind of person who likes their thinking organized into a graph and revisited often.\n\nIf you'd describe your problem as 'I have a lot of information and I need to find things in it,' you probably want Reflect.",
      },
      {
        h2: "When NexoMind is the better choice",
        body: "If your problem is closer to 'I have a lot in my head and I can't tell what's actually mine to carry,' that's a different tool.\n\nNexoMind is built for the moments before a hard decision, after a difficult conversation, at 11pm when something won't let go, before a meeting that matters. You write three messy sentences and get back a calm reflection. There's no graph to maintain, no streak to protect, no system to learn.\n\nIf you've ever opened a note-taking app, looked at a blank page, and felt heavier instead of clearer — NexoMind is the alternative shape.",
      },
      {
        h2: "Privacy comparison",
        body: "Both apps take privacy seriously, but the bar for journaling is higher. NexoMind's defaults are: encrypted entries, no data sold or shared, no entries used to train public AI models, and clean deletion on request. We treat reflection as a category that requires the strictest version of privacy by default — not as a feature.\n\nIf privacy is the deciding factor and your use case is emotional rather than informational, NexoMind is purpose-built for it.",
      },
      {
        h2: "Pricing and pace",
        body: "Reflect is priced for serious knowledge workers and includes broad note-taking infrastructure. NexoMind is priced as a focused reflection app — a smaller surface, a lower commitment, a daily 3-minute practice rather than a system to maintain.\n\nThe difference isn't quality. It's pace. NexoMind is designed for the 60–90 seconds you have, not the 60 minutes you don't.",
      },
      {
        h2: "Migration thoughts",
        body: "You don't have to choose. Many people keep Reflect (or any note tool) for work and use NexoMind for personal reflection. The two answer different questions:\n\n• Reflect: 'What did I think about this?'\n• NexoMind: 'What am I actually feeling right now?'\n\nUsed together, they cover most of what a thinking person needs.",
      },
      {
        h2: "How to decide in two minutes",
        body: "Ask yourself one question: when you say 'I want to think more clearly,' do you mean clearer about your work, or clearer about yourself?\n\nIf it's the first, Reflect — or any structured note tool — is probably what you need.\n\nIf it's the second, especially in the moments where the thought isn't a knowledge question but an emotional one, that's where NexoMind is built to be useful.",
      },
      {
        h2: "Try the smallest version first",
        body: "Don't migrate anything. Open NexoMind once, write three sentences about what's actually on your mind right now, and read the reflection that comes back. If it feels like the missing piece, it probably is. If it doesn't, you've lost three minutes — which is the point. Reflection should be that cheap.",
      },
    ],
    faqs: [
      {
        q: "Is NexoMind a direct Reflect competitor?",
        a: "Not really — they solve different problems. Reflect is a knowledge note tool with AI; NexoMind is a private emotional reflection app. Many people use both.",
      },
      {
        q: "Can I import my Reflect notes into NexoMind?",
        a: "NexoMind isn't designed as a note archive, so we don't currently offer Reflect import. Most users start fresh because the use case is different.",
      },
      {
        q: "Which is more private?",
        a: "Both take privacy seriously. NexoMind is built specifically for emotional content, with stricter defaults: no training, no selling, encrypted entries, clean deletion.",
      },
      {
        q: "Is NexoMind cheaper than Reflect?",
        a: "NexoMind is priced as a focused reflection app, not a full note-taking system. It's a smaller, lower-commitment tool — and is generally more affordable.",
      },
    ],
    related: [
      { to: "/day-one-alternative", label: "Day One alternative", desc: "How NexoMind compares to traditional journaling." },
      { to: "/private-ai-journaling", label: "Private AI journaling", desc: "Why privacy is the foundation, not a feature." },
      { to: "/ai-journaling", label: "AI journaling", desc: "What AI journaling is — and what it isn't." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  {
    path: "/day-one-alternative",
    metaTitle: "Day One Alternative — AI Journaling, Reimagined",
    metaDescription:
      "A Day One alternative for people who want reflection, not just record-keeping. NexoMind turns messy thoughts into structured clarity in 3 minutes.",
    eyebrow: "Day One Alternative",
    title: "A modern Day One",
    italic: "alternative.",
    intro:
      "Day One is a beautiful classic journal. NexoMind is a different idea — a private AI journal that reflects what you wrote back, calmly and structured, so you don't have to be your own therapist on hard days.",
    answerBox:
      "NexoMind is a Day One alternative for people who want reflection, not just record-keeping. Day One stores your entries beautifully; NexoMind reads what you wrote and reflects back the emotion, the pattern, and one grounded takeaway — turning a journal entry into actual clarity.",
    sections: [
      {
        h2: "What Day One does well",
        body: "Day One is the gold standard of traditional digital journaling. It's beautifully designed, supports rich entries (photos, locations, weather, audio), and has a long-term archive that respects the format. If you want to remember your life — what happened, when, where — Day One is excellent at it.\n\nThe model is: you write, the app stores. Memory is the product.",
      },
      {
        h2: "Where traditional journaling reaches a ceiling",
        body: "The blank-page problem is real. Even with prompts, traditional journaling assumes you know what to write about. On the days you most need it — when something is heavy but unnamed — that assumption breaks. You stare at the cursor and close the app.\n\nThe second issue is that storage isn't the same as understanding. Day One captures what happened. It doesn't tell you what you're feeling about it, or which pattern keeps showing up, or what the next gentle step might be. That part is still on you, alone, at the moment you have the least energy for it.",
      },
      {
        h2: "What NexoMind does differently",
        body: "NexoMind is designed for the days when you don't have a plan — just a thought you can't shake. You write three messy sentences. The AI reads it and reflects back four things: a short summary in plain language, the emotion underneath, the pattern, and one grounded takeaway.\n\nThe model is: you write, the app reflects. Understanding is the product.\n\nThis matters because most people don't actually need a longer record of their lives. They need a clearer view of what they're carrying right now.",
      },
      {
        h2: "Privacy: a higher bar for AI journaling",
        body: "When you bring AI into journaling, privacy stops being optional. NexoMind's defaults are encrypted entries, no entries used to train public models, no data sold to third parties, and clean deletion on request. We treat the privacy bar as higher specifically because the AI is involved.\n\nDay One has a strong privacy story for traditional journaling. NexoMind extends that into the AI era — without the tradeoffs.",
      },
      {
        h2: "When to choose which",
        body: "Choose Day One if:\n• You want a beautiful long-term archive.\n• Your goal is memory and life-logging.\n• You enjoy the discipline of writing freely without prompts or AI involvement.\n\nChoose NexoMind if:\n• You want clarity, not just records.\n• You don't always know what to write — but you know you have something on your mind.\n• You want a 3-minute, structured reflection rather than a long-form practice.\n\nMany people use both. Day One for the year. NexoMind for the day.",
      },
      {
        h2: "What 'reflection' actually adds",
        body: "Reflection is the part that turns writing into change. Without it, journaling becomes a transcript: you wrote it down, you closed the page, and the loop continues unchanged. Reflection is the closing motion — the moment your thought is named, summarized, and handed back to you with a little more shape.\n\nNexoMind's job isn't to write your journal. It's to make sure the writing leads somewhere.",
      },
      {
        h2: "Migration: lighter than it looks",
        body: "You don't need to migrate anything. Day One can stay where it is. NexoMind starts fresh because it's a different practice — daily, short, structured. Most users spend less than 5 minutes a day in NexoMind, and many keep using Day One alongside it for longer-form entries.\n\nThe overlap is small enough that they don't compete.",
      },
      {
        h2: "How to try it without committing",
        body: "Open NexoMind once. Write the first sentence that's actually on your mind right now — not the version you'd publish. Read the reflection that comes back. If it gives you something Day One doesn't, you'll know in three minutes. If it doesn't, you've lost nothing — Day One is still where it was.\n\nThe smallest version of trying is also the honest one.",
      },
    ],
    faqs: [
      {
        q: "Is NexoMind a Day One replacement?",
        a: "Only if you want reflection over record-keeping. Many people use both — Day One for life-logging, NexoMind for daily emotional clarity.",
      },
      {
        q: "Can I import my Day One entries?",
        a: "Not currently. NexoMind is designed for forward-looking reflection rather than archive import. Most users start fresh because the practice is different.",
      },
      {
        q: "Is NexoMind as private as Day One?",
        a: "Privacy is the foundation. Encrypted entries, no training on your data, no third-party data sales, and clean deletion on request.",
      },
      {
        q: "How is the writing experience different?",
        a: "Shorter, more focused. NexoMind expects 1–5 sentences and reflects back a calm structured response. It's a 3-minute practice, not a long-form one.",
      },
    ],
    related: [
      { to: "/reflect-alternative", label: "Reflect alternative", desc: "How NexoMind compares to AI note tools." },
      { to: "/ai-journaling-app", label: "AI journaling app", desc: "What an AI journaling app should actually do." },
      { to: "/private-ai-journaling", label: "Private AI journaling", desc: "Why privacy is non-negotiable here." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────
  {
    path: "/clear-your-mind",
    metaTitle: "Clear Your Mind — Simple, Calm Methods",
    metaDescription:
      "Calm, practical methods to clear your mind when thoughts feel loud. Use journaling, reflection, and AI to find quiet — fast.",
    eyebrow: "Clear Your Mind",
    title: "Clear your",
    italic: "mind.",
    intro:
      "A clear mind isn't an empty one. It's a mind that has somewhere to put what it's carrying. These are the simplest, calmest ways to get there.",
    answerBox:
      "To clear your mind, externalize what you're carrying onto a page, name the emotion underneath in one word, and let a short reflection close the loop. Clarity doesn't come from emptying the mind — it comes from giving it somewhere to put what it's holding.",
    sections: [
      {
        h2: "Stop trying to empty your mind",
        body: "The promise of an 'empty mind' is one of the most exhausting goals in self-help. It sets you up to fail. Minds aren't designed to be empty — they're designed to think, scan, and notice. Trying to silence that doesn't produce calm; it produces frustration with yourself for being human.\n\nThe better goal is a placed mind. A mind whose contents are visible — out loud, on a page, in a reflection — instead of swirling. You haven't gotten rid of the thoughts. You've given them somewhere to be.",
      },
      {
        h2: "What 'mental noise' actually is",
        body: "Most mental noise is a small number of unprocessed feelings showing up in many places. The same anxiety wears five disguises by 9am: the email you're avoiding, the message you reread, the meeting you're rehearsing, the decision you keep flipping, the story you're spinning about someone's tone.\n\nIf you try to address each disguise, you'll never finish. If you address the feeling, all five often quiet down at once. That's why naming is more powerful than solving.",
      },
      {
        h2: "Method 1 — Empty the loop onto a page",
        body: "Open a blank space. Write every thought currently circling — unfiltered, unedited, even contradictory. Don't try to make them sound smart. Don't sort them. Just externalize.\n\nThe loop usually breaks once it's been seen. Inside your head, thoughts feel infinite because they're invisible. On a page, they're a list — finite, specific, and surprisingly small.",
      },
      {
        h2: "Method 2 — Name the feeling, not the situation",
        body: "After externalizing, ask: 'What am I actually feeling underneath all of this?' One word, not a paragraph. Tired. Resentful. Scared. Restless. Tender. Embarrassed. Hopeful.\n\nMost people skip this step because the situation seems more 'real' than the feeling. It isn't. The feeling is the engine. The situation is the smoke. Name the engine.",
      },
      {
        h2: "Method 3 — Choose one small kind thing",
        body: "Once you've externalized and named, do one small, kind thing for the version of yourself you just described. Drink water. Step outside for 90 seconds. Send the message you were dreading. Cancel the thing you were going to push through.\n\nClarity isn't an idea you reach. It's a small action you take from a slightly cleaner place.",
      },
      {
        h2: "Method 4 — Use AI as a reflection surface",
        body: "On the days when even the externalize step feels heavy, NexoMind makes it lighter. You write three messy sentences. It reads them and returns a short summary, the emotion underneath, the pattern, and one grounded next thought.\n\nThis matters because clearing your mind isn't only a writing problem — it's an attention problem. AI journaling does the structuring step for you, so you can use what energy you have for the actual reflection.",
      },
      {
        h2: "Method 5 — Make it a small daily habit",
        body: "Three minutes a day, same time, same surface. The point isn't to produce insights. It's to stop carrying everything in private. Most people feel a meaningful shift in mental noise within a week — not because they're 'better,' but because they have somewhere consistent to put what they're holding.\n\nMake it a moment, not a streak. Tied to coffee, the walk home, the few minutes before sleep. Habits built on streaks break. Habits built on moments stay.",
      },
      {
        h2: "What clarity actually feels like",
        body: "It doesn't feel like a quiet mind. It feels like a mind that has fewer secrets from itself. You still notice the thoughts. They just don't feel like emergencies. The volume drops, the urgency drops, and you can hear the actual signal underneath all the static.\n\nThat's the entire goal. Not silence. Just a little more honesty, a little less weight, and one calm sentence you can carry into the next thing.",
      },
      {
        h2: "A short ritual to try right now",
        body: "Open NexoMind or a blank page. Set a 3-minute timer. Write whatever's loudest in your head — exactly as it sounds, not as you wish it sounded. Read what you wrote. Underline the one feeling underneath it. Close the page with: 'The clearest thing I know right now is ____.'\n\nThree minutes. The mind doesn't need much. It just needs you to listen.",
      },
    ],
    faqs: [
      {
        q: "Can you really clear your mind in 3 minutes?",
        a: "Not 'empty,' but noticeably clearer — yes. Externalizing what's looping, naming the feeling underneath, and writing one honest closing sentence is enough to drop most mental noise within a few minutes.",
      },
      {
        q: "Why does meditation not work for me?",
        a: "Meditation tries to address noise by quieting attention. For some minds, especially anxious ones, that backfires — quieting attention amplifies the loop. Reflection works differently: it gives the noise somewhere to go instead of trying to silence it.",
      },
      {
        q: "Is journaling really better than just thinking?",
        a: "Almost always. Thoughts feel infinite inside your head and finite on a page. Externalizing is what turns 'a fog' into 'a sentence' — and a sentence is something you can actually do something with.",
      },
      {
        q: "How does NexoMind help here?",
        a: "It does the structuring step for you. You write messy; it reflects back a calm summary, the emotion, the pattern, and a grounded next thought. The clearing is faster because the structure is automatic.",
      },
      {
        q: "How often should I do this?",
        a: "Daily, briefly, is more powerful than occasionally and long. Three minutes a day, tied to a moment you already have, is the format most people sustain.",
      },
    ],
    related: [
      { to: "/how-to-clear-your-mind", label: "How to clear your mind", desc: "A longer practical guide for noisy days." },
      { to: "/mental-clarity", label: "Mental clarity", desc: "What clarity really means — and how to reach it." },
      { to: "/think-more-clearly", label: "Think more clearly", desc: "Calm, structured methods for sharper thinking." },
    ],
  },
];
