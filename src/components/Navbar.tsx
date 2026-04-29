import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const links = ["About", "Works", "Services", "Testimonial"];

const Navbar = () => {
  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 pointer-events-none">
      <nav className="pointer-events-auto bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between pl-6 pr-2 py-2">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <span className="font-instrument text-[26px] tracking-tight text-[#111] leading-none">
            nexo<span className="italic text-[#111]/60">mind</span>
          </span>
        </a>

        {/* Center menu */}
        <div className="hidden md:flex gap-9">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="font-barlow font-medium text-[14px] text-[#111] transition-opacity hover:opacity-60"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/auth"
          className="group flex items-center gap-2 bg-[#222] text-white rounded-full pl-5 pr-1.5 py-1.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
        >
          <span>Begin reflection</span>
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#222] group-hover:rotate-45 transition-transform duration-300">
            <ArrowUpRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" strokeWidth={2.25} />
          </span>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
