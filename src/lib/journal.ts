import { supabase } from "@/integrations/supabase/client";

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

export async function analyzeAndStore(
  content: string,
  voice_features?: VoiceFeaturesParam
): Promise<{
  journal: JournalRow;
  analysis: AnalysisRow;
  usage?: AnalyzeUsage;
  isPremium?: boolean;
}> {
  const body: Record<string, unknown> = { content };
  if (voice_features) {
    body.voice_features = voice_features;
  }

  const { data, error } = await supabase.functions.invoke("analyze-journal", {
    body,
  });
  const payload = (data ?? {}) as any;
  if (payload?.code === "FREE_LIMIT_REACHED") {
    throw new FreeLimitReachedError(
      payload.error ?? "Free limit reached",
      payload.limit ?? 3,
      payload.used ?? 0,
    );
  }
  if (error) throw error;
  if (payload?.error) throw new Error(payload.error);
  return payload as {
    journal: JournalRow;
    analysis: AnalysisRow;
    usage?: AnalyzeUsage;
    isPremium?: boolean;
  };
}

export async function fetchJournals(): Promise<JournalWithAnalysis[]> {
  const { data, error } = await supabase
    .from("journals")
    .select("*, analysis:journal_analysis(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    analysis: Array.isArray(row.analysis) ? row.analysis[0] ?? null : row.analysis,
  }));
}

export async function deleteAllJournals(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return;
  await supabase.from("journals").delete().eq("user_id", uid);
}
