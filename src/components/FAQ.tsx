import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Is my journal really private?", a: "Yes. Entries are encrypted on-device and we never read, train on, or sell your data." },
  { q: "Is NexoMind a replacement for therapy?", a: "No. It's a reflective companion. We encourage pairing it with professional support when you need it." },
  { q: "What does it cost?", a: "Free includes 3 reflections per week. Premium is $9.99/month or $95/year (save ~20%) for unlimited reflections — cancel anytime." },
  { q: "Which devices is it on?", a: "iOS, Android and a quiet web app for late-night desktop writing." },
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
