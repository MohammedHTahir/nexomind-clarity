import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { RevealBackground } from "./Background";
import { KineticIntro } from "./KineticIntro";
import { ScreenFloat } from "./ScreenFloat";
import { RevealOutro } from "./Outro";

const FEATURES = [
  {
    src: "shots/dashboard.png",
    kicker: "01 · Reflect",
    title: "Your daily",
    italicTail: "check-in.",
    body: "Open NexoMind and you land on Reflect — today's prompt, your context signals from sleep and calendar, and the gentlest way back into your own head.",
    side: "right" as const,
  },
  {
    src: "shots/journal.png",
    kicker: "02 · Write",
    title: "Type or",
    italicTail: "speak it out.",
    body: "Write an entry, or tap the mic to voice-dump. NexoMind transcribes it and returns a quiet reflection — emotion, theme, and one grounded takeaway.",
    side: "left" as const,
  },
  {
    src: "shots/insights.png",
    kicker: "03 · Insights",
    title: "See the",
    italicTail: "patterns.",
    body: "Clarity scores, emotional trends, and the loops your mind keeps reopening — surfaced over days, weeks and months, never as a streak or a score to chase.",
    side: "right" as const,
  },
  {
    src: "shots/mindmap.png",
    kicker: "04 · Mind Map",
    title: "A living map of",
    italicTail: "your mind.",
    body: "Every entry quietly links themes, people and triggers into a personal graph. Tap any node to see what fed it and how it's shifted over time.",
    side: "left" as const,
  },
  {
    src: "shots/inbox.png",
    kicker: "05 · Sunday Letter",
    title: "A letter from",
    italicTail: "your week.",
    body: "Each Sunday a private editorial lands in your Inbox — what shifted, what looped, and one quiet thing to watch for in the week ahead.",
    side: "right" as const,
  },
  {
    src: "shots/therapist.png",
    kicker: "06 · Therapist Bridge",
    title: "Share the",
    italicTail: "signal, not the noise.",
    body: "Generate a clean, professional brief of your week to bring to therapy. You choose what's included — your words stay yours.",
    side: "left" as const,
  },
  {
    src: "shots/settings.png",
    kicker: "07 · Private by design",
    title: "Encrypted.",
    italicTail: "Yours alone.",
    body: "Connect a wearable, switch on end-to-end encryption, set pattern interrupts, or run analysis on-device with Premium+. Privacy controls live in Settings.",
    side: "right" as const,
  },
];

const SCREEN = 145;
const TRANS = 16;

export const FeatureTour: React.FC = () => {
  return (
    <AbsoluteFill>
      <RevealBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={335}>
          <KineticIntro />
        </TransitionSeries.Sequence>
        {FEATURES.map((f, i) => (
          <>
            <TransitionSeries.Transition
              key={`t-${i}`}
              presentation={fade()}
              timing={linearTiming({ durationInFrames: TRANS })}
            />
            <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={SCREEN}>
              <ScreenFloat {...f} />
            </TransitionSeries.Sequence>
          </>
        ))}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 22 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <RevealOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
