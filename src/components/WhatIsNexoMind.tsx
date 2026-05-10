import { Link } from "react-router-dom";

const trustPoints = [
  { label: "Privacy-focused", desc: "Your reflections are never sold or used to train public models." },
  { label: "Encrypted", desc: "Entries are stored securely and visible only to you." },
  { label: "Built for reflection", desc: "Designed to slow the loop, not feed it." },
  { label: "Mental clarity first", desc: "Every interaction is shaped to reduce mental clutter." },
];

const WhatIsNexoMind = () => {
  return (
    <section
      aria-labelledby="what-is-nexomind"
      className="bg-[#F3F4ED] px-6 py-24 border-t border-black/5"
    >
      <div className="max-w-3xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
          ( What is NexoMind? )
        </p>
        <h2
          id="what-is-nexomind"
          className="font-instrument text-[40px] md:text-[64px] leading-[1.05] tracking-tight text-[#111]"
        >
          A private AI journaling platform for{" "}
          <span className="italic">mental clarity.</span>
        </h2>
        <p className="font-barlow text-[17px] md:text-[18px] leading-relaxed text-[#111]/75 mt-8">
          NexoMind is a private AI journaling platform built to help people stop overthinking,
          process emotions, and gain mental clarity through structured AI reflection. Unlike
          traditional journaling apps, NexoMind actively helps users understand thought patterns
          and reduce mental clutter in a secure environment.
        </p>
        <p className="font-barlow text-[16px] leading-relaxed text-[#111]/65 mt-5">
          Use it for AI journaling, private reflection, and thought processing — whenever your
          mind needs to slow down.
        </p>

        <ul className="grid md:grid-cols-2 gap-5 mt-12">
          {trustPoints.map((t) => (
            <li
              key={t.label}
              className="rounded-[18px] border border-black/10 bg-white/60 p-5"
            >
              <p className="font-barlow font-medium text-[14px] tracking-[0.04em] text-[#111]">
                {t.label}
              </p>
              <p className="font-barlow text-[14px] leading-relaxed text-[#111]/65 mt-1.5">
                {t.desc}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 font-barlow text-[14px] text-[#111]/60">
          <Link to="/stop-overthinking" className="hover:text-[#111] underline-offset-4 hover:underline">
            Stop overthinking with AI journaling
          </Link>
          <Link to="/ai-journaling-app" className="hover:text-[#111] underline-offset-4 hover:underline">
            AI journaling for mental clarity
          </Link>
          <Link to="/mental-clarity" className="hover:text-[#111] underline-offset-4 hover:underline">
            Private AI reflection
          </Link>
          <Link to="/founder" className="hover:text-[#111] underline-offset-4 hover:underline">
            Meet the founder
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatIsNexoMind;
