import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../theme";
import { serif, sans } from "../fonts";

const userLines = [
  "I keep replaying that conversation",
  "from yesterday in my head…",
];
const aiLines = [
  "It sounds like you're",
  "looking for closure that the",
  "moment didn't give you.",
];

const Typed: React.FC<{ text: string; start: number; speed?: number; size: number; family: string; color: string; italic?: boolean }> = ({ text, start, speed = 1.4, size, family, color, italic }) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - start) * speed));
  const visible = text.slice(0, chars);
  const showCursor = frame > start && chars < text.length;
  return (
    <div style={{ fontFamily: family, fontSize: size, color, lineHeight: 1.35, fontStyle: italic ? "italic" : "normal" }}>
      {visible}
      {showCursor && <span style={{ opacity: (frame % 20) < 10 ? 1 : 0 }}>▍</span>}
    </div>
  );
};

export const Scene3Reflect: React.FC = () => {
  const frame = useCurrentFrame();
  const labelLP = spring({ frame: frame - 0, fps: 30, config: { damping: 200 } });
  const labelRP = spring({ frame: frame - 80, fps: 30, config: { damping: 200 } });
  const dividerP = interpolate(frame, [10, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ flexDirection: "row", padding: 120, gap: 80 }}>
      {/* left: user */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", opacity: labelLP }}>
        <div style={{ fontFamily: sans, fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: COLORS.muted, marginBottom: 40 }}>
          You
        </div>
        <Typed text={userLines[0]} start={10} size={56} family={serif} color={COLORS.ink} italic />
        <Typed text={userLines[1]} start={50} size={56} family={serif} color={COLORS.ink} italic />
      </div>
      {/* divider */}
      <div style={{ width: 1, background: COLORS.divider, transform: `scaleY(${dividerP})`, transformOrigin: "top" }} />
      {/* right: nexomind */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", opacity: labelRP }}>
        <div style={{ fontFamily: sans, fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: COLORS.accent, marginBottom: 40 }}>
          NexoMind
        </div>
        <Typed text={aiLines[0]} start={90} size={48} family={serif} color={COLORS.ink} />
        <Typed text={aiLines[1]} start={120} size={48} family={serif} color={COLORS.ink} />
        <Typed text={aiLines[2]} start={160} size={48} family={serif} color={COLORS.ink} />
      </div>
    </AbsoluteFill>
  );
};
