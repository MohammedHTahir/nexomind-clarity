import { Lock, Sparkles, Moon, Waves, NotebookPen, HeartPulse } from "lucide-react";

const features = [
  { icon: Lock, t: "End-to-end private", d: "Your entries are encrypted on-device. Only you ever read them." },
  { icon: Sparkles, t: "Gentle AI reflections", d: "Soft, non-clinical prompts that help you think — not diagnose you." },
  { icon: Moon, t: "Wind-down mode", d: "A calm late-night writing surface designed to help you actually sleep." },
  { icon: Waves, t: "Mood patterns", d: "See subtle weekly patterns without turning your life into a dashboard." },
  { icon: NotebookPen, t: "Voice or text", d: "Write, dictate or ramble. NexoMind transcribes and listens back." },
  { icon: HeartPulse, t: "Therapist-friendly", d: "Export sessions as PDFs to share with a therapist if you choose to." },
];

const Features = () => {
  return (
    <section className="bg-[#111] text-white py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-white/40 mb-4">
            ( Services )
          </p>
          <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1]">
            Everything you need <br />
            <span className="italic">nothing</span> you don't.
          </h2>
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
