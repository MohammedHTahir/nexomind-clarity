import Seo from "@/components/Seo";
import SeoLayout from "@/components/SeoLayout";

const MentalClarity = () => {
  return (
    <>
      <Seo
        title="Mental Clarity — Daily Reflection with AI | NexoMind"
        description="Find mental clarity in minutes a day. NexoMind turns your thoughts into calm, structured insight — privately, with AI built for reflection."
      />
      <SeoLayout
        eyebrow="Mental Clarity"
        title="Mental clarity,"
        italic="one thought at a time."
        intro="Clarity isn't a productivity hack. It's the quiet space that appears once your thoughts have somewhere to go. NexoMind helps you get there, daily."
        related={[
          {
            to: "/stop-overthinking",
            label: "How to stop overthinking",
            desc: "Practical, calm steps for a quieter mind.",
          },
          {
            to: "/ai-journaling-app",
            label: "AI journaling, explained",
            desc: "Why writing with AI feels different from writing alone.",
          },
        ]}
      >
        <div className="space-y-10 font-barlow text-[17px] leading-relaxed text-[#111]/75">
          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              What mental clarity actually is
            </h2>
            <p>
              Clarity isn't the absence of thought — it's the presence of perspective.
              It's knowing what you feel, what matters, and what doesn't, without
              having to argue with yourself about it.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              A daily practice that takes 3 minutes
            </h2>
            <p>
              Open NexoMind. Write whatever's on your mind — one sentence or ten.
              Within seconds, you'll see your thought reflected back as structured
              insight: the emotion underneath, the pattern emerging, and a single
              grounded takeaway to carry into your day.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              Built for calm, not performance
            </h2>
            <p>
              No streaks. No leaderboards. No mood scores. NexoMind is designed to
              feel like the quietest app on your phone — a place to think, not
              another thing to manage.
            </p>
          </section>
        </div>
      </SeoLayout>
    </>
  );
};

export default MentalClarity;
