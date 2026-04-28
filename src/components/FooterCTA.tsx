import { ArrowUpRight } from "lucide-react";

const FooterCTA = () => {
  return (
    <section className="bg-[#111] text-white">
      {/* CTA */}
      <div className="px-6 py-32 text-center max-w-4xl mx-auto">
        <h2 className="font-instrument text-[56px] md:text-[96px] leading-[0.95] tracking-tight">
          Begin the <span className="italic">quiet.</span>
        </h2>
        <p className="font-barlow text-[17px] text-white/60 mt-6 max-w-md mx-auto">
          Two minutes a day is enough. Your first reflection is free.
        </p>
        <button
          type="button"
          className="group mt-10 inline-flex items-center gap-2 bg-white text-[#111] rounded-full pl-7 pr-1.5 py-1.5 font-barlow font-medium text-[15px] hover:bg-white/90 transition-colors"
        >
          <span>Start free</span>
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#111] text-white group-hover:rotate-45 transition-transform duration-300">
            <ArrowUpRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" strokeWidth={2.25} />
          </span>
        </button>
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
