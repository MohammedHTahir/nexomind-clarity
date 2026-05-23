import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { serif, serifItalic, sans } from "../fonts";

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kicker = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const lineA = spring({ frame: f - 14, fps, config: { damping: 200 } });
  const lineB = spring({ frame: f - 38, fps, config: { damping: 200 } });
  const lineC = spring({ frame: f - 62, fps, config: { damping: 200 } });
  const exit = interpolate(f, [150, 180], [0, -30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOp = interpolate(f, [150, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 80px",
        transform: `translateY(${exit}px)`,
        opacity: exitOp,
      }}
    >
      <div style={{ opacity: kicker, fontFamily: sans, fontSize: 18, letterSpacing: 6, textTransform: "uppercase", color: COLORS.faint, marginBottom: 40 }}>
        ( nexomind )
      </div>
      <div style={{ fontFamily: serif, fontSize: 112, color: COLORS.ink, lineHeight: 1.02, letterSpacing: -1, maxWidth: 1200, opacity: lineA, transform: `translateY(${interpolate(lineA, [0, 1], [24, 0])}px)` }}>
        For when your mind
      </div>
      <div style={{ fontFamily: serifItalic, fontSize: 112, color: COLORS.ink, lineHeight: 1.02, letterSpacing: -1, opacity: lineB, transform: `translateY(${interpolate(lineB, [0, 1], [24, 0])}px)` }}>
        won't slow down.
      </div>
      <div style={{ marginTop: 56, opacity: lineC, fontFamily: sans, fontSize: 20, letterSpacing: 0.4, color: COLORS.muted, maxWidth: 720, lineHeight: 1.5 }}>
        A quieter way to think — one thought at a time.
      </div>
    </AbsoluteFill>
  );
};
