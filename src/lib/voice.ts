/**
 * Voice capture utilities for the Voice-First Thought Dump feature.
 * Provides MediaRecorder-based audio capture, acoustic feature extraction,
 * and capability detection.
 */

export interface VoiceClip {
  blob: Blob;
  duration: number; // seconds
}

export interface AcousticFeatures {
  pace_wpm: number;
  hesitation_ratio: number;
  tonal_variability_hz: number;
}

interface StartVoiceCaptureOptions {
  maxSeconds?: number;
  minSeconds?: number;
  onTick?: (elapsed: number) => void;
}

interface VoiceCaptureHandle {
  stop: () => Promise<VoiceClip>;
  cancel: () => void;
}

/**
 * Check if the browser supports voice recording via MediaRecorder.
 */
export function isVoiceSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * Start capturing audio from the user's microphone.
 * Returns a handle to stop or cancel the recording.
 */
export async function startVoiceCapture(
  options: StartVoiceCaptureOptions = {}
): Promise<VoiceCaptureHandle> {
  const { maxSeconds = 60, onTick } = options;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm";

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  let startTime = Date.now();
  let tickInterval: ReturnType<typeof setInterval> | null = null;
  let maxTimeout: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  // Collect audio data
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  // Elapsed timer
  if (onTick) {
    tickInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onTick(elapsed);
    }, 1000);
  }

  // Resolve when stopped
  const clipPromise = new Promise<VoiceClip>((resolve) => {
    recorder.onstop = () => {
      const duration = (Date.now() - startTime) / 1000;
      const blob = new Blob(chunks, { type: mimeType });
      resolve({ blob, duration });
    };
  });

  // Auto-stop at maxSeconds
  maxTimeout = setTimeout(() => {
    if (!stopped) {
      stopped = true;
      recorder.stop();
      cleanup();
    }
  }, maxSeconds * 1000);

  recorder.start();

  function cleanup() {
    if (tickInterval) clearInterval(tickInterval);
    if (maxTimeout) clearTimeout(maxTimeout);
    stream.getTracks().forEach((track) => track.stop());
  }

  return {
    stop: async () => {
      if (!stopped) {
        stopped = true;
        recorder.stop();
        cleanup();
      }
      return clipPromise;
    },
    cancel: () => {
      stopped = true;
      recorder.stop();
      cleanup();
    },
  };
}

// Filler words regex for hesitation detection
const FILLER_REGEX = /\b(um|uh|er|ah|like|you know|i mean|sort of|kind of|basically)\b/gi;

/**
 * Extract acoustic features from a voice clip and its transcript.
 * - pace_wpm: words per minute based on transcript word count and clip duration
 * - hesitation_ratio: ratio of filler words to total words
 * - tonal_variability_hz: estimated pitch variability using autocorrelation
 */
export async function extractAcousticFeatures(
  clip: VoiceClip,
  transcript: string
): Promise<AcousticFeatures> {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const durationMinutes = clip.duration / 60;

  // Pace: words per minute
  const pace_wpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0;

  // Hesitation ratio: filler words / total words
  const fillerMatches = transcript.match(FILLER_REGEX) ?? [];
  const hesitation_ratio =
    wordCount > 0 ? Math.round((fillerMatches.length / wordCount) * 100) / 100 : 0;

  // Tonal variability: pitch estimation via Web Audio API
  let tonal_variability_hz = 0;
  try {
    tonal_variability_hz = await estimateTonalVariability(clip.blob);
  } catch {
    // Fallback: if Web Audio analysis fails, return 0
    tonal_variability_hz = 0;
  }

  return { pace_wpm, hesitation_ratio, tonal_variability_hz };
}

/**
 * Estimate tonal variability using AudioContext and autocorrelation pitch detection.
 */
async function estimateTonalVariability(blob: Blob): Promise<number> {
  const audioCtx = new AudioContext();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Process in chunks for pitch detection
    const chunkSize = Math.floor(sampleRate * 0.03); // 30ms windows
    const hopSize = Math.floor(sampleRate * 0.015); // 15ms hop
    const pitches: number[] = [];

    for (let i = 0; i + chunkSize < channelData.length; i += hopSize) {
      const chunk = channelData.slice(i, i + chunkSize);
      const pitch = detectPitchAutocorrelation(chunk, sampleRate);
      if (pitch > 50 && pitch < 500) {
        pitches.push(pitch);
      }
    }

    if (pitches.length < 2) return 0;

    // Standard deviation of detected pitches
    const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const variance =
      pitches.reduce((acc, p) => acc + (p - mean) ** 2, 0) / pitches.length;
    return Math.round(Math.sqrt(variance) * 10) / 10;
  } finally {
    await audioCtx.close();
  }
}

/**
 * Autocorrelation-based pitch detection for a single audio frame.
 */
function detectPitchAutocorrelation(
  buffer: Float32Array,
  sampleRate: number
): number {
  const size = buffer.length;
  const minPeriod = Math.floor(sampleRate / 500); // 500 Hz max
  const maxPeriod = Math.floor(sampleRate / 50); // 50 Hz min

  let bestCorrelation = 0;
  let bestPeriod = 0;

  for (let period = minPeriod; period <= maxPeriod && period < size; period++) {
    let correlation = 0;
    for (let i = 0; i < size - period; i++) {
      correlation += buffer[i] * buffer[i + period];
    }
    correlation /= size - period;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestPeriod = period;
    }
  }

  if (bestPeriod === 0 || bestCorrelation < 0.01) return 0;
  return sampleRate / bestPeriod;
}
