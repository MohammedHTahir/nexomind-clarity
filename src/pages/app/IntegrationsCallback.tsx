/**
 * OAuth callback handler for wearable/calendar integrations.
 * Verifies CSRF state, exchanges code via connect-integration edge function,
 * then redirects back to Settings with a status flag.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { handleOAuthCallback, verifyOAuthState } from "@/lib/integrations";

const IntegrationsCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ranRef = useRef(false);
  const [message, setMessage] = useState("Finishing connection…");

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      const code = params.get("code");
      const state = params.get("state");
      const errorParam = params.get("error");

      if (errorParam) {
        toast.error(`Connection cancelled: ${errorParam}`);
        navigate("/app/settings", { replace: true });
        return;
      }

      const provider = verifyOAuthState(state);
      if (!provider || !code) {
        toast.error("Invalid or expired connection request. Please try again.");
        navigate("/app/settings", { replace: true });
        return;
      }

      setMessage(`Connecting ${provider.replace("_", " ")}…`);
      const result = await handleOAuthCallback(code, provider);
      if (result.success) {
        toast.success("Connected successfully");
      } else {
        toast.error(result.error ?? "Connection failed");
      }
      navigate("/app/settings", { replace: true });
    };

    run();
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4 rounded-full border-2 border-[#111]/20 border-t-[#111] animate-spin" />
        <p className="font-barlow text-[14px] text-[#111]/60">{message}</p>
      </div>
    </div>
  );
};

export default IntegrationsCallback;
