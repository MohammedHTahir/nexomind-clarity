import { Link } from "react-router-dom";
import NewsletterSignup from "@/components/NewsletterSignup";

const SiteFooter = () => {
  return (
    <footer className="bg-[#111] text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-4 gap-12">
        {/* Column 1 — Brand */}
        <div>
          <span className="font-instrument text-[28px] tracking-tight">
            nexo<span className="italic text-white/60">mind</span>
          </span>
          <p className="font-barlow text-[15px] text-white/60 mt-4 leading-relaxed max-w-xs">
            Private AI journaling for mental clarity.
          </p>
        </div>

        {/* Column 2 — Explore */}
        <div>
          <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-white/45 mb-5">
            Explore
          </p>
          <ul className="space-y-3 font-barlow text-[14px] text-white/70">
            <li><Link to="/blog" className="hover:text-white transition-colors">Journal</Link></li>
            <li><Link to="/compare" className="hover:text-white transition-colors">Compare</Link></li>
            <li><Link to="/nexomind-vs-day-one" className="hover:text-white transition-colors">vs Day One</Link></li>
            <li><Link to="/nexomind-vs-reflectly" className="hover:text-white transition-colors">vs Reflectly</Link></li>
            <li><Link to="/nexomind-vs-stoic" className="hover:text-white transition-colors">vs Stoic</Link></li>
            <li><Link to="/nexomind-vs-apple-journal" className="hover:text-white transition-colors">vs Apple Journal</Link></li>
            <li><Link to="/how-to-stop-overthinking" className="hover:text-white transition-colors">How to stop overthinking</Link></li>
            <li><Link to="/mental-clarity" className="hover:text-white transition-colors">Mental clarity</Link></li>
            <li><Link to="/ai-journaling" className="hover:text-white transition-colors">AI journaling</Link></li>
            <li><Link to="/private-ai-journaling" className="hover:text-white transition-colors">Private AI journaling</Link></li>
          </ul>
        </div>

        {/* Column 3 — Company */}
        <div>
          <p className="font-barlow font-medium text-[11px] tracking-[0.22em] uppercase text-white/45 mb-5">
            Company
          </p>
          <ul className="space-y-3 font-barlow text-[14px] text-white/70">
            <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Column 4 — Newsletter */}
        <NewsletterSignup source="footer" />
      </div>

      <div className="border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-barlow text-[13px] text-white/40">
            © {new Date().getFullYear()} NexoMind. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-barlow text-[11px] tracking-[0.18em] uppercase text-white/40">
            <span>Private by design</span>
            <span className="opacity-40">•</span>
            <span>No data sold</span>
            <span className="opacity-40">•</span>
            <span>Encrypted reflections</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
