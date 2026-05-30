import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { REVEAL } from "./theme";
import { serif, serifItalic, sans } from "../fonts";
import { Pill } from "./Pill";

const Beat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const inP = spring({ frame: f, fps, config: { damping: 200 } });
  const out = interpolate(f, [durationInFrames - 14, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(inP, [0, 1], [24, 0]) - out * 24;
  const blur = interpolate(inP, [0, 1], [10, 0]) + out * 10;
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 120px",
        opacity: inP * (1 - out),
        transform: `translateY(${y}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const KineticIntro: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Beat 1 — small kicker */}
      <Sequence from={0} durationInFrames={60}>
        <Beat>
          <div
            style={{
              fontFamily: sans,
              fontSize: 18,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: REVEAL.blue,
            }}
          >
            ( nexomind )
          </div>
        </Beat>
      </Sequence>

      {/* Beat 2 — Imagine a tool */}
      <Sequence from={50} durationInFrames={75}>
        <Beat>
          <div
            style={{
              fontFamily: serif,
              fontSize: 110,
              color: REVEAL.ink,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Imagine a <Pill text="tool" />
          </div>
        </Beat>
      </Sequence>

      {/* Beat 3 — that listens */}
      <Sequence from={115} durationInFrames={75}>
        <Beat>
          <div
            style={{
              fontFamily: serif,
              fontSize: 110,
              color: REVEAL.ink,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            that <span style={{ fontFamily: serifItalic, color: REVEAL.blue }}>listens.</span>
          </div>
        </Beat>
      </Sequence>

      {/* Beat 4 — sees the patterns */}
      <Sequence from={180} durationInFrames={80}>
        <Beat>
          <div style={{ maxWidth: 1500 }}>
            <div
              style={{
                fontFamily: serif,
                fontSize: 90,
                color: REVEAL.ink,
                lineHeight: 1.1,
                letterSpacing: -1.5,
                marginBottom: 18,
              }}
            >
              Sees the <span style={{ fontFamily: serifItalic, color: REVEAL.blue }}>patterns</span>
            </div>
            <div
              style={{
                fontFamily: serif,
                fontSize: 90,
                color: REVEAL.ink,
                lineHeight: 1.1,
                letterSpacing: -1.5,
              }}
            >
              you can't see <Pill text="yet." delay={6} />
            </div>
          </div>
        </Beat>
      </Sequence>

      {/* Beat 5 — Meet the screens */}
      <Sequence from={255} durationInFrames={80}>
        <Beat>
          <div
            style={{
              fontFamily: sans,
              fontSize: 18,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: REVEAL.faint,
              marginBottom: 28,
            }}
          >
            four surfaces. one quiet mind.
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 120,
              color: REVEAL.ink,
              lineHeight: 1.02,
              letterSpacing: -2.5,
            }}
          >
            Meet <span style={{ fontFamily: serifItalic, color: REVEAL.blue }}>NexoMind.</span>
          </div>
        </Beat>
      </Sequence>
    </AbsoluteFill>
  );
};
