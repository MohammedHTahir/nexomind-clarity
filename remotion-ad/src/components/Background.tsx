import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const x1 = 20 + Math.sin(t / 6) * 6;
  const y1 = 25 + Math.cos(t / 7) * 5;
  const x2 = 78 + Math.cos(t / 9) * 6;
  const y2 = 70 + Math.sin(t / 8) * 4;
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at ${x1}% ${y1}%, ${COLORS.lavender}55 0%, transparent 70%),
                       radial-gradient(55% 50% at ${x2}% ${y2}%, ${COLORS.warm}55 0%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: 0.85,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          opacity: 0.4,
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};
