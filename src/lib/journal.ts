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

export async function analyzeAndStore(content: string): Promise<{
  journal: JournalRow;
  analysis: AnalysisRow;
}> {
  const { data, error } = await supabase.functions.invoke("analyze-journal", {
    body: { content },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as { journal: JournalRow; analysis: AnalysisRow };
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
