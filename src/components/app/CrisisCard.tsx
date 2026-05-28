/**
 * Crisis Card: overlay component that subscribes to crisis_events via
 * Supabase realtime. On threshold breach, shows card with locale-appropriate
 * resources and trusted contact action. Never auto-contacts emergency services.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/lib/i18n";

const ease = [0.16, 1, 0.3, 1] as const;

interface CrisisEvent {
  id: string;
  signal_score: number;
  threshold: number;
  surfaced_at: string;
  user_action: string | null;
}

interface TrustedContact {
  name: string;
  phone: string;
}

const CrisisCard = () => {
  const { user } = useAuth();
  const [event, setEvent] = useState<CrisisEvent | null>(null);
  const [trustedContact, setTrustedContact] = useState<TrustedContact | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Load any unresolved crisis event on mount
  const loadActiveEvent = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("crisis_events")
      .select("id, signal_score, threshold, surfaced_at, user_action")
      .eq("user_id", user.id)
      .is("user_action", null)
      .order("surfaced_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setEvent(data as CrisisEvent);
    }

    // Load trusted contact
    const { data: profile } = await supabase
      .from("profiles")
      .select("trusted_contact")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.trusted_contact) {
      setTrustedContact(profile.trusted_contact as TrustedContact);
    }
  }, [user]);

  useEffect(() => {
    loadActiveEvent();
  }, [loadActiveEvent]);

  // Subscribe to new crisis events via realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`crisis_events:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "crisis_events",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setEvent(payload.new as CrisisEvent);
          setDismissed(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAction = async (action: string) => {
    if (!event) return;
    await supabase
      .from("crisis_events")
      .update({ user_action: action, user_action_at: new Date().toISOString() })
      .eq("id", event.id);

    setDismissed(true);
  };

  const handleDismiss = () => {
    handleAction("dismissed");
  };

  const handleCall988 = () => {
    handleAction("called_988");
    window.open("tel:988", "_self");
  };

  const handleCallSamaritans = () => {
    handleAction("called_samaritans");
    window.open("tel:116123", "_self");
  };

  const handleContactTrusted = () => {
    if (!trustedContact) return;
    handleAction("contacted_trusted");
    // Notification message <= 280 chars, no plaintext journal content
    const message = t("crisisDetection.trustedMessage", { name: trustedContact.name });
    const truncated = message.slice(0, 280);
    window.open(`sms:${trustedContact.phone}?body=${encodeURIComponent(truncated)}`, "_self");
  };

  if (!event || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.5, ease }}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-md"
      >
        <div className="bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-red-200/60 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="font-instrument text-[20px]">
                {t("crisisCard.title")}
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-[#111]/40 hover:text-[#111] transition-colors p-1"
              aria-label={t("crisisCard.dismiss")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="font-barlow text-[14px] text-[#111]/70 leading-relaxed mb-5">
            {t("crisisCard.body")}
          </p>

          <div className="space-y-2.5">
            <button
              onClick={handleCall988}
              className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-xl px-4 py-3 transition-colors"
            >
              <Phone className="w-4 h-4 text-red-600" />
              <span className="font-barlow text-[13px] font-medium text-red-800">
                {t("crisisCard.call988")}
              </span>
            </button>

            <button
              onClick={handleCallSamaritans}
              className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-xl px-4 py-3 transition-colors"
            >
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="font-barlow text-[13px] font-medium text-blue-800">
                {t("crisisCard.callSamaritans")}
              </span>
            </button>

            {trustedContact && trustedContact.phone && (
              <button
                onClick={handleContactTrusted}
                className="w-full flex items-center gap-3 bg-[#111]/[0.03] hover:bg-[#111]/[0.06] border border-[#111]/10 rounded-xl px-4 py-3 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#111]/60" />
                <span className="font-barlow text-[13px] font-medium text-[#111]/80">
                  {t("crisisCard.contactTrusted", { name: trustedContact.name })}
                </span>
              </button>
            )}
          </div>

          <p className="font-barlow text-[11px] text-[#111]/40 mt-4 text-center">
            {t("crisisCard.footer")}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrisisCard;
