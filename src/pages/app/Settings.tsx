import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { deleteAll } from "@/lib/journal";

const sections = [
  {
    title: "Privacy",
    body: "All entries are stored privately in your browser. Nothing is uploaded, nothing is read by anyone else.",
  },
  {
    title: "Data",
    body: "No data is sold or shared. There are no trackers, no ads, and no analytics tied to your reflections.",
  },
  {
    title: "Control",
    body: "You can delete all your data anytime. There's no account to cancel and no email to unsubscribe from.",
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const handleDelete = () => {
    deleteAll();
    setConfirm(false);
    navigate("/");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-3">
            ( Settings )
          </p>
          <h1 className="font-instrument text-[44px] md:text-[68px] leading-[1]">
            Yours, <span className="italic">always.</span>
          </h1>
          <p className="font-barlow text-[16px] text-[#111]/60 mt-3">
            A few quiet promises about how NexoMind treats your thoughts.
          </p>
        </header>

        <div className="space-y-4 mb-10">
          {sections.map((s, i) => (
            <GlassCard key={s.title} delay={i * 0.05} className="p-7">
              <h2 className="font-instrument text-[26px] mb-2">
                {s.title}
              </h2>
              <p className="font-barlow text-[15px] text-[#111]/65 leading-relaxed">
                {s.body}
              </p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-7 border-black/10" delay={0.2}>
          <h2 className="font-instrument text-[24px] mb-2">
            Delete everything
          </h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
            Removes every reflection, mood entry, and onboarding answer from this device. This can't be undone.
          </p>
          {!confirm ? (
            <button
              onClick={() => setConfirm(true)}
              className="bg-white/70 backdrop-blur-md border border-black/10 text-[#111] rounded-full px-6 py-2.5 font-barlow font-medium text-[13px] hover:bg-white transition-colors"
            >
              Delete all my data
            </button>
          ) : (
            <div className="flex flex-wrap gap-3 items-center">
              <span className="font-barlow text-[13px] text-[#111]/70">Are you sure?</span>
              <button
                onClick={handleDelete}
                className="bg-[#111] text-white rounded-full px-5 py-2 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="text-[#111]/55 hover:text-[#111] font-barlow text-[13px] px-2 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
};

export default Settings;
