import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { REVEAL } from "./theme";
import { serif, serifItalic, sans } from "../fonts";

type Props = {
  src: string;
  kicker: string;
  title: string;
  italicTail: string;
  body: string;
  side: "left" | "right";
};

export const ScreenFloat: React.FC<Props> = ({ src, kicker, title, italicTail, body, side }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // entry
  const inP = spring({ frame: f, fps, config: { damping: 200 } });
  // exit
  const out = interpolate(f, [durationInFrames - 25, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // floating drift
  const t = f / 30;
  const driftY = Math.sin(t / 1.6) * 6;
  const driftR = Math.sin(t / 2.2) * 0.6;

  const screenX = interpolate(inP, [0, 1], [side === "right" ? 80 : -80, 0]);
  const txtX = interpolate(inP, [0, 1], [side === "right" ? -40 : 40, 0]);

  const screenSide = side === "right" ? "row" : "row-reverse";

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(inP, [0, 1], [0, 1]) * (1 - out),
        flexDirection: screenSide,
        alignItems: "center",
        padding: "0 100px",
        gap: 80,
      }}
    >
      {/* Text column */}
      <div
        style={{
          flex: "0 0 480px",
          transform: `translateX(${txtX}px)`,
          opacity: inP,
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 15,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: REVEAL.muted,
            marginBottom: 22,
            fontWeight: 500,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 82,
            lineHeight: 1.02,
            color: REVEAL.ink,
            letterSpacing: -2,
            fontWeight: 400,
          }}
        >
          {title}{" "}
          <span style={{ fontFamily: serifItalic, color: REVEAL.ink }}>{italicTail}</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: sans,
            fontSize: 22,
            lineHeight: 1.5,
            color: REVEAL.muted,
            maxWidth: 460,
          }}
        >
          {body}
        </div>
      </div>

      {/* Screen */}
      <div
        style={{
          flex: 1,
          perspective: 1800,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1100,
            transform: `translateX(${screenX}px) translateY(${driftY}px)
                        rotateY(${(side === "right" ? -10 : 10) + driftR}deg)
                        rotateX(${4 + driftR * 0.5}deg)`,
            transformStyle: "preserve-3d",
            borderRadius: 18,
            overflow: "hidden",
            border: `1px solid ${REVEAL.hairline}`,
            boxShadow: `
              0 60px 120px -30px rgba(0,0,0,0.7),
              0 0 0 1px ${REVEAL.blue}22,
              0 0 80px ${REVEAL.blue}33
            `,
          }}
        >
          <Img src={staticFile(src)} style={{ width: "100%", height: "auto", display: "block" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
