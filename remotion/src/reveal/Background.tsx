import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { REVEAL } from "./theme";

export const RevealBackground: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const bx = 50 + Math.sin(t / 7) * 4;
  const by = 50 + Math.cos(t / 9) * 3;
  const pulse = interpolate(Math.sin(t / 4), [-1, 1], [0.55, 0.85]);
  return (
    <AbsoluteFill style={{ background: REVEAL.bg }}>
      {/* warm radial light */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 55% at ${bx}% ${by}%, ${REVEAL.bgDeep} 0%, transparent 70%),
                       radial-gradient(90% 70% at 50% 115%, ${REVEAL.accent}88 0%, transparent 75%)`,
          opacity: pulse,
        }}
      />
      {/* subtle dot grid in ink */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(26,26,26,0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.4,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      {/* paper grain edges */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(26,26,26,0.06) 0%, transparent 18%, transparent 82%, rgba(26,26,26,0.08) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
