/**
 * E2EE 3-step activation modal:
 * Step 1: Enter passphrase (>= 12 chars)
 * Step 2: Confirm passphrase
 * Step 3: Irrecoverability acknowledgment
 */

import { useState } from "react";
import { X, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { validatePassphrase } from "@/lib/e2ee";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

interface E2EEActivationModalProps {
  open: boolean;
  onClose: () => void;
  onActivate: (passphrase: string) => Promise<void>;
}

type Step = 1 | 2 | 3;

const E2EEActivationModal = ({ open, onClose, onActivate }: E2EEActivationModalProps) => {
  const [step, setStep] = useState<Step>(1);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep(1);
    setPassphrase("");
    setConfirmPassphrase("");
    setShowPassphrase(false);
    setAcknowledged(false);
    setError("");
    setActivating(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStep1 = () => {
    const result = validatePassphrase(passphrase);
    if (!result.valid) {
      setError(result.error || t("e2ee.modal.passphraseError"));
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2 = () => {
    if (passphrase !== confirmPassphrase) {
      setError(t("e2ee.modal.mismatchError"));
      return;
    }
    setError("");
    setStep(3);
  };

  const handleStep3 = async () => {
    if (!acknowledged) return;
    setActivating(true);
    try {
      await onActivate(passphrase);
      toast.success(t("e2ee.modal.success"));
      handleClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("e2ee.modal.activationError");
      setError(msg);
      toast.error(msg);
    } finally {
      setActivating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-[24px] p-8 md:p-10 max-w-md w-full mx-4 shadow-2xl"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#111]/5 flex items-center justify-center hover:bg-[#111]/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-[#111]" : "bg-[#111]/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-instrument text-[28px] mb-2">
                {t("e2ee.modal.step1Title")}
              </h2>
              <p className="font-barlow text-[14px] text-[#111]/60 mb-6">
                {t("e2ee.modal.step1Description")}
              </p>
              <div className="relative mb-4">
                <input
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder={t("e2ee.modal.passphrasePlaceholder")}
                  className="w-full bg-[#111]/5 border border-black/10 rounded-xl px-4 py-3 pr-10 font-barlow text-[14px] outline-none focus:border-[#111]/30 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111]/40 hover:text-[#111]/70"
                >
                  {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-barlow text-[12px] text-[#111]/45 mb-4">
                {t("e2ee.modal.passphraseHint")}
              </p>
              {error && (
                <p className="font-barlow text-[13px] text-red-600 mb-4">{error}</p>
              )}
              <button
                onClick={handleStep1}
                disabled={!passphrase}
                className="w-full bg-[#111] text-white rounded-full py-3 font-barlow font-medium text-[14px] hover:bg-black transition-colors disabled:opacity-30"
              >
                {t("e2ee.modal.continue")}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-instrument text-[28px] mb-2">
                {t("e2ee.modal.step2Title")}
              </h2>
              <p className="font-barlow text-[14px] text-[#111]/60 mb-6">
                {t("e2ee.modal.step2Description")}
              </p>
              <input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder={t("e2ee.modal.confirmPlaceholder")}
                className="w-full bg-[#111]/5 border border-black/10 rounded-xl px-4 py-3 font-barlow text-[14px] outline-none focus:border-[#111]/30 transition-colors mb-4"
                autoFocus
              />
              {error && (
                <p className="font-barlow text-[13px] text-red-600 mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="flex-1 bg-[#111]/5 text-[#111] rounded-full py-3 font-barlow font-medium text-[14px] hover:bg-[#111]/10 transition-colors"
                >
                  {t("general.cancel")}
                </button>
                <button
                  onClick={handleStep2}
                  disabled={!confirmPassphrase}
                  className="flex-1 bg-[#111] text-white rounded-full py-3 font-barlow font-medium text-[14px] hover:bg-black transition-colors disabled:opacity-30"
                >
                  {t("e2ee.modal.continue")}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="font-instrument text-[28px]">
                  {t("e2ee.modal.step3Title")}
                </h2>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="font-barlow text-[14px] text-amber-900 leading-relaxed">
                  {t("e2ee.modal.irrecoverableWarning")}
                </p>
              </div>
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#111]/30 accent-[#111]"
                />
                <span className="font-barlow text-[13px] text-[#111]/70 leading-relaxed">
                  {t("e2ee.modal.acknowledgment")}
                </span>
              </label>
              {error && (
                <p className="font-barlow text-[13px] text-red-600 mb-4">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(2); setError(""); }}
                  className="flex-1 bg-[#111]/5 text-[#111] rounded-full py-3 font-barlow font-medium text-[14px] hover:bg-[#111]/10 transition-colors"
                >
                  {t("general.cancel")}
                </button>
                <button
                  onClick={handleStep3}
                  disabled={!acknowledged || activating}
                  className="flex-1 bg-[#111] text-white rounded-full py-3 font-barlow font-medium text-[14px] hover:bg-black transition-colors disabled:opacity-30"
                >
                  {activating ? t("e2ee.modal.activating") : t("e2ee.modal.activate")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default E2EEActivationModal;
