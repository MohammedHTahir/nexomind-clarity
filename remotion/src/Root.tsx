import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { SocialVideo } from "./SocialVideo";
import { RevealVideo } from "./reveal/RevealVideo";
import { FeatureTour } from "./reveal/FeatureTour";

export const RemotionRoot = () => (
  <>
    <Composition id="main" component={MainVideo} durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="social" component={SocialVideo} durationInFrames={660} fps={30} width={1080} height={1080} />
    <Composition id="reveal" component={RevealVideo} durationInFrames={1051} fps={30} width={1920} height={1080} />
    {/* Feature tour with live screenshots — 7 features. */}
    <Composition id="feature-tour" component={FeatureTour} durationInFrames={1366} fps={30} width={1920} height={1080} />
  </>
);
