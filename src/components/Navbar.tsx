import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const links = [
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Journal", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 pointer-events-none">
      <nav className="pointer-events-auto bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between pl-6 pr-2 py-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="NexoMind home">
          <span className="font-instrument text-[26px] tracking-tight text-[#111] leading-none">
            nexo<span className="italic text-[#111]/60">mind</span>
          </span>
        </Link>

        {/* Center menu */}
        <div className="hidden md:flex gap-9">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              aria-current={pathname === link.to ? "page" : undefined}
              className={`font-barlow font-medium text-[14px] text-[#111] transition-opacity hover:opacity-60 ${
                pathname === link.to ? "opacity-100" : "opacity-80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 mr-1"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5 text-[#111]" /> : <Menu className="w-5 h-5 text-[#111]" />}
        </button>

        {/* CTA */}
        <Link
          to="/auth"
          className="hidden md:flex group items-center gap-2 bg-[#222] text-white rounded-full pl-5 pr-1.5 py-1.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
        >
          <span>Begin reflection</span>
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#222] group-hover:rotate-45 transition-transform duration-300">
            <ArrowUpRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" strokeWidth={2.25} />
          </span>
        </Link>
      </nav>

      {/* Mobile menu drawer */}
      {open && (
        <div className="pointer-events-auto md:hidden mt-2 bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block font-barlow font-medium text-[15px] text-[#111] py-3 border-b border-black/5 last:border-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="mt-4 block text-center bg-[#111] text-white rounded-full py-3 font-barlow font-medium text-[14px]"
          >
            Begin reflection
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
