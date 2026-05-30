import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { SocialVideo } from "./SocialVideo";
import { RevealVideo } from "./reveal/RevealVideo";

export const RemotionRoot = () => (
  <>
    <Composition id="main" component={MainVideo} durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="social" component={SocialVideo} durationInFrames={660} fps={30} width={1080} height={1080} />
    {/* Linear/Vercel-style reveal — kinetic intro + 4 screens + outro. ~40s */}
    <Composition id="reveal" component={RevealVideo} durationInFrames={1051} fps={30} width={1920} height={1080} />
  </>
);
