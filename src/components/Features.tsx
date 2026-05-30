import { Lock, Sparkles, Mic, Waves, Network, BellRing, Mail, ShieldCheck, Stethoscope } from "lucide-react";

const features = [
  {
    icon: Network,
    t: "Mind Map of You",
    d: "A living graph of your psyche — themes, emotions, triggers, and the threads between them. Built silently from every entry.",
  },
  {
    icon: BellRing,
    t: "Pattern Interrupts",
    d: "NexoMind learns when your loops open — Sunday 8pm, Tuesday 11pm — and quietly nudges you before they grip.",
  },
  {
    icon: Mail,
    t: "Sunday Letter",
    d: "A private weekly letter from your AI mentor — what shifted, what looped, what to gently watch this week.",
  },
  {
    icon: Mic,
    t: "Voice reflections",
    d: "Speak your thoughts when typing feels like too much. We transcribe and reflect — privately.",
  },
  {
    icon: Waves,
    t: "Pattern recognition over time",
    d: "See the loops, triggers, and themes that quietly shape your days.",
  },
  {
    icon: Sparkles,
    t: "Unlimited AI reflections",
    d: "Reflect as often as your mind needs. No caps, no limits. Priority models for deeper insight.",
  },
  {
    icon: Stethoscope,
    t: "Therapist Brief",
    d: "Export a concise, professional summary of your week to share with your therapist — your words, your control.",
  },
  {
    icon: ShieldCheck,
    t: "End-to-end encryption",
    d: "Premium+ adds on-device AI and E2EE — your entries are sealed before they ever leave your phone.",
  },
  {
    icon: Lock,
    t: "Private. Never sold.",
    d: "Your reflections stay yours. We never sell them, never train external models on them, never read them.",
  },
];

const Features = () => {
  return (
    <section className="bg-[#111] text-white py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-white/40 mb-4">
            ( Free · Premium $9.99/mo · Premium+ $19.99/mo )
          </p>
          <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1]">
            See what your mind <br />
            is <span className="italic">actually</span> doing.
          </h2>
          <p className="font-barlow text-[15px] text-white/55 mt-6">
            Start free. Upgrade for unlimited reflections, patterns, and your weekly Sunday Letter. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-[20px] overflow-hidden border border-white/10">
          {features.map(({ icon: Icon, t, d }) => (
            <div key={t} className="bg-[#111] p-8 hover:bg-white/[0.03] transition-colors">
              <Icon className="w-6 h-6 text-white/80 mb-8" strokeWidth={1.5} />
              <h3 className="font-barlow font-medium text-[20px] mb-3">{t}</h3>
              <p className="font-barlow text-[15px] text-white/55 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
