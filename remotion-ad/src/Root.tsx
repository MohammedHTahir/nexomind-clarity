import { Composition } from "remotion";
import { Ad } from "./Ad";

export const RemotionRoot = () => (
  <>
    <Composition id="landscape" component={Ad} durationInFrames={1800} fps={30} width={1920} height={1080} defaultProps={{ layout: "landscape" as const }} />
    <Composition id="square" component={Ad} durationInFrames={1800} fps={30} width={1080} height={1080} defaultProps={{ layout: "square" as const }} />
    <Composition id="vertical" component={Ad} durationInFrames={1800} fps={30} width={1080} height={1920} defaultProps={{ layout: "vertical" as const }} />
  </>
);
