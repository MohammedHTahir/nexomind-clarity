import Seo from "@/components/Seo";
import SeoLayout from "@/components/SeoLayout";

const AiJournalingApp = () => {
  return (
    <>
      <Seo
        title="AI Journaling App for Mental Clarity | NexoMind"
        description="NexoMind is an AI journaling app that turns your thoughts into clear emotional insight. Private, calm, and built for daily reflection."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "NexoMind",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          description:
            "AI journaling app that helps you understand your thoughts and emotions privately.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <SeoLayout
        eyebrow="AI Journaling App"
        title="The AI journaling app for a"
        italic="quieter mind."
        intro="NexoMind listens to what's on your mind and gently turns it into structured clarity. No prompts to fill, no streaks to maintain — just write, and let AI help you see your thoughts more clearly."
        related={[
          {
            to: "/stop-overthinking",
            label: "How to stop overthinking",
            desc: "A calmer approach to a noisy mind, powered by reflection.",
          },
          {
            to: "/mental-clarity",
            label: "Finding mental clarity",
            desc: "Turn racing thoughts into a clear, grounded perspective.",
          },
        ]}
      >
        <div className="space-y-10 font-barlow text-[17px] leading-relaxed text-[#111]/75">
          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              Journaling, finally made effortless
            </h2>
            <p>
              Traditional journaling asks you to know what to say. NexoMind doesn't.
              You write whatever comes to mind — fragmented, messy, unsure — and our
              AI quietly organizes it into emotional themes, patterns, and gentle
              reflection prompts. It's the difference between staring at a blank page
              and being heard.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              What makes NexoMind different
            </h2>
            <ul className="space-y-3 list-none pl-0">
              <li><strong className="text-[#111]">Private by design.</strong> Your entries stay yours. Always.</li>
              <li><strong className="text-[#111]">No streaks, no pressure.</strong> Reflection isn't a habit to gamify.</li>
              <li><strong className="text-[#111]">Emotional intelligence.</strong> AI that feels less like a chatbot, more like a thoughtful friend.</li>
              <li><strong className="text-[#111]">Built for clarity.</strong> Every reflection ends with one clear takeaway.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
              Who it's for
            </h2>
            <p>
              For founders between meetings. For students at 1 AM. For anyone whose
              mind feels too loud. NexoMind is the AI journaling app for people who
              want to think more clearly without adding another task to their day.
            </p>
          </section>
        </div>
      </SeoLayout>
    </>
  );
};

export default AiJournalingApp;
