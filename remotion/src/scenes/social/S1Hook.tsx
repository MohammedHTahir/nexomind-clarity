import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../../theme";
import { serif, sans } from "../../fonts";

const Word: React.FC<{ text: string; delay: number; size: number; italic?: boolean }> = ({
  text,
  delay,
  size,
  italic,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const blur = interpolate(p, [0, 1], [12, 0]);
  const y = interpolate(p, [0, 1], [22, 0]);
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
        marginRight: size * 0.2,
      }}
    >
      {text}
    </span>
  );
};

export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const tagP = interpolate(frame, [8, 30], [0, 1], { extrapolateRight: "clamp" });
  const lineP = spring({ frame: frame - 50, fps: 30, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ padding: "0 90px", justifyContent: "center" }}>
      <div
        style={{
          opacity: tagP,
          fontFamily: sans,
          fontSize: 18,
          letterSpacing: 6,
          color: COLORS.muted,
          textTransform: "uppercase",
          marginBottom: 32,
        }}
      >
        NexoMind
      </div>
      <div style={{ maxWidth: 900 }}>
        <Word text="Your" delay={0} size={150} />
        <Word text="brain" delay={6} size={150} />
        <Word text="at" delay={12} size={150} />
        <Word text="1AM." delay={18} size={150} italic />
      </div>
      <div
        style={{
          marginTop: 44,
          height: 2,
          background: COLORS.ink,
          width: `${lineP * 30}%`,
          transformOrigin: "left",
        }}
      />
    </AbsoluteFill>
  );
};
