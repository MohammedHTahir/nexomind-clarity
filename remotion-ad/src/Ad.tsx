import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Background } from "./components/Background";
import { Intro } from "./scenes/Intro";
import { Chapter } from "./scenes/Chapter";
import { PullQuote } from "./scenes/PullQuote";
import { Outro } from "./scenes/Outro";

type Props = { layout: "landscape" | "square" | "vertical" };

const FPS = 30;
const s = (sec: number) => sec * FPS;

const clipWrite = { startFrom: s(36), endAt: s(45.5), zoomFrom: 1.02, zoomTo: 1.08, panX: -10, panY: 0 };
const clipListen = { startFrom: s(50), endAt: s(59.5), zoomFrom: 1.0, zoomTo: 1.05, panX: 0, panY: -8 };
const clipMindMap = { startFrom: s(67), endAt: s(78), zoomFrom: 1.0, zoomTo: 1.07, panX: 0, panY: -10 };
const clipInsights = { startFrom: s(85), endAt: s(94.5), zoomFrom: 1.02, zoomTo: 1.06, panX: 0, panY: 0 };

export const Ad: React.FC<Props> = ({ layout }) => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={180}><Intro /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={280}>
          <Chapter number="01" label="Reflect" title="Begin anywhere." italicWord="anywhere"
            body="Write or speak whatever's on your mind. NexoMind listens — and turns it into clarity in seconds."
            clip={clipWrite} layout={layout} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={130}><PullQuote text="A reflection in seconds." italic="seconds" /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={280}>
          <Chapter number="02" label="Listen" title="Find the thought beneath the noise." italicWord="beneath"
            body="Every entry returns an emotional read, a clarity score, and one quiet reflection — never advice, never noise."
            clip={clipListen} layout={layout} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={130}><PullQuote text="See what your mind is actually doing." italic="actually" /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={320}>
          <Chapter number="03" label="Mind Map of You" title="A living map of your mind." italicWord="living"
            body="Themes, emotions, triggers — and the threads between them. Built silently from every reflection."
            clip={clipMindMap} layout={layout} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={130}><PullQuote text="It gets clearer over time." italic="clearer" /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={270}>
          <Chapter number="04" label="Pattern Interrupts" title="Caught — before the spiral." italicWord="before"
            body="NexoMind learns when your loops open and quietly nudges you, before they grip."
            clip={clipInsights} layout={layout} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={224}><Outro /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
