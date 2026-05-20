import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { SocialVideo } from "./SocialVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* X / social square: 22s @ 30fps, 1080x1080 */}
    <Composition
      id="social"
      component={SocialVideo}
      durationInFrames={660}
      fps={30}
      width={1080}
      height={1080}
    />
  </>
);
