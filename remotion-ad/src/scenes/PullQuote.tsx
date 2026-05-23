import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { serif, serifItalic, sans } from "../fonts";

type Props = { text: string; italic?: string; attribution?: string };

export const PullQuote: React.FC<Props> = ({ text, italic, attribution }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dot = spring({ frame: f, fps, config: { damping: 200 } });
  const t1 = spring({ frame: f - 14, fps, config: { damping: 200 } });
  const t2 = spring({ frame: f - 42, fps, config: { damping: 200 } });

  const node = italic && text.includes(italic) ? (
    <>
      {text.split(italic)[0]}
      <span style={{ fontFamily: serifItalic, color: COLORS.accent }}>{italic}</span>
      {text.split(italic)[1]}
    </>
  ) : text;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 120px" }}>
      <div style={{ width: 14, height: 14, borderRadius: 999, background: COLORS.accent, marginBottom: 48, opacity: dot, transform: `scale(${1 + Math.sin(f / 14) * 0.18})`, boxShadow: `0 0 40px ${COLORS.accent}44` }} />
      <div style={{ opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [22, 0])}px)`, fontFamily: serif, fontSize: 92, color: COLORS.ink, lineHeight: 1.08, letterSpacing: -0.6, maxWidth: 1400 }}>
        {node}
      </div>
      {attribution ? (
        <div style={{ opacity: t2, marginTop: 42, fontFamily: sans, fontSize: 16, letterSpacing: 5, textTransform: "uppercase", color: COLORS.faint }}>
          {attribution}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
