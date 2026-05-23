import { Video, staticFile, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";
import { sans } from "../fonts";

type Props = {
  startFrom: number;
  endAt: number;
  width: number;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;
  panY?: number;
};

export const BrowserFrame: React.FC<Props> = ({
  startFrom,
  endAt,
  width,
  zoomFrom = 1,
  zoomTo = 1.06,
  panX = 0,
  panY = 0,
}) => {
  const f = useCurrentFrame();
  const duration = endAt - startFrom;
  const p = interpolate(f, [0, duration], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scale = interpolate(p, [0, 1], [zoomFrom, zoomTo]);
  const tx = interpolate(p, [0, 1], [0, panX]);
  const ty = interpolate(p, [0, 1], [0, panY]);

  const aspect = 1820 / 760;
  const innerH = width / aspect;
  const chromeH = 36;

  return (
    <div
      style={{
        width,
        background: "#FFFFFF",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow:
          "0 50px 100px -30px rgba(20,20,30,0.35), 0 20px 40px -20px rgba(20,20,30,0.2), 0 0 0 1px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          height: chromeH,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 14px",
          background: "#F6F5F0",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FF6058" }} />
        <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FFBD2F" }} />
        <span style={{ width: 11, height: 11, borderRadius: 999, background: "#28C840" }} />
        <div style={{ marginLeft: 18, fontFamily: sans, fontSize: 13, color: COLORS.faint, letterSpacing: 0.2 }}>
          nexomind.ai
        </div>
      </div>
      <div style={{ width, height: innerH, overflow: "hidden", background: COLORS.bg }}>
        <div
          style={{
            width,
            height: innerH,
            transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
            transformOrigin: "center center",
          }}
        >
          <Video
            src={staticFile("source.mp4")}
            startFrom={startFrom}
            endAt={endAt}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
};
