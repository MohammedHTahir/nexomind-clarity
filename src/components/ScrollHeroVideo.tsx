import { useEffect, useRef, useState } from "react";

/**
 * Pinned, scroll-driven hero video.
 * - Tall wrapper (~300vh) with an inner sticky viewport.
 * - As the user scrolls, the video expands from inset → full-bleed,
 *   then scrubs from 0 → duration. No overlays, no text, no borders.
 */
const ScrollHeroVideo = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => setReady(true);
    v.addEventListener("loadeddata", onReady);
    v.load();
    return () => v.removeEventListener("loadeddata", onReady);
  }, []);

  useEffect(() => {
    let raf = 0;
    let targetTime = 0;
    let currentTime = 0;

    const tick = () => {
      const v = videoRef.current;
      if (v && ready && v.duration && isFinite(v.duration)) {
        // Smooth toward target to avoid frame-jumping on fast scrolls.
        currentTime += (targetTime - currentTime) * 0.18;
        if (Math.abs(v.currentTime - currentTime) > 0.016) {
          try {
            v.currentTime = currentTime;
          } catch {
            /* ignore */
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const update = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);

      const v = videoRef.current;
      if (v && ready && v.duration && isFinite(v.duration)) {
        const scrubStart = 0.18;
        const scrubP = p <= scrubStart ? 0 : (p - scrubStart) / (1 - scrubStart);
        targetTime = Math.min(Math.max(scrubP, 0), 1) * v.duration;
      }
    };

    update();
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  const expandP = Math.min(progress / 0.18, 1);
  const insetX = (1 - expandP) * 24; // px horizontal inset
  const insetY = (1 - expandP) * 24;
  const radius = (1 - expandP) * 24;
  const maxW = 1100 + expandP * 2000;

  return (
    <section
      ref={wrapRef}
      className="relative bg-[#F3F4ED]"
      style={{ height: "300vh" }}
      aria-label="Product walkthrough"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="relative overflow-hidden"
          style={{
            width: `min(${maxW}px, calc(100vw - ${insetX * 2}px))`,
            height: `calc(100vh - ${insetY * 2}px)`,
            borderRadius: `${radius}px`,
          }}
        >
          <video
            ref={videoRef}
            src="/scroll-hero.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              v.play().then(() => v.pause()).catch(() => {});
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};

export default ScrollHeroVideo;
