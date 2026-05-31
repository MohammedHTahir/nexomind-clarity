import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import PatternInterruptBanner from "@/components/app/PatternInterruptBanner";
import CrisisCard from "@/components/app/CrisisCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const primaryNav = [
  { to: "/app", label: "Reflect" },
  { to: "/app/journal", label: "Write" },
  { to: "/app/insights", label: "Insights" },
  { to: "/app/settings", label: "Settings" },
];

const moreNav = [
  { to: "/app/mind-map", label: "Mind Map" },
  { to: "/app/inbox", label: "Inbox" },
  { to: "/app/therapist-bridge", label: "Therapist" },
];

const allNav = [...primaryNav, ...moreNav];


const AppShell = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const { isPastDue } = useSubscription();
  const [openingPortal, setOpeningPortal] = useState(false);

  const openPortal = async () => {
    if (openingPortal) return;
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

  return (
    <div className="min-h-screen bg-[#F3F4ED] text-[#111] relative overflow-hidden">
      {isPastDue && (
        <div className="w-full bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-[13px] text-amber-900 relative z-40">
          Your last payment failed. We're retrying — please update your card to keep your access.{" "}
          <button
            onClick={openPortal}
            disabled={openingPortal}
            className="underline font-medium hover:text-amber-950 disabled:opacity-60"
          >
            {openingPortal ? "Opening…" : "Update payment method"}
          </button>
        </div>
      )}
      <PatternInterruptBanner />
      {/* Soft ambient gradients (subtle, matches landing calm) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.35] blur-3xl"
        style={{ background: "radial-gradient(circle, #C9D2E8 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[40%] -right-40 w-[520px] h-[520px] rounded-full opacity-[0.30] blur-3xl"
        style={{ background: "radial-gradient(circle, #E0D5EE 0%, transparent 70%)" }}
      />

      {/* Top bar */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 pointer-events-none">
        <nav className="pointer-events-auto bg-white/80 backdrop-blur-md rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/5 flex items-center justify-between pl-6 pr-3 py-2">
          <Link to="/app" className="font-instrument text-[24px] tracking-tight leading-none">
            nexo<span className="italic text-[#111]/60">mind</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {primaryNav.map((n) => {
              const active =
                n.to === "/app" ? pathname === "/app" : pathname.startsWith(n.to);
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === "/app"}
                  className={`font-barlow font-medium text-[14px] whitespace-nowrap transition-opacity ${
                    active ? "opacity-100" : "opacity-50 hover:opacity-90"
                  }`}
                >
                  {n.label}
                </NavLink>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1 font-barlow font-medium text-[14px] whitespace-nowrap transition-opacity outline-none ${
                  moreNav.some((n) => pathname.startsWith(n.to))
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-90"
                }`}
              >
                More <ChevronDown className="w-3.5 h-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md">
                {moreNav.map((n) => (
                  <DropdownMenuItem key={n.to} asChild>
                    <NavLink to={n.to} className="font-barlow text-[14px] cursor-pointer">
                      {n.label}
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


          <Link
            to="/"
            className="font-barlow font-medium text-[12px] text-[#111]/60 hover:text-[#111] transition-colors px-3 py-1.5"
          >
            Exit
          </Link>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/85 backdrop-blur-md border border-black/5 rounded-full px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex gap-1">
        {nav.map((n) => {
          const active =
            n.to === "/app" ? pathname === "/app" : pathname.startsWith(n.to);
          return (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/app"}
              className={`font-barlow text-[12px] px-3 py-1.5 rounded-full transition-all ${
                active ? "bg-[#111] text-white" : "text-[#111]/60"
              }`}
            >
              {n.label}
            </NavLink>
          );
        })}
      </div>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative z-10 pt-28 pb-32 px-5 md:px-8"
      >
        {children}
      </motion.main>

      {/* Crisis detection overlay - never auto-contacts emergency services */}
      <CrisisCard />
    </div>
  );
};

export default AppShell;
