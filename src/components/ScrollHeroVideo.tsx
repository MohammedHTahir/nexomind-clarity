import { useEffect, useRef, useState } from "react";

/**
 * Pinned, scroll-driven hero video.
 * - The wrapper is tall (≈ 300vh).
 * - An inner sticky viewport stays pinned for the duration.
 * - As the user scrolls, the video card expands from inset → full-bleed,
 *   then we scrub video.currentTime from 0 → duration.
 * - When all frames are done, the wrapper ends and the page continues.
 */
const ScrollHeroVideo = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 across the wrapper
  const [ready, setReady] = useState(false);

  // Make sure the video is loaded enough to scrub.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setReady(true);
    v.addEventListener("loadeddata", onMeta);
    // Some browsers won't preload aggressively; nudge it.
    v.load();
    return () => v.removeEventListener("loadeddata", onMeta);
  }, []);

  useEffect(() => {
    let raf = 0;
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
        // First ~22% of scroll is the expand-in animation, the rest scrubs the video.
        const scrubStart = 0.22;
        const scrubP = p <= scrubStart ? 0 : (p - scrubStart) / (1 - scrubStart);
        const t = Math.min(Math.max(scrubP, 0), 1) * v.duration;
        // Avoid spamming currentTime if it's already close.
        if (Math.abs(v.currentTime - t) > 0.03) {
          try {
            v.currentTime = t;
          } catch {
            /* ignore */
          }
        }
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  // Expand animation: from inset card → full bleed in the first 22% of scroll.
  const expandP = Math.min(progress / 0.22, 1);
  const inset = (1 - expandP) * 5; // vh of inset
  const radius = (1 - expandP) * 28; // px corner radius
  const maxW = 1100 + expandP * 1600; // px width grows beyond viewport
  const borderOpacity = (1 - expandP) * 0.12;

  return (
    <section
      ref={wrapRef}
      className="relative bg-[#F3F4ED]"
      style={{ height: "300vh" }}
      aria-label="Product walkthrough"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="relative overflow-hidden bg-black shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
          style={{
            width: `min(${maxW}px, calc(100vw - ${inset * 2}vh))`,
            height: `calc(100vh - ${inset * 2}vh)`,
            borderRadius: `${radius}px`,
            border: `1px solid rgba(0,0,0,${borderOpacity})`,
            transition: "border-color 120ms linear",
          }}
        >
          <video
            ref={videoRef}
            src="/scroll-hero.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
            // Some iOS builds require an initial play() to allow seeking.
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              v.play().then(() => v.pause()).catch(() => {});
            }}
            aria-hidden
          />

          {/* Soft top/bottom scrim for legibility of caption */}
          <div
            className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
            }}
            aria-hidden
          />

          {/* Caption */}
          <div className="absolute bottom-6 md:bottom-10 left-0 right-0 text-center px-6">
            <p className="font-barlow text-[11px] tracking-[0.22em] uppercase text-white/70">
              Scroll · See it in motion
            </p>
            <p className="mt-2 font-instrument italic text-white text-[22px] md:text-[34px] leading-snug">
              A reflection in seconds.
            </p>
          </div>

          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-[2px] bg-white/80"
            style={{ width: `${Math.min(Math.max((progress - 0.22) / 0.78, 0), 1) * 100}%` }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
};

export default ScrollHeroVideo;
