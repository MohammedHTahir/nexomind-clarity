import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 30;
  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      <div
        style={{
          position: "absolute",
          inset: -100,
          background: `radial-gradient(circle at ${50 + drift / 4}% ${40 + drift / 6}%, ${COLORS.creamDeep} 0%, ${COLORS.cream} 60%)`,
        }}
      />
      {/* paper grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};
