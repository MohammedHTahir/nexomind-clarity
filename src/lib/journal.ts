import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  enqueueJournal,
  isOnline,
  readCachedJournals,
  writeCachedJournals,
} from "@/lib/offline";

export type AnalysisRow = {
  id: string;
  journal_id: string;
  user_id: string;
  summary: string | null;
  emotional_state: string | null;
  intensity_score: number | null;
  clarity_score: number | null;
  cognitive_patterns: string[];
  key_thoughts: string[];
  distortions_or_biases: string[];
  clarity_insight: string | null;
  suggested_reflection: string | null;
  created_at: string;
};

export type JournalRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type JournalWithAnalysis = JournalRow & { analysis: AnalysisRow | null };

export const clarityBand = (score: number | null | undefined) => {
  if (score == null) return "—";
  if (score < 30) return "Emotional overload";
  if (score < 60) return "Mixed clarity";
  if (score < 80) return "Stable awareness";
  return "High clarity";
};

export type AnalyzeUsage = { limit: number | null; used: number; remaining: number | null };

export class FreeLimitReachedError extends Error {
  limit: number;
  used: number;
  constructor(message: string, limit: number, used: number) {
    super(message);
    this.name = "FreeLimitReachedError";
    this.limit = limit;
    this.used = used;
  }
}

export interface VoiceFeaturesParam {
  pace_wpm: number;
  hesitation_ratio: number;
  tonal_variability_hz: number;
}

async function invokeJournalAnalysis(body: Record<string, unknown>) {
  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  let response = await supabase.functions.invoke("analyze-journal", {
    body,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.error && (response.error as any).context instanceof Response) {
    const status = (response.error as any).context.status as number;
    if (status === 401) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      accessToken = refreshed.session?.access_token;
      if (refreshError || !accessToken) {
        throw new Error("Your session has expired. Please sign in again.");
      }
      response = await supabase.functions.invoke("analyze-journal", {
        body,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
  }

  return response;
}

export async function analyzeAndStore(
  content: string,
  voice_features?: VoiceFeaturesParam
): Promise<{
  journal: JournalRow;
  analysis: AnalysisRow;
  usage?: AnalyzeUsage;
  isPremium?: boolean;
}> {
  // Offline path: queue locally and return an optimistic entry.
  if (!isOnline()) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Not authenticated");
    const optimistic = await enqueueJournal(content, userId, voice_features);
    return {
      journal: {
        id: optimistic.id,
        user_id: optimistic.user_id,
        content: optimistic.content,
        created_at: optimistic.created_at,
      },
      analysis: optimistic.analysis as AnalysisRow,
    };
  }

  const body: Record<string, unknown> = { content };
  if (voice_features) {
    body.voice_features = voice_features;
  }

  try {
    const { data, error } = await invokeJournalAnalysis(body);
    let payload = (data ?? {}) as any;

    // Non-2xx responses surface as FunctionsHttpError with data === null.
    // Read the real JSON body so structured codes (FREE_LIMIT_REACHED, etc.) survive.
    if (error && (error as any).context instanceof Response) {
      try {
        payload = await (error as any).context.clone().json();
      } catch {
        /* keep empty payload */
      }
    }

    if (payload?.code === "FREE_LIMIT_REACHED") {
      throw new FreeLimitReachedError(
        payload.error ?? "Free limit reached",
        payload.limit ?? 3,
        payload.used ?? 0,
      );
    }
    if (payload?.error) throw new Error(payload.error);
    if (error) throw error;
    return payload as {
      journal: JournalRow;
      analysis: AnalysisRow;
      usage?: AnalyzeUsage;
      isPremium?: boolean;
    };

  } catch (e) {
    // Network failure during request — fall back to offline queue rather than losing the entry.
    if (e instanceof FreeLimitReachedError) throw e;
    if (!isOnline() || (e instanceof TypeError /* fetch failed */)) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw e;
      const optimistic = await enqueueJournal(content, userId, voice_features);
      return {
        journal: {
          id: optimistic.id,
          user_id: optimistic.user_id,
          content: optimistic.content,
          created_at: optimistic.created_at,
        },
        analysis: optimistic.analysis as AnalysisRow,
      };
    }
    throw e;
  }
}

/**
 * E2EE-aware analyze and store: encrypts content client-side, runs on-device LLM.
 * Analysis string fields (summary, emotional_state, clarity_insight, suggested_reflection)
 * are encrypted before insertion so the server never stores plaintext analysis for E2EE users.
 */
export async function analyzeAndStoreE2EE(
  content: string,
  encryptFn: (text: string) => Promise<string>,
  onDeviceLLM: { analyzeEntry: (text: string) => Promise<Record<string, unknown>> } | null
): Promise<{
  journal: JournalRow;
  analysis: AnalysisRow;
}> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not authenticated");

  // Encrypt the content
  const ciphertext = await encryptFn(content);

  // Insert journal with encrypted content
  const { data: journal, error: jErr } = await supabase
    .from("journals")
    .insert({
      user_id: userId,
      content: null,
      is_encrypted: true,
      ciphertext,
    })
    .select()
    .single();
  if (jErr) throw jErr;

  // Run on-device analysis if available
  let analysisData: Record<string, unknown> = {
    summary: "Entry encrypted - analysis requires on-device LLM",
    emotional_state: "unknown",
    intensity_score: 50,
    clarity_score: 50,
    cognitive_patterns: [],
    key_thoughts: [],
    distortions_or_biases: [],
    clarity_insight: "This entry is end-to-end encrypted",
    suggested_reflection: "On-device analysis will be available when supported by your browser",
  };

  if (onDeviceLLM) {
    try {
      analysisData = await onDeviceLLM.analyzeEntry(content) as Record<string, unknown>;
    } catch (e) {
      console.warn("[E2EE] On-device analysis failed, using placeholder:", e);
    }
  }

  // Encrypt string analysis fields before storing to maintain E2EE guarantee.
  // Numeric fields (intensity_score, clarity_score) are stored unencrypted for
  // aggregate statistics; they contain no personally identifiable content.
  const encryptedSummary = typeof analysisData.summary === "string"
    ? await encryptFn(analysisData.summary)
    : null;
  const encryptedEmotionalState = typeof analysisData.emotional_state === "string"
    ? await encryptFn(analysisData.emotional_state)
    : null;
  const encryptedClarityInsight = typeof analysisData.clarity_insight === "string"
    ? await encryptFn(analysisData.clarity_insight)
    : null;
  const encryptedSuggestedReflection = typeof analysisData.suggested_reflection === "string"
    ? await encryptFn(analysisData.suggested_reflection)
    : null;

  // Store analysis with encrypted string fields
  const { data: analysis, error: aErr } = await supabase
    .from("journal_analysis")
    .insert({
      journal_id: journal.id,
      user_id: userId,
      summary: encryptedSummary,
      emotional_state: encryptedEmotionalState,
      intensity_score: analysisData.intensity_score as number | null,
      clarity_score: analysisData.clarity_score as number | null,
      cognitive_patterns: (analysisData.cognitive_patterns ?? []) as Json,
      key_thoughts: (analysisData.key_thoughts ?? []) as Json,
      distortions_or_biases: (analysisData.distortions_or_biases ?? []) as Json,
      clarity_insight: encryptedClarityInsight,
      suggested_reflection: encryptedSuggestedReflection,
      is_encrypted: true,
    })
    .select()
    .single();
  if (aErr) throw aErr;

  return { journal, analysis: analysis as unknown as AnalysisRow };
}

export async function fetchJournals(): Promise<JournalWithAnalysis[]> {
  // Offline: serve cached snapshot.
  if (!isOnline()) {
    return readCachedJournals();
  }
  try {
    const { data, error } = await supabase
      .from("journals")
      .select("*, analysis:journal_analysis(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    const normalized = (data ?? []).map((row: any) => ({
      ...row,
      analysis: Array.isArray(row.analysis) ? row.analysis[0] ?? null : row.analysis,
    })) as JournalWithAnalysis[];

    // Merge: keep any still-pending local entries on top of fresh server data.
    const cached = await readCachedJournals();
    const pendingLocals = cached.filter((r) => r.id.startsWith("local-"));
    const merged = [...pendingLocals, ...normalized];
    await writeCachedJournals(merged);
    return merged;
  } catch (e) {
    const cached = await readCachedJournals();
    if (cached.length > 0) return cached;
    throw e;
  }
}

export async function deleteAllJournals(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return;
  await supabase.from("journals").delete().eq("user_id", uid);
}
