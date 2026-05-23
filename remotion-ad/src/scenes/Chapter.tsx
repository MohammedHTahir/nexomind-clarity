import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import { serif, serifItalic, sans } from "../fonts";
import { BrowserFrame } from "../components/BrowserFrame";

type Props = {
  number: string;
  label: string;
  title: string;
  italicWord?: string;
  body: string;
  clip: { startFrom: number; endAt: number; zoomFrom?: number; zoomTo?: number; panX?: number; panY?: number };
  layout?: "landscape" | "square" | "vertical";
};

export const Chapter: React.FC<Props> = ({ number, label, title, italicWord, body, clip, layout = "landscape" }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const num = spring({ frame: f - 2, fps, config: { damping: 200 } });
  const lab = spring({ frame: f - 10, fps, config: { damping: 200 } });
  const tit = spring({ frame: f - 22, fps, config: { damping: 200 } });
  const bod = spring({ frame: f - 38, fps, config: { damping: 200 } });
  const frameIn = spring({ frame: f - 50, fps, config: { damping: 200 } });

  const titleNode = italicWord ? (
    <>
      {title.split(italicWord)[0]}
      <span style={{ fontFamily: serifItalic, color: COLORS.accent }}>{italicWord}</span>
      {title.split(italicWord)[1]}
    </>
  ) : title;

  if (layout === "landscape") {
    const frameW = Math.min(width * 0.55, 1080);
    return (
      <AbsoluteFill style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flex: "0 0 45%", padding: "0 80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: num, fontFamily: sans, fontSize: 14, letterSpacing: 4, color: COLORS.faint, marginBottom: 14 }}>{number}</div>
          <div style={{ opacity: lab, fontFamily: sans, fontSize: 14, letterSpacing: 6, textTransform: "uppercase", color: COLORS.muted, marginBottom: 28, transform: `translateY(${interpolate(lab, [0, 1], [16, 0])}px)` }}>
            ( {label} )
          </div>
          <div style={{ opacity: tit, fontFamily: serif, fontSize: 76, lineHeight: 1.02, color: COLORS.ink, letterSpacing: -0.6, transform: `translateY(${interpolate(tit, [0, 1], [22, 0])}px)`, marginBottom: 28 }}>
            {titleNode}
          </div>
          <div style={{ opacity: bod, fontFamily: sans, fontSize: 19, color: COLORS.muted, lineHeight: 1.55, maxWidth: 460 }}>{body}</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingRight: 80 }}>
          <div style={{ opacity: frameIn, transform: `translateY(${interpolate(frameIn, [0, 1], [40, 0])}px) scale(${interpolate(frameIn, [0, 1], [0.97, 1])})` }}>
            <BrowserFrame width={frameW} {...clip} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  if (layout === "vertical") {
    const frameW = width * 0.92;
    return (
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "120px 0" }}>
        <div style={{ textAlign: "center", padding: "0 60px", marginBottom: 50 }}>
          <div style={{ opacity: lab, fontFamily: sans, fontSize: 18, letterSpacing: 6, textTransform: "uppercase", color: COLORS.muted, marginBottom: 22 }}>
            {number} · {label}
          </div>
          <div style={{ opacity: tit, fontFamily: serif, fontSize: 84, lineHeight: 1.02, color: COLORS.ink, letterSpacing: -0.6, transform: `translateY(${interpolate(tit, [0, 1], [22, 0])}px)`, marginBottom: 22 }}>
            {titleNode}
          </div>
          <div style={{ opacity: bod, fontFamily: sans, fontSize: 22, color: COLORS.muted, lineHeight: 1.5, maxWidth: 820, margin: "0 auto" }}>{body}</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <div style={{ opacity: frameIn, transform: `translateY(${interpolate(frameIn, [0, 1], [40, 0])}px) scale(${interpolate(frameIn, [0, 1], [0.97, 1])})` }}>
            <BrowserFrame width={frameW} {...clip} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const frameW = width * 0.86;
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 0" }}>
      <div style={{ textAlign: "center", padding: "0 60px", marginBottom: 36 }}>
        <div style={{ opacity: lab, fontFamily: sans, fontSize: 14, letterSpacing: 5, textTransform: "uppercase", color: COLORS.muted, marginBottom: 16 }}>
          {number} · {label}
        </div>
        <div style={{ opacity: tit, fontFamily: serif, fontSize: 64, lineHeight: 1.02, color: COLORS.ink, letterSpacing: -0.5, transform: `translateY(${interpolate(tit, [0, 1], [18, 0])}px)`, marginBottom: 14 }}>
          {titleNode}
        </div>
        <div style={{ opacity: bod, fontFamily: sans, fontSize: 18, color: COLORS.muted, lineHeight: 1.5, maxWidth: 760, margin: "0 auto" }}>{body}</div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        <div style={{ opacity: frameIn, transform: `translateY(${interpolate(frameIn, [0, 1], [40, 0])}px) scale(${interpolate(frameIn, [0, 1], [0.97, 1])})` }}>
          <BrowserFrame width={frameW} {...clip} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
