import { useEffect, useRef, useState } from "react";

/**
 * Hero product image inside a tablet frame.
 * Tilts in 3D when off-screen and straightens up as it scrolls into view.
 * Hidden on mobile (< md breakpoint).
 */
const ScrollHeroImage = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the section's top is at the bottom of the viewport,
      // 1 when its top reaches ~30% from the top of the viewport.
      const start = vh;
      const end = vh * 0.3;
      const raw = (start - rect.top) / (start - end);
      const p = Math.min(Math.max(raw, 0), 1);
      setProgress(p);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Ease-out cubic for a more natural settle
  const eased = 1 - Math.pow(1 - progress, 3);

  // Gentle initial tilt — tablet is already visible on load and just settles flat as you scroll
  const rotateX = (1 - eased) * 10;   // deg (was 22)
  const translateY = (1 - eased) * 24; // px (was 60)
  const scale = 0.96 + eased * 0.04;   // starts closer to full size

  return (
    <section
      ref={sectionRef}
      className="relative hidden md:block bg-[#F3F4ED] pt-8 md:pt-12 lg:pt-16 pb-16 md:pb-24"
      aria-label="Product preview"
      style={{ perspective: "1600px" }}
    >
      <div className="mx-auto px-4 md:px-8">
        <div
          className="relative mx-auto w-full max-w-[640px] md:max-w-[820px] lg:max-w-[960px] rounded-[36px] md:rounded-[48px] bg-neutral-900 p-2.5 md:p-4"
          style={{
            boxShadow:
              "0 60px 120px -30px rgba(20,20,20,0.35), 0 30px 60px -20px rgba(20,20,20,0.20), inset 0 0 0 1.5px rgba(255,255,255,0.06)",
            transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`,
            transformOrigin: "50% 0%",
            transition: "transform 0.05s linear",
            willChange: "transform",
          }}
        >
          {/* Bezel inner highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[36px] md:rounded-[48px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.04) 100%)",
            }}
          />

          {/* Front-facing camera dot */}
          <div
            aria-hidden
            className="absolute top-1/2 -translate-y-1/2 left-2.5 md:left-3.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-neutral-700 ring-1 ring-neutral-600"
          />

          {/* Screen */}
          <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-black">
            <img
              src="/herosection.jpg"
              alt="NexoMind AI journaling app dashboard showing a reflection entry with AI-generated clarity insights"
              className="block w-full h-auto select-none"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollHeroImage;
