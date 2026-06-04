import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Is my journal really private?", a: "Yes. Entries are encrypted at rest and never sold or used to train external models. On Premium+, end-to-end encryption and on-device AI mean not even we can read them." },
  { q: "What do I get on Free vs Premium vs Premium+?", a: "Free gives you 3 reflections a week and AI insight on each entry. Premium ($9.99/mo or $95/yr) unlocks unlimited reflections, deep pattern analysis, emotional trends, voice entries, your Sunday Letter, and the Therapist Brief. Premium+ ($49.00/mo or $470/yr) adds end-to-end encryption and on-device AI for maximum privacy." },
  { q: "What's the Sunday Letter?", a: "A private weekly letter from your AI mentor — what shifted this week, the loops it noticed, and one quiet thing to watch for. It arrives every Sunday morning." },
  { q: "Can I use voice instead of typing?", a: "Yes. Premium members can speak a reflection and NexoMind will transcribe and analyze it privately — useful for late nights or walks." },
  { q: "Can I share insights with my therapist?", a: "Yes. The Therapist Brief generates a concise, professional summary of your week that you can export and share — entirely under your control." },
  { q: "Is NexoMind a replacement for therapy?", a: "No. It's a reflective companion. We strongly encourage pairing it with professional support when you need it." },
  { q: "Can I cancel anytime?", a: "Yes — one click in Settings. No retention calls, no friction. Access continues until the end of the billing period." },
  { q: "Can I export my entries?", a: "Anytime — as Markdown or PDF. Your words belong to you." },
];

const FAQ = () => {
  return (
    <section className="bg-[#F3F4ED] py-28 px-6 border-t border-black/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
            ( FAQ )
          </p>
          <h2 className="font-instrument text-[44px] md:text-[60px] leading-[1] text-[#111]">
            Honest answers, <span className="italic">no fluff.</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b border-black/10"
            >
              <AccordionTrigger className="font-barlow font-medium text-[18px] md:text-[20px] text-[#111] py-6 hover:no-underline text-left">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="font-barlow text-[16px] text-[#111]/65 leading-relaxed pb-6">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
