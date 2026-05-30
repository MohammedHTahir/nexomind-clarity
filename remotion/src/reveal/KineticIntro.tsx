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

const kicker = {
  fontFamily: sans,
  fontSize: 16,
  letterSpacing: 6,
  textTransform: "uppercase" as const,
  color: REVEAL.muted,
  fontWeight: 500,
};

const display = {
  fontFamily: serif,
  fontSize: 130,
  color: REVEAL.ink,
  lineHeight: 1.02,
  letterSpacing: -3,
  fontWeight: 400,
};

export const KineticIntro: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Beat 1 — wordmark kicker (matches site nav: nexomind) */}
      <Sequence from={0} durationInFrames={60}>
        <Beat>
          <div style={{ fontFamily: serif, fontSize: 42, color: REVEAL.ink, letterSpacing: -0.5 }}>
            nexo<span style={{ fontFamily: serifItalic }}>mind</span>
          </div>
        </Beat>
      </Sequence>

      {/* Beat 2 — A quieter way */}
      <Sequence from={50} durationInFrames={75}>
        <Beat>
          <div style={display}>A quieter way</div>
        </Beat>
      </Sequence>

      {/* Beat 3 — to think */}
      <Sequence from={115} durationInFrames={75}>
        <Beat>
          <div style={display}>to think,</div>
        </Beat>
      </Sequence>

      {/* Beat 4 — one thought at a time (hero italic block) */}
      <Sequence from={180} durationInFrames={90}>
        <Beat>
          <div style={{ maxWidth: 1600 }}>
            <div style={{ ...display, fontSize: 110, marginBottom: 24 }}>one thought</div>
            <div style={{ ...display, fontSize: 110 }}>
              <Pill text="at a time." delay={4} />
            </div>
          </div>
        </Beat>
      </Sequence>

      {/* Beat 5 — Meet NexoMind */}
      <Sequence from={265} durationInFrames={80}>
        <Beat>
          <div style={{ ...kicker, marginBottom: 28 }}>four surfaces · one quiet mind</div>
          <div style={{ ...display, fontSize: 130 }}>
            Meet <span style={{ fontFamily: serifItalic }}>nexomind.</span>
          </div>
        </Beat>
      </Sequence>
    </AbsoluteFill>
  );
};
