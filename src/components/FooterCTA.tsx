import { Link } from "react-router-dom";

const FooterCTA = () => {
  return (
    <section className="bg-[#111] text-white">
      {/* CTA */}
      <div className="px-6 py-32 text-center max-w-4xl mx-auto">
        <h2 className="font-instrument text-[48px] md:text-[88px] leading-[1.05] md:leading-[0.95] tracking-tight">
          Start your mental clarity <br /> journey <span className="italic">today.</span>
        </h2>
        <Link
          to="/onboarding"
          className="inline-block mt-12 bg-white text-[#111] rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-white/90 hover:scale-[1.02] transition-all duration-300"
        >
          Try your first reflection — free
        </Link>
        <p className="font-barlow text-sm text-white/60 mt-4">
          No signup required
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-instrument text-[24px] tracking-tight">
            nexo<span className="italic text-white/60">mind</span>
          </span>
          <div className="flex gap-8 font-barlow text-[13px] text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="font-barlow text-[13px] text-white/40">
            © {new Date().getFullYear()} NexoMind. All rights reserved.
          </p>
        </div>
      </footer>
    </section>
  );
};

export default FooterCTA;
