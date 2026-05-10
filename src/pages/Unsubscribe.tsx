import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Seo from "@/components/Seo";

type State = "loading" | "valid" | "already" | "invalid" | "confirming" | "success" | "error";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } }
        );
        const data = await res.json();
        if (data.valid) setState("valid");
        else if (data.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch {
        setState("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState("confirming");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) return setState("error");
    if (data?.success) setState("success");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <main className="min-h-screen bg-[#F3F4ED] text-[#111] flex items-center justify-center px-6">
      <Seo title="Unsubscribe — NexoMind" description="Manage your NexoMind email preferences." />
      <div className="max-w-md w-full bg-white rounded-[24px] p-8 md:p-10 border border-black/5 text-center">
        <p className="font-instrument text-[24px] mb-6">
          nexo<span className="italic opacity-55">mind</span>
        </p>
        {state === "loading" && (
          <p className="font-barlow text-[15px] text-[#111]/65">Checking your link…</p>
        )}
        {state === "valid" && (
          <>
            <h1 className="font-instrument text-[32px] leading-tight mb-3">
              Unsubscribe <span className="italic">from emails?</span>
            </h1>
            <p className="font-barlow text-[15px] text-[#111]/65 mb-7">
              You'll stop receiving emails from NexoMind. Account-critical messages
              (like password resets) will still come through.
            </p>
            <button
              onClick={confirm}
              className="bg-[#111] text-white rounded-full px-7 py-3.5 font-barlow font-medium text-[14px] hover:bg-black transition-all"
            >
              Confirm unsubscribe
            </button>
          </>
        )}
        {state === "confirming" && (
          <p className="font-barlow text-[15px] text-[#111]/65">Unsubscribing…</p>
        )}
        {state === "success" && (
          <>
            <h1 className="font-instrument text-[32px] leading-tight mb-3">
              You're <span className="italic">out.</span>
            </h1>
            <p className="font-barlow text-[15px] text-[#111]/65">
              We won't email you again. Take care.
            </p>
          </>
        )}
        {state === "already" && (
          <>
            <h1 className="font-instrument text-[32px] leading-tight mb-3">
              Already <span className="italic">unsubscribed.</span>
            </h1>
            <p className="font-barlow text-[15px] text-[#111]/65">
              You won't receive any further emails from us.
            </p>
          </>
        )}
        {state === "invalid" && (
          <>
            <h1 className="font-instrument text-[32px] leading-tight mb-3">
              Link <span className="italic">expired.</span>
            </h1>
            <p className="font-barlow text-[15px] text-[#111]/65">
              This unsubscribe link is invalid or has expired.
            </p>
          </>
        )}
        {state === "error" && (
          <p className="font-barlow text-[15px] text-[#111]/65">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;
