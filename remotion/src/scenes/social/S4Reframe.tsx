import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../../theme";
import { serif, sans } from "../../fonts";

const Typed: React.FC<{
  text: string;
  start: number;
  speed?: number;
  size: number;
  family: string;
  color: string;
  italic?: boolean;
}> = ({ text, start, speed = 1.6, size, family, color, italic }) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - start) * speed));
  const visible = text.slice(0, chars);
  const showCursor = frame > start && chars < text.length;
  return (
    <div
      style={{
        fontFamily: family,
        fontSize: size,
        color,
        lineHeight: 1.3,
        fontStyle: italic ? "italic" : "normal",
      }}
    >
      {visible}
      {showCursor && <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▍</span>}
    </div>
  );
};

export const S4Reframe: React.FC = () => {
  const frame = useCurrentFrame();
  const cardP = spring({ frame: frame - 8, fps: 30, config: { damping: 18, stiffness: 110 } });
  const userP = interpolate(frame, [4, 24], [0, 1], { extrapolateRight: "clamp" });
  const aiP = interpolate(frame, [70, 95], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 70px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          background: COLORS.card,
          borderRadius: 24,
          padding: "56px 60px",
          boxShadow: "0 30px 80px rgba(20,20,20,0.12), 0 4px 12px rgba(20,20,20,0.06)",
          border: `1px solid ${COLORS.divider}`,
          opacity: cardP,
          transform: `translateY(${interpolate(cardP, [0, 1], [30, 0])}px) scale(${0.94 + cardP * 0.06})`,
        }}
      >
        {/* user */}
        <div style={{ opacity: userP, marginBottom: 40 }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.muted,
              marginBottom: 14,
            }}
          >
            You
          </div>
          <Typed
            text="I can't stop thinking I messed everything up."
            start={20}
            size={40}
            family={serif}
            color={COLORS.ink}
            italic
          />
        </div>

        {/* divider */}
        <div style={{ height: 1, background: COLORS.divider, margin: "8px 0 28px" }} />

        {/* ai */}
        <div style={{ opacity: aiP }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.accent,
              marginBottom: 14,
            }}
          >
            NexoMind
          </div>
          <Typed
            text="One thought ≠ the truth."
            start={92}
            size={40}
            family={serif}
            color={COLORS.ink}
          />
          <div style={{ height: 14 }} />
          <Typed
            text="What's one thing that actually went okay today?"
            start={130}
            size={36}
            family={serif}
            color={COLORS.inkSoft}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
