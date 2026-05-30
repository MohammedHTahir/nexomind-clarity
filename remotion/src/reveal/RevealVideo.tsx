import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { RevealBackground } from "./Background";
import { KineticIntro } from "./KineticIntro";
import { ScreenFloat } from "./ScreenFloat";
import { RevealOutro } from "./Outro";

export const RevealVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <RevealBackground />
      <TransitionSeries>
        {/* 0 - ~12s : kinetic intro (335f) */}
        <TransitionSeries.Sequence durationInFrames={335}>
          <KineticIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />

        {/* Screen 1 — Journal — 165f */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <ScreenFloat
            src="screen-journal.jpg"
            kicker="01 · Write"
            title="Begin"
            italicTail="anywhere."
            body="Type or speak. NexoMind turns the noise into a quiet, clear reflection in seconds."
            side="right"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />

        {/* Screen 2 — Mind Map — 165f */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <ScreenFloat
            src="screen-mindmap.jpg"
            kicker="02 · Connect"
            title="A living map of"
            italicTail="your mind."
            body="Themes, emotions and the threads between them — built silently from every entry."
            side="left"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />

        {/* Screen 3 — Insights — 165f */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <ScreenFloat
            src="screen-insights.jpg"
            kicker="03 · See"
            title="The pattern"
            italicTail="before the spiral."
            body="Track clarity over time and catch the loops your mind keeps opening — before they grip."
            side="right"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />

        {/* Screen 4 — Sunday Letter — 165f */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <ScreenFloat
            src="screen-letter.jpg"
            kicker="04 · Reflect"
            title="A letter from"
            italicTail="your week."
            body="Every Sunday, a quiet editorial of where your mind has been — and where it's heading."
            side="left"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 22 })} />

        {/* Outro — 150f */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <RevealOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
