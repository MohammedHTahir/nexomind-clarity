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
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at ${bx}% ${by}%, ${REVEAL.blue}33 0%, transparent 65%),
                       radial-gradient(90% 70% at 50% 120%, ${REVEAL.blueDeep}40 0%, transparent 70%)`,
          opacity: pulse,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.35,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
