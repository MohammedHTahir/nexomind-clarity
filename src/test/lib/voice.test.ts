import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractAcousticFeatures, isVoiceSupported } from "@/lib/voice";

describe("voice", () => {
  describe("extractAcousticFeatures", () => {
    it("calculates pace_wpm correctly (120 words in 60 seconds = 120 WPM)", async () => {
      const words = Array(120).fill("word").join(" ");
      const clip = {
        blob: new Blob(["audio-data"]),
        duration: 60,
      };

      const features = await extractAcousticFeatures(clip, words);
      expect(features.pace_wpm).toBe(120);
    });

    it("calculates pace_wpm for different durations", async () => {
      const words = Array(60).fill("hello").join(" ");
      const clip = {
        blob: new Blob(["audio-data"]),
        duration: 30,
      };

      const features = await extractAcousticFeatures(clip, words);
      expect(features.pace_wpm).toBe(120);
    });

    it("returns 0 pace_wpm when duration is 0", async () => {
      const clip = {
        blob: new Blob(["audio-data"]),
        duration: 0,
      };

      const features = await extractAcousticFeatures(clip, "some words here");
      expect(features.pace_wpm).toBe(0);
    });

    it("calculates hesitation_ratio with known filler words", async () => {
      // 10 words total, 3 filler words: "um", "uh", "like"
      const transcript = "um I was uh thinking about like going home today";
      const clip = {
        blob: new Blob(["audio-data"]),
        duration: 10,
      };

      const features = await extractAcousticFeatures(clip, transcript);
      // 3 fillers / 10 words = 0.3
      expect(features.hesitation_ratio).toBe(0.3);
    });

    it("returns 0 hesitation_ratio when no filler words present", async () => {
      const transcript = "The weather was beautiful today and I went for a walk";
      const clip = {
        blob: new Blob(["audio-data"]),
        duration: 10,
      };

      const features = await extractAcousticFeatures(clip, transcript);
      expect(features.hesitation_ratio).toBe(0);
    });

    it("returns 0 tonal_variability when AudioContext is unavailable", async () => {
      const clip = {
        blob: new Blob(["audio-data"]),
        duration: 30,
      };

      const features = await extractAcousticFeatures(clip, "hello world");
      // AudioContext is not available in jsdom, so tonal_variability_hz should be 0
      expect(features.tonal_variability_hz).toBe(0);
    });
  });

  describe("isVoiceSupported", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("returns false when navigator.mediaDevices is undefined", () => {
      const originalMediaDevices = navigator.mediaDevices;
      Object.defineProperty(navigator, "mediaDevices", {
        value: undefined,
        configurable: true,
      });

      expect(isVoiceSupported()).toBe(false);

      Object.defineProperty(navigator, "mediaDevices", {
        value: originalMediaDevices,
        configurable: true,
      });
    });

    it("returns false when MediaRecorder is undefined", () => {
      const originalMediaRecorder = globalThis.MediaRecorder;
      // deliberately removing for test
      (globalThis as { MediaRecorder?: unknown }).MediaRecorder = undefined;

      expect(isVoiceSupported()).toBe(false);

      globalThis.MediaRecorder = originalMediaRecorder;
    });
  });
});
