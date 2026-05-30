import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { REVEAL } from "./theme";
import { serifItalic } from "../fonts";

// Soft accent block highlight (matches website hero italic phrase treatment)
export const Pill: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - delay, fps, config: { damping: 18, stiffness: 160 } });
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 28px 10px",
        borderRadius: 14,
        background: REVEAL.accent,
        color: REVEAL.ink,
        fontFamily: serifItalic,
        letterSpacing: -1,
        transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        opacity: p,
        margin: "0 6px",
        boxShadow: `0 2px 0 ${REVEAL.accentDeep}`,
      }}
    >
      {text}
    </span>
  );
};
