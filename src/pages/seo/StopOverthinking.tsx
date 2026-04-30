import Seo from "@/components/Seo";
import SeoLayout from "@/components/SeoLayout";

const StopOverthinking = () => {
  return (
    <>
      <Seo
        title="How to Stop Overthinking — A Calm AI Approach | NexoMind"
        description="Stop overthinking with NexoMind. Write what's on your mind and let AI gently turn racing thoughts into clarity, in under a minute."
      />
      <SeoLayout
        eyebrow="Stop Overthinking"
        title="A quieter way to"
        italic="stop overthinking."
        intro="Overthinking happens when thoughts have nowhere to land. NexoMind gives them a place — and helps you see what's actually underneath the noise."
        related={[
          {
            to: "/mental-clarity",
            label: "Finding mental clarity",
            desc: "What clarity actually feels like, and how to get there.",
          },
          {
            to: "/ai-journaling-app",
            label: "AI journaling, explained",
            desc: "How NexoMind turns scattered thoughts into structured insight.",
          },
        ]}
      >
        <div className="space-y-10 font-barlow text-[17px] leading-relaxed text-[#111]/75">
          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              Why we overthink
            </h2>
            <p>
              Overthinking isn't a flaw — it's a signal. Your mind is trying to make
              sense of something it doesn't yet have words for. The loop continues
              because the thought never gets fully expressed. Once it does, it tends
              to soften.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              Three small steps that help
            </h2>
            <ol className="space-y-4 list-decimal pl-5 marker:text-[#111]/40">
              <li><strong className="text-[#111]">Write it down, badly.</strong> Don't edit. Don't structure. Just empty the loop onto the page.</li>
              <li><strong className="text-[#111]">Name the emotion.</strong> Not the situation. The feeling underneath it.</li>
              <li><strong className="text-[#111]">Ask one honest question.</strong> "What would I tell a friend feeling this?"</li>
            </ol>
          </section>

          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              How NexoMind helps
            </h2>
            <p>
              You write freely. NexoMind reflects back the emotional patterns it
              hears, identifies recurring themes, and offers a single grounded
              prompt — never advice, never judgment. Most people feel lighter within
              one entry.
            </p>
          </section>
        </div>
      </SeoLayout>
    </>
  );
};

export default StopOverthinking;
