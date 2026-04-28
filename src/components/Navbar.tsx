const links = ["Clarity", "How it works", "Trust", "Access"];

const Navbar = () => {
  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 pointer-events-none">
      <nav className="pointer-events-auto backdrop-blur-md bg-white/40 rounded-full border border-black/10 flex items-center justify-between px-5 py-2.5">
        <a href="#" className="font-instrument text-[28px] tracking-tight text-[#1a1a1a] leading-none">
          nexo<span className="text-[#1a1a1a]/60">.</span>
        </a>

        <div className="hidden md:flex gap-10">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="font-sans text-[14px] text-[#1a1a1a] transition-opacity hover:opacity-50"
            >
              {link}
            </a>
          ))}
        </div>

        <button
          type="button"
          className="group relative bg-[#1a1a1a] text-white rounded-full px-5 py-2 text-[14px] overflow-hidden shadow-[inset_0_-4px_4px_rgba(255,255,255,0.15)] transition-transform hover:scale-[1.02]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute w-[80%] h-4 left-[10%] top-[1px] bg-gradient-to-b from-white/40 to-transparent rounded-[12px] group-hover:scale-x-105 transition-transform"
          />
          <span className="relative">Start free</span>
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
