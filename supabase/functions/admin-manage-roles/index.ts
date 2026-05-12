import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Action =
  | { type: "list"; search?: string }
  | { type: "grant"; email: string; password?: string }
  | { type: "revoke"; user_id: string; password?: string };

// Mutations require a password reauth performed within this window.
const REAUTH_MAX_AGE_MS = 5 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = (await req.json().catch(() => ({}))) as Action;

    // Reauth helper: require the admin's current password for any mutation,
    // OR a session that was issued within REAUTH_MAX_AGE_MS.
    const requireReauth = async (password?: string) => {
      const issuedAtSec = (userData.user as unknown as { last_sign_in_at?: string })
        .last_sign_in_at;
      const sessionFresh =
        issuedAtSec &&
        Date.now() - new Date(issuedAtSec).getTime() < REAUTH_MAX_AGE_MS;

      if (sessionFresh && !password) return null;

      if (!password) {
        return json(
          { error: "reauth_required", message: "Please confirm your password." },
          401,
        );
      }
      const email = userData.user.email;
      if (!email) return json({ error: "Account has no email" }, 400);

      const verify = createClient(supabaseUrl, anonKey);
      const { error: signErr } = await verify.auth.signInWithPassword({
        email,
        password,
      });
      if (signErr) {
        return json(
          { error: "invalid_password", message: "Incorrect password." },
          401,
        );
      }
      return null;
    };


    if (body.type === "list") {
      const search = (body.search ?? "").trim().toLowerCase();
      let q = admin
        .from("profiles")
        .select("id, email, display_name, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (search) q = q.ilike("email", `%${search}%`);
      const { data: profiles, error: pErr } = await q;
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await admin
        .from("user_roles")
        .select("user_id, role");
      if (rErr) throw rErr;

      const roleMap = new Map<string, string[]>();
      for (const r of roles ?? []) {
        const arr = roleMap.get(r.user_id) ?? [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      }

      const users = (profiles ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        created_at: p.created_at,
        roles: roleMap.get(p.id) ?? [],
      }));
      return json({ users });
    }

    if (body.type === "grant") {
      const reauthErr = await requireReauth(body.password);
      if (reauthErr) return reauthErr;
      const email = body.email?.trim().toLowerCase();
      if (!email) return json({ error: "Email required" }, 400);
      const { data: profile, error: pErr } = await admin
        .from("profiles")
        .select("id, email")
        .ilike("email", email)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!profile) return json({ error: "No user found with that email" }, 404);

      const { error: insErr } = await admin
        .from("user_roles")
        .insert({ user_id: profile.id, role: "admin" });
      // Ignore unique violation
      if (insErr && !String(insErr.message).includes("duplicate")) throw insErr;
      return json({ ok: true, user_id: profile.id, email: profile.email });
    }

    if (body.type === "revoke") {
      if (!body.user_id) return json({ error: "user_id required" }, 400);
      if (body.user_id === userData.user.id) {
        return json({ error: "You cannot revoke your own admin role" }, 400);
      }
      const { error: delErr } = await admin
        .from("user_roles")
        .delete()
        .eq("user_id", body.user_id)
        .eq("role", "admin");
      if (delErr) throw delErr;
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
