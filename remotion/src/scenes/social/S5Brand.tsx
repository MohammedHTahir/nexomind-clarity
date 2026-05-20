import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../../theme";
import { serif, sans } from "../../fonts";

export const S5Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const titleP = spring({ frame, fps: 30, config: { damping: 200 } });
  const lineP = interpolate(frame, [16, 70], [0, 1], { extrapolateRight: "clamp" });
  const subP = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const ctaP = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  const urlP = interpolate(frame, [80, 110], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 70px" }}>
      <div
        style={{
          opacity: titleP,
          transform: `translateY(${interpolate(titleP, [0, 1], [24, 0])}px)`,
          fontFamily: serif,
          fontSize: 170,
          color: COLORS.ink,
          lineHeight: 1,
          letterSpacing: -3,
        }}
      >
        Nexo<span style={{ fontStyle: "italic", color: COLORS.accent }}>Mind</span>
      </div>
      <div
        style={{
          width: lineP * 220,
          height: 1.5,
          background: COLORS.ink,
          margin: "32px 0 28px",
        }}
      />
      <div
        style={{
          opacity: subP,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 44,
          color: COLORS.inkSoft,
          maxWidth: 900,
        }}
      >
        Small clarity, every day.
      </div>
      <div
        style={{
          opacity: ctaP,
          marginTop: 48,
          fontFamily: sans,
          fontSize: 20,
          color: COLORS.muted,
          maxWidth: 720,
          lineHeight: 1.5,
        }}
      >
        A quiet space for your loudest thoughts.
      </div>
      <div
        style={{
          opacity: urlP,
          marginTop: 56,
          padding: "16px 32px",
          border: `1.5px solid ${COLORS.ink}`,
          borderRadius: 999,
          fontFamily: sans,
          fontSize: 22,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: COLORS.ink,
        }}
      >
        nexomind.ai
      </div>
    </AbsoluteFill>
  );
};
