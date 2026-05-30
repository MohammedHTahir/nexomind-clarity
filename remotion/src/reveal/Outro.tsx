import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { REVEAL } from "./theme";
import { serif, serifItalic, sans } from "../fonts";

export const RevealOutro: React.FC = () => {
  const f = useCurrentFrame();
  const titleP = spring({ frame: f, fps: 30, config: { damping: 200 } });
  const lineP = interpolate(f, [22, 70], [0, 1], { extrapolateRight: "clamp" });
  const subP = interpolate(f, [50, 90], [0, 1], { extrapolateRight: "clamp" });
  const urlP = interpolate(f, [80, 115], [0, 1], { extrapolateRight: "clamp" });

  const glow = interpolate(Math.sin(f / 14), [-1, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      {/* central halo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 40% at 50% 50%, ${REVEAL.blue}55 0%, transparent 70%)`,
          opacity: glow,
        }}
      />
      <div
        style={{
          position: "relative",
          opacity: titleP,
          transform: `translateY(${interpolate(titleP, [0, 1], [24, 0])}px)`,
          fontFamily: serif,
          fontSize: 220,
          color: REVEAL.ink,
          lineHeight: 1,
          letterSpacing: -4,
          textShadow: `0 0 80px ${REVEAL.blue}80`,
        }}
      >
        Nexo<span style={{ fontFamily: serifItalic, color: REVEAL.blue }}>Mind</span>
      </div>
      <div
        style={{
          position: "relative",
          width: lineP * 260,
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${REVEAL.blue}, transparent)`,
          margin: "40px 0 32px",
        }}
      />
      <div
        style={{
          position: "relative",
          opacity: subP,
          fontFamily: serifItalic,
          fontSize: 44,
          color: REVEAL.muted,
        }}
      >
        A quieter way to think.
      </div>
      <div
        style={{
          position: "relative",
          opacity: urlP,
          marginTop: 70,
          fontFamily: sans,
          fontSize: 22,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: REVEAL.blue,
        }}
      >
        nexomind.ai
      </div>
    </AbsoluteFill>
  );
};
