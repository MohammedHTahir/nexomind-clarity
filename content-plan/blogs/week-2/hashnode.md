# I Kept Cutting Features and Usage Kept Going Up - Here's Why

> **Note:** Set canonical_url to the Medium article URL in Hashnode's post settings UI before publishing.

---

this is a post about the most counterintuitive product lesson i've learned: every time i removed something from my AI app, engagement went up. every time i added something, it went down or stayed flat.

i don't think this is unique to my product. i think it's true for any AI tool that's supposed to help people think. and it goes against every instinct we have as builders.

---

## The starting point

NexoMind is an AI journaling tool. You write what's on your mind. It reflects back the pattern it detects. That's the interaction.

The first version gave 300-word responses. Explained the cognitive distortion, offered reframe techniques, asked follow-up questions, ended with encouragement.

Users rated it 4.2/5 in feedback surveys.

Users came back every 4.3 days on average. Most stopped within two weeks.

Good ratings. Bad retention. That gap was the entire problem.

---

## What I cut (and what happened)

### Cut 1: Remove technique suggestions

Removed "here's what you could try." Kept explanation and naming only.

Result: return rate improved slightly. Users stopped feeling like the app was giving them homework.

### Cut 2: Remove lengthy explanations

Stripped all explanatory text. Left only: trigger identification, loop type, distortion label, one-line reframe.

Result: return rate doubled. Completion rate went from 67% to 91%.

### Cut 3: Remove follow-up questions

Cut all "what do you think about X?" prompts.

Result: time-in-app went down (expected) but next-session rate went up. People closed the app faster but came back sooner.

### Cut 4: Remove affirmations

No more "great job for reflecting today" or "remember, awareness is the first step."

Result: satisfaction scores actually increased. People prefer precision over validation when they're in a thought loop.

---

## Final state: 4 lines

```
Trigger: [what activated the loop]
Loop: [pattern type]
Distortion: [cognitive distortion label]
Reframe: [one sentence, specific to their entry]
```

That's the entire AI output. And it outperforms the 300-word version on every metric i track.

---

## Why this happens (the framework i use now)

**The cognitive load principle.** Someone writing in a thought loop is already processing too much. Your output adds to their processing burden. Every word you add is another thing their overwhelmed brain needs to handle. Brief = respectful of their state.

**The precision principle.** When the AI only has 4 lines, it can't hide inaccuracy in explanation. Either it nails the pattern or it clearly misses. Constraints force precision because there's nowhere for vagueness to hide.

**The homework principle.** "Here are three techniques" = assignment. People avoid assignments. Naming doesn't ask anything of you. It just reflects. There's no obligation in a mirror.

**The habit loop principle.** The 4-line version creates a tight loop: write -> see it named -> feel done -> close app -> come back tomorrow. The 300-word version breaks that loop because reading 300 words takes effort, making the interaction feel heavy rather than quick.

---

## What I kept saying no to

Feature requests I get weekly:
- Mood tracking dashboards
- Gratitude prompts
- Meditation timer integration
- Habit streaks and gamification
- Breathing exercises
- Goal setting

Each one makes sense individually. Each one would dilute what makes the product work.

The product's value comes from its constraint. "We do one thing precisely" is a positioning most apps can't maintain because the temptation to expand is relentless.

Here's my test: if adding this feature means a user needs more than 90 seconds per session, it's wrong for this product. 90 seconds is the constraint. Write, read 4 lines, close. That's the habit that retains.

---

## The peak usage finding

11pm to 2am is our highest engagement window.

People use it as a pre-sleep pattern interrupt. Write the looping thought, get it named, close the app, sleep. It only works because the response takes 15 seconds to read. A 300-word essay at midnight? Nobody does that.

The brevity isn't a tradeoff. It's what makes the product work at the exact moment people need it most.

---

## Practical takeaways if you're building AI tools

1. **Your AI's output length should match the user's cognitive state.** If they're stressed, overwhelmed, or looping, less is more. Literally.

2. **Try cutting output by 75% and measuring return rate.** If it goes up, your users wanted precision, not volume. You were over-serving.

3. **"Helpful" and "retains" are different metrics.** Survey feedback lies. Return rate tells truth. Optimize for behavior, not sentiment.

4. **Constraints improve AI output quality.** "4 lines max" makes the model find the essential insight. "300 words" lets it pad and meander.

5. **Narrowness is a moat.** The product that does one thing precisely and quickly wins against the product that does 12 things adequately.

---

[NexoMind](https://nexomind.ai) - write what's looping. get 4 lines back. 90 seconds. that's it.
