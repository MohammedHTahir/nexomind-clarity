import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { deleteAllJournals } from "@/lib/journal";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const sections = [
  {
    title: "Privacy",
    body: "Your entries are stored privately under your account. Only you can read them — protected by row-level security on the backend.",
  },
  {
    title: "Data",
    body: "No data is sold or shared. There are no trackers, no ads, and no analytics tied to your reflections.",
  },
  {
    title: "Control",
    body: "You can delete every reflection anytime. You can also sign out from any device.",
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteAllJournals();
      try { localStorage.removeItem("nexomind:onboarding"); } catch {}
      toast.success("All reflections deleted.");
      setConfirm(false);
      navigate("/app");
    } catch (e) {
      toast.error("Could not delete data");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
            {user?.email ? `Signed in as ${user.email}.` : "A few quiet promises about how NexoMind treats your thoughts."}
          </p>
        </header>

        <div className="space-y-4 mb-10">
          {sections.map((s, i) => (
            <GlassCard key={s.title} delay={i * 0.05} className="p-7">
              <h2 className="font-instrument text-[26px] mb-2">{s.title}</h2>
              <p className="font-barlow text-[15px] text-[#111]/65 leading-relaxed">{s.body}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-7 mb-4" delay={0.15}>
          <h2 className="font-instrument text-[24px] mb-2">Sign out</h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
            End your session on this device. Your reflections stay safely in your account.
          </p>
          <button
            onClick={handleSignOut}
            className="bg-white/70 backdrop-blur-md border border-black/10 text-[#111] rounded-full px-6 py-2.5 font-barlow font-medium text-[13px] hover:bg-white transition-colors"
          >
            Sign out
          </button>
        </GlassCard>

        <GlassCard className="p-7 border-black/10" delay={0.2}>
          <h2 className="font-instrument text-[24px] mb-2">Delete everything</h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
            Removes every reflection and analysis from your account. This can't be undone.
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
                disabled={busy}
                className="bg-[#111] text-white rounded-full px-5 py-2 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-40"
              >
                {busy ? "Deleting…" : "Yes, delete"}
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
