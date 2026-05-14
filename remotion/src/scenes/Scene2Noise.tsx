import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../theme";
import { serif, sans } from "../fonts";

const fragments = [
  { t: "did I sound weird in that meeting?", x: 8, y: 18, rot: -4, d: 0, size: 28 },
  { t: "should have replied sooner", x: 58, y: 12, rot: 3, d: 6, size: 26 },
  { t: "rent is due friday", x: 70, y: 38, rot: -2, d: 12, size: 30 },
  { t: "am I doing enough?", x: 12, y: 48, rot: 2, d: 18, size: 32 },
  { t: "what did she mean by that", x: 48, y: 62, rot: -3, d: 24, size: 28 },
  { t: "tomorrow. start tomorrow.", x: 22, y: 76, rot: 4, d: 30, size: 26 },
  { t: "why can't I just sleep", x: 64, y: 80, rot: -2, d: 36, size: 30 },
  { t: "everyone else seems fine", x: 6, y: 32, rot: 5, d: 42, size: 26 },
];

export const Scene2Noise: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {fragments.map((f, i) => {
        const p = spring({ frame: frame - f.d, fps: 30, config: { damping: 18, stiffness: 120 } });
        const drift = Math.sin((frame + i * 20) / 40) * 6;
        const fade = interpolate(frame, [120, 165], [1, 0.3], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${f.x}%`,
              top: `${f.y + drift / 4}%`,
              opacity: p * fade,
              transform: `rotate(${f.rot}deg) scale(${0.8 + p * 0.2})`,
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: f.size * 1.6,
              color: COLORS.inkSoft,
              maxWidth: 480,
            }}
          >
            "{f.t}"
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(frame, [130, 170], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: sans,
          fontSize: 26,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        — the noise inside —
      </div>
    </AbsoluteFill>
  );
};
