import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("Auth callback error:", error.message);
        navigate("/auth?error=auth_callback_failed", { replace: true });
        return;
      }

      // Successfully authenticated, redirect to app
      navigate("/app", { replace: true });
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F3F4ED] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111] mx-auto mb-4" />
        <p className="font-barlow text-[14px] text-[#111]/60">
          Completing sign in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
