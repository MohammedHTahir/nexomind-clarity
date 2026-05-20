import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../../theme";
import { serif, sans } from "../../fonts";

const fragments = [
  { t: "did I send that email right?", x: 8, y: 14, rot: -4, d: 0, size: 26 },
  { t: "everyone is ahead of me", x: 56, y: 10, rot: 3, d: 6, size: 28 },
  { t: "should have said no", x: 12, y: 38, rot: -2, d: 12, size: 26 },
  { t: "what if I fail?", x: 60, y: 36, rot: 2, d: 18, size: 30 },
  { t: "why am I still up?", x: 18, y: 62, rot: 4, d: 24, size: 28 },
  { t: "tomorrow. fix it tomorrow.", x: 54, y: 64, rot: -3, d: 30, size: 26 },
  { t: "am I the problem?", x: 24, y: 84, rot: 2, d: 36, size: 30 },
];

export const S2Spiral: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {fragments.map((f, i) => {
        const p = spring({ frame: frame - f.d, fps: 30, config: { damping: 18, stiffness: 120 } });
        const drift = Math.sin((frame + i * 18) / 38) * 5;
        const fade = interpolate(frame, [110, 150], [1, 0.25], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${f.x}%`,
              top: `${f.y + drift / 5}%`,
              opacity: p * fade,
              transform: `rotate(${f.rot}deg) scale(${0.8 + p * 0.2})`,
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: f.size * 1.5,
              color: COLORS.inkSoft,
              maxWidth: 380,
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
          opacity: interpolate(frame, [120, 155], [0, 1], { extrapolateRight: "clamp" }),
          fontFamily: sans,
          fontSize: 22,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        — the spiral —
      </div>
    </AbsoluteFill>
  );
};
