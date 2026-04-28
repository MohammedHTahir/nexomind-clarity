const quotes = [
  {
    q: "I stopped paying for three meditation apps. NexoMind is the only one I open without forcing myself.",
    n: "Lena R.",
    r: "Product Designer",
  },
  {
    q: "Writing into it feels like talking to the calmest version of myself. The reflections are oddly accurate.",
    n: "Marco D.",
    r: "Founder, Atlas Studio",
  },
  {
    q: "It hasn't fixed my anxiety, but it gives me twenty quiet minutes a day. That's a lot.",
    n: "Priya S.",
    r: "PhD candidate",
  },
  {
    q: "The fact that it doesn't gamify anything is the whole reason I trust it.",
    n: "Jonas K.",
    r: "Therapist",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-[#F3F4ED] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 max-w-2xl">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
            ( Testimonial )
          </p>
          <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1] text-[#111]">
            Words from <span className="italic">quieter</span> minds.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {quotes.map((t, i) => (
            <figure
              key={i}
              className="bg-white rounded-[20px] p-10 border border-black/5 flex flex-col justify-between min-h-[260px]"
            >
              <blockquote className="font-instrument text-[24px] md:text-[28px] leading-[1.25] text-[#111]">
                &ldquo;{t.q}&rdquo;
              </blockquote>
              <figcaption className="mt-8 font-barlow text-[14px] text-[#111]/60">
                <span className="font-medium text-[#111]">{t.n}</span> — {t.r}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
