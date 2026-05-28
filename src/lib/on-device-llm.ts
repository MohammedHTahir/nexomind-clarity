/**
 * On-device LLM detection and bridge for E2EE Private Mode.
 * Probes Chrome Prompt API (window.ai?.languageModel) for local analysis.
 */

// Type definitions for Chrome Prompt API (non-standard)
interface AILanguageModel {
  create: (options?: { systemPrompt?: string }) => Promise<AILanguageModelSession>;
  capabilities: () => Promise<{ available: string }>;
}

interface AILanguageModelSession {
  prompt: (input: string) => Promise<string>;
  destroy: () => void;
}

interface WindowAI {
  languageModel?: AILanguageModel;
}

declare global {
  interface Window {
    ai?: WindowAI;
  }
}

export interface OnDeviceLLMAnalysis {
  summary: string;
  emotional_state: string;
  intensity_score: number;
  clarity_score: number;
  cognitive_patterns: string[];
  key_thoughts: string[];
  distortions_or_biases: string[];
  clarity_insight: string;
  suggested_reflection: string;
}

export interface OnDeviceLLM {
  analyzeEntry(plaintext: string): Promise<OnDeviceLLMAnalysis>;
  destroy(): void;
}

const ANALYSIS_SYSTEM_PROMPT = `You are NexoMind, an AI mental clarity engine running privately on-device.
Analyze journal entries and return ONLY valid JSON with this exact structure:
{
  "summary": "brief summary of the entry",
  "emotional_state": "primary emotion",
  "intensity_score": 0-100,
  "clarity_score": 0-100,
  "cognitive_patterns": ["pattern1"],
  "key_thoughts": ["thought1"],
  "distortions_or_biases": ["distortion1"],
  "clarity_insight": "one sentence insight",
  "suggested_reflection": "one reflective question or prompt"
}
Be calm, minimal, structured. Do not diagnose or give therapy.`;

/**
 * Check if an on-device LLM is available (Chrome Prompt API).
 */
export async function isOnDeviceLLMAvailable(): Promise<boolean> {
  try {
    const ai = window?.ai;
    if (!ai?.languageModel) return false;
    const caps = await ai.languageModel.capabilities();
    return caps.available === "readily" || caps.available === "after-download";
  } catch {
    return false;
  }
}

/**
 * Get an on-device LLM instance using Chrome Prompt API.
 * Returns null if not available.
 */
export async function getOnDeviceLLM(): Promise<OnDeviceLLM | null> {
  try {
    const ai = window?.ai;
    if (!ai?.languageModel) return null;

    const caps = await ai.languageModel.capabilities();
    if (caps.available !== "readily" && caps.available !== "after-download") {
      return null;
    }

    const session = await ai.languageModel.create({
      systemPrompt: ANALYSIS_SYSTEM_PROMPT,
    });

    return {
      async analyzeEntry(plaintext: string): Promise<OnDeviceLLMAnalysis> {
        const prompt = `Analyze this journal entry and return ONLY valid JSON:\n\n${plaintext}`;
        const response = await session.prompt(prompt);

        // Parse the JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("On-device LLM did not return valid JSON");
        }
        const parsed = JSON.parse(jsonMatch[0]) as OnDeviceLLMAnalysis;

        // Validate required fields with defaults
        return {
          summary: parsed.summary || "Analysis completed on-device",
          emotional_state: parsed.emotional_state || "neutral",
          intensity_score: typeof parsed.intensity_score === "number" ? parsed.intensity_score : 50,
          clarity_score: typeof parsed.clarity_score === "number" ? parsed.clarity_score : 50,
          cognitive_patterns: Array.isArray(parsed.cognitive_patterns) ? parsed.cognitive_patterns : [],
          key_thoughts: Array.isArray(parsed.key_thoughts) ? parsed.key_thoughts : [],
          distortions_or_biases: Array.isArray(parsed.distortions_or_biases) ? parsed.distortions_or_biases : [],
          clarity_insight: parsed.clarity_insight || "Reflection processed privately on your device",
          suggested_reflection: parsed.suggested_reflection || "What patterns do you notice in this entry?",
        };
      },
      destroy() {
        session.destroy();
      },
    };
  } catch {
    return null;
  }
}
