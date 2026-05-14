import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Background } from "./components/Background";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Noise } from "./scenes/Scene2Noise";
import { Scene3Reflect } from "./scenes/Scene3Reflect";
import { Scene4Pattern } from "./scenes/Scene4Pattern";
import { Scene5Brand } from "./scenes/Scene5Brand";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 25 })} />
        <TransitionSeries.Sequence durationInFrames={195}>
          <Scene2Noise />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 25 })} />
        <TransitionSeries.Sequence durationInFrames={225}>
          <Scene3Reflect />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 25 })} />
        <TransitionSeries.Sequence durationInFrames={210}>
          <Scene4Pattern />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 25 })} />
        <TransitionSeries.Sequence durationInFrames={190}>
          <Scene5Brand />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
