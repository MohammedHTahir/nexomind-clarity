import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Background } from "./components/Background";
import { S1Hook } from "./scenes/social/S1Hook";
import { S2Spiral } from "./scenes/social/S2Spiral";
import { S3Pause } from "./scenes/social/S3Pause";
import { S4Reframe } from "./scenes/social/S4Reframe";
import { S5Brand } from "./scenes/social/S5Brand";

// 22s @ 30fps = 660 frames. Built for X feed (1:1 square).
// Sequence durations include the trailing transition window.
export const SocialVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <S1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={170}>
          <S2Spiral />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 22 })} />
        <TransitionSeries.Sequence durationInFrames={120}>
          <S3Pause />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={180}>
          <S4Reframe />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />
        <TransitionSeries.Sequence durationInFrames={150}>
          <S5Brand />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
