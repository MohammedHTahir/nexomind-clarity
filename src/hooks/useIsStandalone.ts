import { useEffect, useState } from "react";

/** True when the page is running as an installed PWA (home-screen launch), not a browser tab. */
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState<boolean>(() => detect());

  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setStandalone(detect());
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return standalone;
}

function detect(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari uses navigator.standalone
  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const displayStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  return iosStandalone || displayStandalone;
}
