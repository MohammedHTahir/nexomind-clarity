// Offline-first cache + write queue for journals.
//
// - Caches the journal list in IndexedDB so the app can render history when offline.
// - Queues new entries written while offline; flushes them to the server when
//   connectivity returns or when the app boots online.
// - Listeners can subscribe to queue/online changes to render an indicator.

import { get, set, del } from "idb-keyval";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisRow, JournalRow, JournalWithAnalysis } from "@/lib/journal";

const KEY_JOURNALS_CACHE = "nexomind:cache:journals:v1";
const KEY_PENDING_QUEUE = "nexomind:queue:journals:v1";

export type PendingJournal = {
  localId: string;        // synthetic id, prefixed `local-`
  content: string;
  voice_features?: {
    pace_wpm: number;
    hesitation_ratio: number;
    tonal_variability_hz: number;
  };
  created_at: string;     // ISO; used as optimistic timestamp
};

// ---------- Listeners ----------

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribeOfflineState(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      /* noop */
    }
  });
}

export const isOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine !== false;

// ---------- Cache (read side) ----------

export async function readCachedJournals(): Promise<JournalWithAnalysis[]> {
  try {
    const cached = (await get<JournalWithAnalysis[]>(KEY_JOURNALS_CACHE)) ?? [];
    return cached;
  } catch {
    return [];
  }
}

export async function writeCachedJournals(rows: JournalWithAnalysis[]): Promise<void> {
  try {
    await set(KEY_JOURNALS_CACHE, rows);
  } catch {
    /* IDB unavailable — ignore */
  }
}

// ---------- Queue (write side) ----------

export async function readQueue(): Promise<PendingJournal[]> {
  try {
    return (await get<PendingJournal[]>(KEY_PENDING_QUEUE)) ?? [];
  } catch {
    return [];
  }
}

export async function getPendingCount(): Promise<number> {
  return (await readQueue()).length;
}

async function writeQueue(q: PendingJournal[]): Promise<void> {
  if (q.length === 0) {
    await del(KEY_PENDING_QUEUE).catch(() => {});
  } else {
    await set(KEY_PENDING_QUEUE, q);
  }
  emit();
}

/**
 * Enqueue an entry to be synced later. Returns an optimistic JournalWithAnalysis
 * the UI can render immediately. The placeholder analysis is filled in once the
 * server analyzes the entry during flush.
 */
export async function enqueueJournal(
  content: string,
  userId: string,
  voice_features?: PendingJournal["voice_features"],
): Promise<JournalWithAnalysis> {
  const localId = `local-${crypto.randomUUID()}`;
  const created_at = new Date().toISOString();
  const item: PendingJournal = { localId, content, voice_features, created_at };
  const q = await readQueue();
  q.push(item);
  await writeQueue(q);

  const optimisticJournal: JournalRow = {
    id: localId,
    user_id: userId,
    content,
    created_at,
  };
  const optimisticAnalysis: AnalysisRow = {
    id: `${localId}-a`,
    journal_id: localId,
    user_id: userId,
    summary: "Saved offline — will be reflected on when you're back online.",
    emotional_state: null,
    intensity_score: null,
    clarity_score: null,
    cognitive_patterns: [],
    key_thoughts: [],
    distortions_or_biases: [],
    clarity_insight: null,
    suggested_reflection: null,
    created_at,
  };

  // Optimistically prepend to cached list so it appears in history offline.
  const cached = await readCachedJournals();
  await writeCachedJournals([
    { ...optimisticJournal, analysis: optimisticAnalysis },
    ...cached,
  ]);

  return { ...optimisticJournal, analysis: optimisticAnalysis };
}

// ---------- Flush ----------

let flushing = false;
let flushPromise: Promise<{ synced: number; failed: number }> | null = null;

export type FlushResult = { synced: number; failed: number };

export async function flushQueue(): Promise<FlushResult> {
  if (flushing && flushPromise) return flushPromise;
  if (!isOnline()) return { synced: 0, failed: 0 };

  flushing = true;
  flushPromise = (async () => {
    let synced = 0;
    let failed = 0;
    try {
      const q = await readQueue();
      if (q.length === 0) return { synced: 0, failed: 0 };

      const remaining: PendingJournal[] = [];
      for (const item of q) {
        try {
          const body: Record<string, unknown> = { content: item.content };
          if (item.voice_features) body.voice_features = item.voice_features;
          const { data, error } = await supabase.functions.invoke(
            "analyze-journal",
            { body },
          );
          const payload = (data ?? {}) as any;
          if (error || payload?.error || payload?.code === "FREE_LIMIT_REACHED") {
            // Keep it queued unless it's a permanent client failure.
            // FREE_LIMIT_REACHED is permanent for the week — drop with a marker.
            if (payload?.code === "FREE_LIMIT_REACHED") {
              failed += 1; // dropped, surface to user
            } else {
              remaining.push(item);
              failed += 1;
            }
          } else {
            synced += 1;
          }
        } catch {
          remaining.push(item);
          failed += 1;
        }
      }
      await writeQueue(remaining);

      // If we successfully synced anything, refresh the cached list from server.
      if (synced > 0 && isOnline()) {
        try {
          const { data } = await supabase
            .from("journals")
            .select("*, analysis:journal_analysis(*)")
            .order("created_at", { ascending: false })
            .limit(200);
          if (data) {
            const normalized = (data as any[]).map((row) => ({
              ...row,
              analysis: Array.isArray(row.analysis)
                ? row.analysis[0] ?? null
                : row.analysis,
            })) as JournalWithAnalysis[];
            await writeCachedJournals(normalized);
          }
        } catch {
          /* ignore */
        }
      }

      return { synced, failed };
    } finally {
      flushing = false;
      flushPromise = null;
      emit();
    }
  })();
  return flushPromise;
}

// ---------- Boot ----------

let booted = false;
export function bootOfflineSync() {
  if (booted || typeof window === "undefined") return;
  booted = true;

  const onOnline = () => {
    emit();
    flushQueue().catch(() => {});
  };
  const onOffline = () => emit();
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  // Attempt initial flush in case there are leftover queued entries.
  if (isOnline()) {
    flushQueue().catch(() => {});
  }
}
