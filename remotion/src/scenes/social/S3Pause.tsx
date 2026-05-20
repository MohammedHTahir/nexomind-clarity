import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../../theme";
import { serif, sans } from "../../fonts";

export const S3Pause: React.FC = () => {
  const frame = useCurrentFrame();
  const p1 = spring({ frame: frame - 6, fps: 30, config: { damping: 200 } });
  const p2 = spring({ frame: frame - 38, fps: 30, config: { damping: 200 } });
  // gentle breathing dot
  const dot = 1 + Math.sin(frame / 14) * 0.18;
  const dotOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 90px" }}>
      <div
        style={{
          opacity: dotOpacity,
          width: 28,
          height: 28,
          borderRadius: 999,
          background: COLORS.accent,
          transform: `scale(${dot})`,
          marginBottom: 56,
          boxShadow: `0 0 60px ${COLORS.accent}55`,
        }}
      />
      <div
        style={{
          opacity: p1,
          transform: `translateY(${interpolate(p1, [0, 1], [20, 0])}px)`,
          fontFamily: serif,
          fontSize: 88,
          color: COLORS.ink,
          lineHeight: 1.1,
          maxWidth: 880,
        }}
      >
        What if you could just <span style={{ fontStyle: "italic", color: COLORS.accent }}>pause?</span>
      </div>
      <div
        style={{
          opacity: p2,
          marginTop: 36,
          fontFamily: sans,
          fontSize: 24,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        one breath. one thought. out loud.
      </div>
    </AbsoluteFill>
  );
};
