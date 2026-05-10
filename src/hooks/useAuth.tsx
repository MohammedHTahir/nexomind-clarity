import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe FIRST, then read existing session
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setLoading(false);
      // Fire welcome email once per user (idempotency key dedupes server-side).
      if (event === "SIGNED_IN" && s?.user) {
        const u = s.user;
        // Fire signup_completed exactly once per user (first sign-in).
        try {
          const flagKey = `nexomind:signup_tracked:${u.id}`;
          if (!localStorage.getItem(flagKey)) {
            trackEvent("signup_completed", {
              provider: u.app_metadata?.provider ?? "email",
            });
            localStorage.setItem(flagKey, "1");
          }
        } catch {}
        const name =
          (u.user_metadata?.display_name as string | undefined) ||
          (u.user_metadata?.full_name as string | undefined) ||
          (u.user_metadata?.name as string | undefined) ||
          undefined;
        // Defer so we don't block auth state propagation.
        setTimeout(() => {
          supabase.functions
            .invoke("send-transactional-email", {
              body: {
                templateName: "welcome",
                recipientEmail: u.email,
                idempotencyKey: `welcome-${u.id}`,
                templateData: { name },
              },
            })
            .catch(() => {});
        }, 0);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
