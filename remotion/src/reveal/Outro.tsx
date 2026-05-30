import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { REVEAL } from "./theme";
import { serif, serifItalic, sans } from "../fonts";

export const RevealOutro: React.FC = () => {
  const f = useCurrentFrame();
  const titleP = spring({ frame: f, fps: 30, config: { damping: 200 } });
  const lineP = interpolate(f, [22, 70], [0, 1], { extrapolateRight: "clamp" });
  const subP = interpolate(f, [50, 90], [0, 1], { extrapolateRight: "clamp" });
  const urlP = interpolate(f, [80, 115], [0, 1], { extrapolateRight: "clamp" });

  const glow = interpolate(Math.sin(f / 14), [-1, 1], [0.6, 1]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      {/* warm halo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 45% at 50% 50%, ${REVEAL.accent}cc 0%, transparent 70%)`,
          opacity: glow,
        }}
      />
      {/* wordmark — matches site: lowercase serif, italic 'mind' */}
      <div
        style={{
          position: "relative",
          opacity: titleP,
          transform: `translateY(${interpolate(titleP, [0, 1], [24, 0])}px)`,
          fontFamily: serif,
          fontSize: 240,
          color: REVEAL.ink,
          lineHeight: 1,
          letterSpacing: -6,
        }}
      >
        nexo<span style={{ fontFamily: serifItalic }}>mind</span>
      </div>
      <div
        style={{
          position: "relative",
          width: lineP * 220,
          height: 1,
          background: REVEAL.ink,
          opacity: 0.4,
          margin: "44px 0 32px",
        }}
      />
      <div
        style={{
          position: "relative",
          opacity: subP,
          fontFamily: serifItalic,
          fontSize: 46,
          color: REVEAL.inkSoft,
        }}
      >
        a quieter way to think.
      </div>
      <div
        style={{
          position: "relative",
          opacity: urlP,
          marginTop: 80,
          fontFamily: sans,
          fontSize: 20,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: REVEAL.muted,
          fontWeight: 500,
        }}
      >
        nexomind.ai
      </div>
    </AbsoluteFill>
  );
};
