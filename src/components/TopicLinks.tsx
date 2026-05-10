import { Link } from "react-router-dom";

const topics = [
  { to: "/stop-overthinking", label: "Stop overthinking", desc: "Break the loop in seconds" },
  { to: "/ai-journaling-app", label: "AI journaling app", desc: "How NexoMind reflects with you" },
  { to: "/mental-clarity", label: "Find mental clarity", desc: "Turn fog into focus" },
  { to: "/overthinking-at-night", label: "Overthinking at night", desc: "Quiet the 3 a.m. mind" },
  { to: "/why-do-i-overthink", label: "Why do I overthink?", desc: "Understand the pattern" },
  { to: "/how-to-journal", label: "How to journal", desc: "A gentle starting point" },
  { to: "/anxiety-journal", label: "Anxiety journaling", desc: "Process worries safely" },
  { to: "/private-journal-app", label: "Private journal app", desc: "End-to-end private by design" },
];

const TopicLinks = () => (
  <section className="px-6 py-24 bg-[#F3F4ED] border-t border-black/5" aria-labelledby="topics-heading">
    <div className="max-w-6xl mx-auto">
      <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
        ( Explore )
      </p>
      <h2
        id="topics-heading"
        className="font-instrument text-[36px] md:text-[56px] leading-[1.05] tracking-tight text-[#111] mb-10 max-w-3xl"
      >
        Reading on the things <span className="italic">your mind keeps returning to.</span>
      </h2>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.map((t) => (
          <li key={t.to}>
            <Link
              to={t.to}
              className="block bg-white rounded-[18px] p-5 border border-black/5 hover:border-black/20 transition-colors h-full"
            >
              <p className="font-instrument text-[20px] leading-tight text-[#111]">{t.label}</p>
              <p className="font-barlow text-[13px] text-[#111]/55 mt-1.5 leading-relaxed">
                {t.desc}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TopicLinks;
