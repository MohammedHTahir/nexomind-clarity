import { useState, useRef, useCallback } from "react";
import { Mic, Square, RotateCcw, Trash2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { startVoiceCapture, extractAcousticFeatures, type VoiceClip } from "@/lib/voice";
import { analyzeAndStore, type AnalysisRow } from "@/lib/journal";
import { supabase } from "@/integrations/supabase/client";

type VoiceState = "idle" | "recording" | "preview" | "submitting" | "done";

interface VoiceEntryButtonProps {
  /** Whether this is a free-tier demo (15s max, no persistence) */
  demoMode?: boolean;
  /** Called when analysis completes successfully */
  onComplete?: (analysis: AnalysisRow) => void;
}

const VoiceEntryButton = ({ demoMode = false, onComplete }: VoiceEntryButtonProps) => {
  const [state, setState] = useState<VoiceState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [clip, setClip] = useState<VoiceClip | null>(null);
  const captureRef = useRef<{ stop: () => Promise<VoiceClip>; cancel: () => void } | null>(null);

  const maxSeconds = demoMode ? 15 : 60;
  const minSeconds = 3;

  const startRecording = useCallback(async () => {
    try {
      const handle = await startVoiceCapture({
        maxSeconds,
        onTick: (s) => setElapsed(s),
      });
      captureRef.current = handle;
      setState("recording");
      setElapsed(0);
    } catch (err) {
      // Permission denied or other error
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? t("voice.permissionDenied")
          : t("general.error");
      toast.error(msg);
    }
  }, [maxSeconds]);

  const stopRecording = useCallback(async () => {
    if (!captureRef.current) return;
    const result = await captureRef.current.stop();
    captureRef.current = null;

    if (result.duration < minSeconds) {
      toast.info(t("voice.tooShort"));
      setState("idle");
      setClip(null);
      return;
    }

    setClip(result);
    setState("preview");
  }, []);

  const reRecord = useCallback(() => {
    setClip(null);
    setState("idle");
    setElapsed(0);
  }, []);

  const discard = useCallback(() => {
    setClip(null);
    setState("idle");
    setElapsed(0);
  }, []);

  const submitRecording = useCallback(async () => {
    if (!clip) return;
    setState("submitting");

    try {
      // Convert blob to base64
      const arrayBuffer = await clip.blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const audio_base64 = btoa(binary);

      // Transcribe via edge function
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const transcribeResp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-voice-entry`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ audio_base64 }),
        }
      );

      if (!transcribeResp.ok) {
        const errData = await transcribeResp.json().catch(() => ({}));
        throw new Error((errData as Record<string, string>).error || "Transcription failed");
      }

      const { transcript } = (await transcribeResp.json()) as { transcript: string };

      if (!transcript.trim()) {
        throw new Error("No speech detected");
      }

      // Extract acoustic features client-side
      const voice_features = await extractAcousticFeatures(clip, transcript);

      // Analyze and store
      const { analysis } = await analyzeAndStore(transcript, voice_features);

      setState("done");
      onComplete?.(analysis);

      // Reset after a short delay
      setTimeout(() => {
        setState("idle");
        setClip(null);
        setElapsed(0);
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("general.error");
      toast.error(msg);
      setState("preview");
    }
  }, [clip, onComplete]);

  const formatElapsed = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="inline-flex items-center gap-2">
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            type="button"
            onClick={startRecording}
            className="w-9 h-9 rounded-full bg-white/60 border border-black/5 flex items-center justify-center text-[#111]/60 hover:text-[#111] hover:scale-[1.05] transition-all"
            aria-label={t("voice.startRecording")}
            title={demoMode ? t("voice.freeTierUpsell") : t("voice.startRecording")}
          >
            <Mic className="w-4 h-4" strokeWidth={1.75} />
          </motion.button>
        )}

        {state === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="font-barlow text-[12px] text-[#111]/70 tabular-nums min-w-[36px]">
              {formatElapsed(elapsed)}
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 hover:bg-red-500/20 transition-all"
              aria-label={t("voice.stopRecording")}
            >
              <Square className="w-3 h-3" strokeWidth={2} fill="currentColor" />
            </button>
          </motion.div>
        )}

        {state === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-1.5"
          >
            <span className="font-barlow text-[11px] text-[#111]/50">
              {clip ? formatElapsed(Math.round(clip.duration)) : ""}
            </span>
            {!demoMode && (
              <button
                type="button"
                onClick={submitRecording}
                className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-700 hover:bg-green-500/20 transition-all"
                aria-label={t("voice.submit")}
                title={t("voice.submit")}
              >
                <Send className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
            <button
              type="button"
              onClick={reRecord}
              className="w-8 h-8 rounded-full bg-white/60 border border-black/5 flex items-center justify-center text-[#111]/60 hover:text-[#111] transition-all"
              aria-label={t("voice.reRecord")}
              title={t("voice.reRecord")}
            >
              <RotateCcw className="w-3 h-3" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={discard}
              className="w-8 h-8 rounded-full bg-white/60 border border-black/5 flex items-center justify-center text-[#111]/60 hover:text-red-500 transition-all"
              aria-label={t("voice.discard")}
              title={t("voice.discard")}
            >
              <Trash2 className="w-3 h-3" strokeWidth={2} />
            </button>
            {demoMode && (
              <span className="font-barlow text-[10px] text-[#111]/40 ml-1">
                {t("voice.freeTierUpsell")}
              </span>
            )}
          </motion.div>
        )}

        {state === "submitting" && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-[#111]/50"
            />
            <span className="font-barlow text-[11px] text-[#111]/50">
              {t("voice.processing")}
            </span>
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            <span className="font-barlow text-[11px] text-green-700">
              {t("voice.done")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceEntryButton;
