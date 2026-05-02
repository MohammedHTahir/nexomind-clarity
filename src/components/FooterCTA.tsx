import { Link } from "react-router-dom";

const exploreLinks = [
  { to: "/stop-overthinking", label: "Stop overthinking" },
  { to: "/ai-journaling-app", label: "AI journaling app" },
  { to: "/mental-clarity", label: "Mental clarity" },
  { to: "/overthinking-at-night", label: "Overthinking at night" },
  { to: "/why-do-i-overthink", label: "Why do I overthink?" },
];

const FooterCTA = () => {
  return (
    <section className="bg-[#111] text-white">
      {/* CTA */}
      <div className="px-6 py-32 text-center max-w-4xl mx-auto">
        <h2 className="font-instrument text-[48px] md:text-[88px] leading-[1.05] md:leading-[0.95] tracking-tight">
          Start understanding <br /> your mind <span className="italic">today.</span>
        </h2>
        <p className="font-barlow text-[16px] md:text-[18px] text-white/70 mt-8">
          It takes less than 30 seconds.
        </p>
        <Link
          to="/auth"
          className="inline-block mt-10 bg-white text-[#111] rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-white/90 hover:scale-[1.02] transition-all duration-300"
        >
          Start your first reflection
        </Link>
        <p className="font-barlow text-sm text-white/60 mt-4">
          No signup required
        </p>
      </div>

      {/* Explore */}
      <div className="border-t border-white/10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-instrument text-[32px] md:text-[42px] leading-tight mb-6">
            Explore
          </h2>
          <div className="flex flex-wrap gap-x-7 gap-y-3 font-barlow text-[14px] text-white/55">
            {exploreLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default FooterCTA;
