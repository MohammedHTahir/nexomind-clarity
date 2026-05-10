import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import PaywallModal from "@/components/PaywallModal";
import { deleteAllJournals } from "@/lib/journal";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
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

const PLAN_LABEL: Record<string, string> = {
  premium_monthly: "NexoMind Premium · Monthly",
  premium_yearly: "NexoMind Premium · Yearly",
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { subscription, isPremium, isCanceling, isPastDue, loading } = useSubscription();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const planLabel =
    (subscription?.price_id && PLAN_LABEL[subscription.price_id]) ||
    (subscription ? "NexoMind Premium" : "Free");
  const renewalDate = formatDate(subscription?.current_period_end ?? null);

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: window.location.href,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Failed to open billing portal");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open billing portal");
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      // Cancel any active subscription first so the user isn't billed after deletion.
      if (subscription && subscription.status !== "canceled") {
        try {
          await supabase.functions.invoke("cancel-subscription", {
            body: { environment: getStripeEnvironment() },
          });
        } catch (e) {
          console.error("cancel-subscription failed during delete", e);
        }
      }
      await deleteAllJournals();
      try { localStorage.removeItem("nexomind:onboarding"); } catch {}
      toast.success(
        subscription && subscription.status !== "canceled"
          ? "All reflections deleted. Your subscription will end at the period close."
          : "All reflections deleted.",
      );
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

  const statusLine = (() => {
    if (loading) return "Checking your plan…";
    if (!isPremium && !subscription) return "You're on the free plan.";
    if (isPastDue) return "Last payment failed — please update your card.";
    if (isCanceling && renewalDate) return `Cancels on ${renewalDate}. You keep access until then.`;
    if (renewalDate) return `Renews on ${renewalDate}.`;
    return "";
  })();

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

        {/* Billing */}
        <GlassCard className="p-7 mb-4" delay={0.05}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-barlow font-medium text-[11px] tracking-[0.2em] uppercase text-[#111]/45 mb-2">
                ( Plan )
              </p>
              <h2 className="font-instrument text-[26px] mb-1">{planLabel}</h2>
              <p className="font-barlow text-[14px] text-[#111]/65 leading-relaxed">
                {statusLine}
              </p>
            </div>
            {isPremium ? (
              <button
                onClick={openPortal}
                disabled={openingPortal}
                className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-50"
              >
                {openingPortal ? "Opening…" : "Manage subscription"}
              </button>
            ) : (
              <button
                onClick={() => navigate("/app")}
                className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
          {isPremium && (
            <p className="font-barlow text-[12px] text-[#111]/45 mt-4">
              Manage your card, switch monthly ↔ yearly, view invoices, or cancel anytime.
            </p>
          )}
        </GlassCard>

        <div className="space-y-4 mb-10">
          {sections.map((s, i) => (
            <GlassCard key={s.title} delay={0.1 + i * 0.05} className="p-7">
              <h2 className="font-instrument text-[26px] mb-2">{s.title}</h2>
              <p className="font-barlow text-[15px] text-[#111]/65 leading-relaxed">{s.body}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-7 mb-4" delay={0.22}>
          <h2 className="font-instrument text-[24px] mb-2">Analytics</h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
            You control what data is shared. We only use privacy-friendly analytics to understand how people find clarity. No ads, no selling data.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("nm:show-consent"))}
            className="bg-white/70 backdrop-blur-md border border-black/10 text-[#111] rounded-full px-6 py-2.5 font-barlow font-medium text-[13px] hover:bg-white transition-colors"
          >
            Manage analytics choices
          </button>
        </GlassCard>

        <GlassCard className="p-7 mb-4" delay={0.25}>
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

        <GlassCard className="p-7 border-black/10" delay={0.3}>
          <h2 className="font-instrument text-[24px] mb-2">Delete everything</h2>
          <p className="font-barlow text-[14px] text-[#111]/60 leading-relaxed mb-5">
            Removes every reflection and analysis from your account.
            {isPremium && !isCanceling
              ? " Your subscription will also be set to cancel at the end of the current period — you won't be billed again."
              : ""}{" "}
            This can't be undone.
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
