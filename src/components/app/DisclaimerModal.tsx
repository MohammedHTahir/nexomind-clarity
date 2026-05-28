/**
 * Reusable disclaimer modal for Phase 5 features.
 * Shows feature-specific copy, locale-appropriate resources,
 * requires checkbox acknowledgment, persists to disclaimer_acceptances on confirm.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { t } from "@/lib/i18n";

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
  onAccepted: () => void;
  featureKey: string;
  disclaimerVersion: string;
  title: string;
  body: string;
  acknowledgmentText: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

const CRISIS_RESOURCES = [
  { label: "988 Suicide & Crisis Lifeline (US)", href: "tel:988", region: "US" },
  { label: "Samaritans (UK/IE): 116 123", href: "tel:116123", region: "UK" },
  { label: "Crisis Text Line: Text HOME to 741741", href: "sms:741741", region: "US" },
];

const DisclaimerModal = ({
  open,
  onClose,
  onAccepted,
  featureKey,
  disclaimerVersion,
  title,
  body,
  acknowledgmentText,
}: DisclaimerModalProps) => {
  const { user } = useAuth();
  const [acknowledged, setAcknowledged] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!acknowledged || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("disclaimer_acceptances").insert({
        user_id: user.id,
        feature_key: featureKey,
        disclaimer_version: disclaimerVersion,
      });
      if (error) throw error;
      onAccepted();
    } catch (e) {
      toast.error(t("general.error"));
      console.error("disclaimer acceptance failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
              </div>
              <h2 className="font-instrument text-[24px]">{title}</h2>
            </div>

            <p className="font-barlow text-[14px] text-[#111]/70 leading-relaxed mb-5 whitespace-pre-line">
              {body}
            </p>

            {/* Crisis resources */}
            <div className="bg-[#F3F4ED] rounded-xl p-4 mb-5">
              <p className="font-barlow font-medium text-[11px] tracking-[0.15em] uppercase text-[#111]/50 mb-3">
                {t("disclaimer.crisisResources")}
              </p>
              <ul className="space-y-2">
                {CRISIS_RESOURCES.map((r) => (
                  <li key={r.href} className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-[#111]/40 shrink-0" />
                    <a
                      href={r.href}
                      className="font-barlow text-[13px] text-[#111]/80 hover:text-[#111] transition-colors underline underline-offset-2"
                    >
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Acknowledgment checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#111]/20 accent-[#111]"
              />
              <span className="font-barlow text-[13px] text-[#111]/70 leading-relaxed">
                {acknowledgmentText}
              </span>
            </label>

            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="font-barlow text-[13px] text-[#111]/60 hover:text-[#111] px-4 py-2 transition-colors"
              >
                {t("general.cancel")}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!acknowledged || saving}
                className="bg-[#111] text-white rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-black transition-colors disabled:opacity-40"
              >
                {saving ? t("general.loading") : t("disclaimer.accept")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;
