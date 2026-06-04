import { motion } from "framer-motion";
import {
  Sparkles,
  Mic,
  SlidersHorizontal,
  BellRing,
  Network,
  Mail,
  FileText,
  Users,
  Watch,
  HeartPulse,
  Lock,
  Cpu,
  ShieldCheck,
  WifiOff,
  Download,
  Smartphone,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const coreFeatures = [
  {
    icon: Sparkles,
    title: "AI Reflections",
    description:
      "Emotional read, clarity score, cognitive patterns, and a quiet reflection. In under 30 seconds.",
  },
  {
    icon: Mic,
    title: "Voice Reflections",
    description:
      "Speak your thoughts when typing feels like too much. Transcribed, analyzed, and reflected — privately.",
  },
  {
    icon: SlidersHorizontal,
    title: "Reflection Modes",
    description:
      "Choose Supportive, Balanced, or Challenger. Control whether your AI empathizes gently or questions directly.",
  },
  {
    icon: BellRing,
    title: "Pattern Interrupts",
    description:
      "Learns when your loops open and nudges you before they grip. Push or in-app — your choice.",
  },
  {
    icon: Network,
    title: "Living Mind Map",
    description:
      "A visual graph of your psyche — themes, emotions, people, decisions — built silently from every entry.",
  },
  {
    icon: Mail,
    title: "Sunday Letter",
    description:
      "A private weekly letter from your future self — what shifted, what looped, what to gently watch this week.",
  },
];

const deeperFeatures = [
  {
    icon: FileText,
    title: "Therapist Bridge",
    description:
      "Export the last 30 days as a clinical brief — themes, mood arc, representative entries. One tap, one PDF. Bring it to your next session.",
  },
  {
    icon: Users,
    title: "Mentor Personas",
    description:
      "Choose from Stoic, CBT therapist, no-BS friend, journaling coach, or future self. Or grow your own from 30+ entries.",
  },
  {
    icon: Watch,
    title: "Wearable Context",
    description:
      "Connect Oura, Google Fit, or your calendar. Sleep, HRV, and meeting load shape your reflections automatically.",
  },
  {
    icon: HeartPulse,
    title: "Crisis Safety Net",
    description:
      "Opt-in detection that quietly watches for danger signals and surfaces 988, Samaritans, or your trusted contact when things look hard.",
  },
];

const trustFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "Premium+ seals your entries on-device before they leave your phone. Even we can't read them.",
  },
  {
    icon: Cpu,
    title: "On-Device AI",
    description:
      "When E2EE is active, analysis runs locally via Gemini Nano or Apple Intelligence. Zero server access.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Design",
    description:
      "No ads. No trackers. No training on your data. Row-level security. Your thoughts stay yours.",
  },
  {
    icon: WifiOff,
    title: "Offline-First",
    description:
      "Write when you're disconnected. Entries queue and sync when you're back online.",
  },
  {
    icon: Download,
    title: "Data Export",
    description:
      "One-click download of everything — your entries, analyses, patterns. JSON, yours to keep.",
  },
  {
    icon: Smartphone,
    title: "Installable App",
    description:
      "Add to home screen on any device. Push notifications. Works like a native app.",
  },
];

const Features = () => {
  return (
    <section className="bg-[#111] text-white py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-white/40 mb-4">
            ( Free · Premium $9.99/mo · Premium+ $49.00/mo )
          </p>
          <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1]">
            See what your mind is{" "}
            <span className="italic">actually</span> doing.
          </h2>
          <p className="font-barlow text-[15px] text-white/55 mt-6 leading-relaxed">
            Every feature below works together — reflections sharpen over time,
            patterns emerge across entries, and your AI companion learns your
            voice.
          </p>
        </div>

        {/* Section 1: Core Intelligence */}
        <div className="mb-24">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-white/40 mb-6">
            ( Core Intelligence )
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-[20px] overflow-hidden border border-white/10">
            {coreFeatures.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease }}
                className="bg-[#111] p-8 hover:bg-white/[0.03] transition-colors"
              >
                <Icon className="w-6 h-6 text-white/80 mb-8" strokeWidth={1.5} />
                <h3 className="font-barlow font-medium text-[20px] mb-3">
                  {title}
                </h3>
                <p className="font-barlow text-[15px] text-white/55 leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 2: Go Deeper */}
        <div className="mb-24">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-white/40 mb-6">
            ( Go Deeper )
          </p>
          <div className="grid md:grid-cols-2 gap-px bg-white/10 rounded-[20px] overflow-hidden border border-white/10">
            {deeperFeatures.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease }}
                className="bg-[#111] p-10 hover:bg-white/[0.03] transition-colors"
              >
                <Icon className="w-6 h-6 text-white/80 mb-8" strokeWidth={1.5} />
                <h3 className="font-barlow font-medium text-[20px] mb-3">
                  {title}
                </h3>
                <p className="font-barlow text-[15px] text-white/55 leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Built for Trust */}
        <div>
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-white/40 mb-6">
            ( Built for Trust )
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trustFeatures.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease }}
                className="border-t border-white/20 pt-6"
              >
                <Icon className="w-6 h-6 text-white/80 mb-6" strokeWidth={1.5} />
                <h3 className="font-barlow font-medium text-[20px] mb-3">
                  {title}
                </h3>
                <p className="font-barlow text-[15px] text-white/55 leading-relaxed">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
