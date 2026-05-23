import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { serif, serifItalic, sans } from "../fonts";

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 200 } });
  const b = spring({ frame: f - 22, fps, config: { damping: 200 } });
  const c = spring({ frame: f - 50, fps, config: { damping: 200 } });
  const d = spring({ frame: f - 75, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 120px" }}>
      <div style={{ opacity: a, fontFamily: sans, fontSize: 16, letterSpacing: 6, textTransform: "uppercase", color: COLORS.faint, marginBottom: 38 }}>
        ( begin )
      </div>
      <div style={{ opacity: b, transform: `translateY(${interpolate(b, [0, 1], [22, 0])}px)`, fontFamily: serif, fontSize: 132, color: COLORS.ink, letterSpacing: -1.5, lineHeight: 1 }}>
        nexo<span style={{ fontFamily: serifItalic, color: COLORS.muted }}>mind</span>
      </div>
      <div style={{ opacity: c, marginTop: 38, fontFamily: serif, fontSize: 38, color: COLORS.muted, lineHeight: 1.3, maxWidth: 1000 }}>
        Quiet your mind.
      </div>
      <div style={{ opacity: d, marginTop: 60, fontFamily: sans, fontSize: 22, color: COLORS.ink, letterSpacing: 4 }}>
        nexomind.ai
      </div>
    </AbsoluteFill>
  );
};
