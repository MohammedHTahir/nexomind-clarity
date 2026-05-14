import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../theme";
import { serif, sans } from "../fonts";

export const Scene5Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const titleP = spring({ frame, fps: 30, config: { damping: 200 } });
  const subP = interpolate(frame, [40, 80], [0, 1], { extrapolateRight: "clamp" });
  const urlP = interpolate(frame, [70, 110], [0, 1], { extrapolateRight: "clamp" });
  const lineP = interpolate(frame, [20, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div
        style={{
          opacity: titleP,
          transform: `translateY(${interpolate(titleP, [0, 1], [30, 0])}px)`,
          fontFamily: serif,
          fontSize: 240,
          color: COLORS.ink,
          lineHeight: 1,
          letterSpacing: -4,
        }}
      >
        Nexo<span style={{ fontStyle: "italic", color: COLORS.accent }}>Mind</span>
      </div>
      <div
        style={{
          width: lineP * 280,
          height: 1.5,
          background: COLORS.ink,
          margin: "44px 0 36px",
        }}
      />
      <div
        style={{
          opacity: subP,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 56,
          color: COLORS.inkSoft,
          maxWidth: 1300,
        }}
      >
        Small clarity, every day.
      </div>
      <div
        style={{
          opacity: urlP,
          marginTop: 80,
          fontFamily: sans,
          fontSize: 30,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        nexomind.ai
      </div>
    </AbsoluteFill>
  );
};
