import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { serif, sans } from "../fonts";

const Word: React.FC<{ text: string; delay: number; size: number; italic?: boolean }> = ({ text, delay, size, italic }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const blur = interpolate(p, [0, 1], [14, 0]);
  const y = interpolate(p, [0, 1], [24, 0]);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: p,
        transform: `translateY(${y}px)`,
        filter: `blur(${blur}px)`,
        fontFamily: serif,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        color: COLORS.ink,
        lineHeight: 1.05,
        marginRight: size * 0.22,
      }}
    >
      {text}
    </span>
  );
};

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const lineP = spring({ frame: frame - 50, fps: 30, config: { damping: 200 } });
  const tagP = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ padding: "0 180px", justifyContent: "center" }}>
      <div style={{ opacity: tagP, fontFamily: sans, fontSize: 22, letterSpacing: 6, color: COLORS.muted, textTransform: "uppercase", marginBottom: 40 }}>
        NexoMind
      </div>
      <div style={{ maxWidth: 1500 }}>
        <Word text="When" delay={0} size={170} />
        <Word text="your" delay={6} size={170} />
        <Word text="mind" delay={12} size={170} />
        <Word text="won't" delay={18} size={170} italic />
        <Word text="slow" delay={24} size={170} italic />
        <Word text="down." delay={30} size={170} italic />
      </div>
      <div
        style={{
          marginTop: 60,
          height: 2,
          background: COLORS.ink,
          width: `${lineP * 30}%`,
          transformOrigin: "left",
        }}
      />
    </AbsoluteFill>
  );
};
