import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { COLORS } from "../theme";
import { serif, sans } from "../fonts";

const datapoints = Array.from({ length: 24 }).map((_, i) => ({
  x: 8 + (i * 3.4) % 84,
  y: 18 + ((i * 47) % 60),
  d: i * 2,
}));

export const Scene4Pattern: React.FC = () => {
  const frame = useCurrentFrame();
  const cardP = spring({ frame: frame - 60, fps: 30, config: { damping: 18, stiffness: 110 } });
  const lineP = interpolate(frame, [70, 130], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* scattered points */}
      {datapoints.map((p, i) => {
        const op = interpolate(frame, [p.d, p.d + 15], [0, 0.55], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: COLORS.inkSoft,
              opacity: op,
            }}
          />
        );
      })}
      {/* connecting line, sketched */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path
          d="M 200 700 C 500 600, 700 800, 950 650 S 1500 720, 1750 600"
          stroke={COLORS.accent}
          strokeWidth={2.5}
          fill="none"
          strokeDasharray="2000"
          strokeDashoffset={2000 - lineP * 2000}
        />
      </svg>

      {/* insight card */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translateY(${interpolate(cardP, [0, 1], [40, 0])}px) scale(${0.92 + cardP * 0.08})`,
          opacity: cardP,
          background: COLORS.card,
          borderRadius: 24,
          padding: "60px 72px",
          maxWidth: 1100,
          boxShadow: "0 30px 80px rgba(20,20,20,0.12), 0 4px 12px rgba(20,20,20,0.06)",
          border: `1px solid ${COLORS.divider}`,
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 16, letterSpacing: 4, textTransform: "uppercase", color: COLORS.accent, marginBottom: 24 }}>
          A pattern I'm noticing
        </div>
        <div style={{ fontFamily: serif, fontSize: 70, lineHeight: 1.15, color: COLORS.ink }}>
          You tend to overthink <span style={{ fontStyle: "italic" }}>more</span>
          <br />on Sunday nights — and it's
          <br />usually about work, not people.
        </div>
        <div style={{ fontFamily: sans, fontSize: 22, color: COLORS.muted, marginTop: 32 }}>
          Based on 14 reflections, last 6 weeks.
        </div>
      </div>
    </AbsoluteFill>
  );
};
