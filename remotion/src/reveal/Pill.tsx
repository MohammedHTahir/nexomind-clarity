import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { REVEAL } from "./theme";
import { sans } from "../fonts";

export const Pill: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 18, stiffness: 160 } });
  const glow = interpolate(Math.sin((f - delay) / 12), [-1, 1], [0.5, 1]);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "10px 26px",
        borderRadius: 999,
        border: `1px solid ${REVEAL.blue}`,
        background: `${REVEAL.blue}14`,
        color: REVEAL.ink,
        fontFamily: sans,
        fontSize: 36,
        fontWeight: 500,
        letterSpacing: 0.2,
        boxShadow: `0 0 ${30 * glow}px ${REVEAL.blue}${Math.round(glow * 90)
          .toString(16)
          .padStart(2, "0")}, inset 0 0 20px ${REVEAL.blue}22`,
        transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`,
        opacity: p,
        margin: "0 6px",
      }}
    >
      {text}
    </span>
  );
};
