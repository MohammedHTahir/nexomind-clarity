export type JournalEntry = {
  id: string;
  text: string;
  createdAt: number;
  mood: string;
  clarity: number;
  tags: string[];
  summary: string;
  emotion: string;
  suggestion: string;
};

const KEY = "nexomind:entries";

export const loadEntries = (): JournalEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveEntry = (entry: JournalEntry) => {
  const all = loadEntries();
  all.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200)));
};

export const deleteAll = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem("nexomind:onboarding");
};

const moodWords: Record<string, string[]> = {
  Anxious: ["anxious", "worry", "worried", "nervous", "afraid", "scared", "panic"],
  Stressed: ["stressed", "stress", "overwhelmed", "pressure", "deadline", "too much"],
  Sad: ["sad", "down", "low", "tired", "exhausted", "lonely", "empty"],
  Angry: ["angry", "frustrated", "annoyed", "mad", "hate", "unfair"],
  Reflective: ["thinking", "wonder", "remember", "realize", "perhaps", "maybe"],
  Calm: ["calm", "peace", "okay", "fine", "grateful", "happy", "content"],
};

const suggestions: Record<string, string> = {
  Anxious: "Try separating what you can control from what you cannot. Name one small action for tonight.",
  Stressed: "Step away from your screen for ten minutes. The noise will still be there — but quieter.",
  Sad: "Be gentle with yourself today. You don't have to fix anything right now.",
  Angry: "Write the unsent letter. You don't have to send it — just let the feeling have a shape.",
  Reflective: "Sit with this thought a little longer. Curiosity is a kind of clarity.",
  Calm: "Notice what made today feel okay. Patterns of peace are worth remembering.",
};

export type Analysis = {
  mood: string;
  emotion: string;
  clarity: number;
  tags: string[];
  summary: string;
  suggestion: string;
};

export const analyze = (text: string): Analysis => {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [m, words] of Object.entries(moodWords)) {
    scores[m] = words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
  }
  const top =
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    (text.length < 60 ? "Reflective" : "Reflective");
  const mood = scores[top] > 0 ? top : "Reflective";

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const baseClarity = Math.min(95, 40 + wordCount);
  const adjust = mood === "Anxious" || mood === "Stressed" ? -18 : mood === "Calm" ? 10 : 0;
  const clarity = Math.max(20, Math.min(95, baseClarity + adjust));

  const tags: string[] = [];
  if (mood === "Anxious") tags.push("Anxiety detected", "Future-focused thoughts");
  if (mood === "Stressed") tags.push("Stress detected", "Cognitive overload");
  if (mood === "Sad") tags.push("Low energy", "Emotional weight");
  if (mood === "Angry") tags.push("Frustration", "Unresolved tension");
  if (mood === "Reflective") tags.push("Reflective state", "Self-inquiry");
  if (mood === "Calm") tags.push("Steady mood", "Grounded state");
  if (clarity < 50) tags.push("Low clarity state");

  const emotionLine =
    mood === "Anxious"
      ? "There's an undercurrent of worry running beneath this — anticipation of something not yet here."
      : mood === "Stressed"
      ? "It looks like you're carrying mental overload and unresolved stress. Slowing down may help restore clarity."
      : mood === "Sad"
      ? "There's a heaviness in this. It deserves to be acknowledged, not solved."
      : mood === "Angry"
      ? "Frustration often signals an unmet need. What feels unfair right now?"
      : mood === "Calm"
      ? "Your thoughts feel settled. This is a good place to notice what's working."
      : "You're sitting with something quietly. There's nothing wrong with simply observing it.";

  const summary =
    wordCount < 12
      ? "A short entry — sometimes the smallest thoughts are the loudest."
      : `You wrote about ${wordCount} words exploring how you're feeling and what's on your mind.`;

  return {
    mood,
    emotion: emotionLine,
    clarity,
    tags,
    summary,
    suggestion: suggestions[mood],
  };
};
