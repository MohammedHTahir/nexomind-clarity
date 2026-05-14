import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const DemoVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <section className="px-6 py-24 bg-[#F3F4ED]">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-foreground/50 mb-4">
          Watch · 30 seconds
        </p>
        <h2 className="font-instrument text-4xl md:text-6xl text-foreground leading-tight mb-12">
          A quieter way to think.
        </h2>

        <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(20,20,20,0.25)] border border-border/40 bg-black">
          <video
            ref={videoRef}
            src="/nexomind-demo.mp4"
            className="w-full h-auto block"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="NexoMind product demo"
          />
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm hover:bg-black/80 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="font-sans">{muted ? "Tap for sound" : "Sound on"}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DemoVideo;
