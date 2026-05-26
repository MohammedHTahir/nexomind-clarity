import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !(window as unknown as { MSStream?: unknown }).MSStream;

const isStandalone = () =>
  typeof window !== "undefined" &&
  ((window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true);

type Variant = "floating" | "inline";

const InstallPWA = ({
  variant = "floating",
  label = "Install app",
}: {
  variant?: Variant;
  label?: string;
}) => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("nm:install-dismissed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const ios = isIOS();
  const canShow = ios || !!deferred;
  if (!canShow) return null;
  if (variant === "floating" && dismissed) return null;

  const handleClick = async () => {
    if (ios) {
      setShowIOSSheet(true);
      return;
    }
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* user cancelled */
    } finally {
      setDeferred(null);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      localStorage.setItem("nm:install-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {variant === "floating" ? (
        <div
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 bg-[#111] text-white rounded-full pl-4 pr-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.25)] font-barlow text-[13px]"
          role="region"
          aria-label="Install NexoMind"
        >
          <button
            onClick={handleClick}
            className="flex items-center gap-2 pr-2"
          >
            <Download className="w-4 h-4" />
            {label}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 bg-white text-[#111] rounded-full px-5 py-2.5 font-barlow font-medium text-[13px] hover:bg-white/90 transition"
        >
          <Download className="w-4 h-4" />
          {label}
        </button>
      )}

      {showIOSSheet && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowIOSSheet(false)}
        >
          <div
            className="bg-white text-[#111] w-full max-w-md rounded-t-3xl p-7 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-instrument text-[24px]">Install NexoMind</h3>
              <button
                onClick={() => setShowIOSSheet(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="font-barlow text-[14px] text-[#111]/70 mb-5">
              On iPhone, Safari doesn't have a direct install button. It only takes two taps:
            </p>
            <ol className="space-y-3 font-barlow text-[14px]">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-[#111] text-white text-[12px] flex items-center justify-center">
                  1
                </span>
                <span>
                  Tap the <Share className="w-4 h-4 inline-block -mt-0.5" />{" "}
                  <strong>Share</strong> icon at the bottom of Safari.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-[#111] text-white text-[12px] flex items-center justify-center">
                  2
                </span>
                <span>
                  Scroll and tap <strong>Add to Home Screen</strong>.
                </span>
              </li>
            </ol>
            <p className="font-barlow text-[12px] text-[#111]/50 mt-6">
              Open NexoMind from your home screen for the full app experience and push reminders.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWA;
