import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AppShell from "@/components/app/AppShell";
import GlassCard from "@/components/app/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type UserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  roles: string[];
};

type PendingAction =
  | { type: "grant"; email: string; label: string }
  | { type: "revoke"; user_id: string; label: string };

const REAUTH_TTL_MS = 5 * 60 * 1000;

const AdminUsers = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [grantEmail, setGrantEmail] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Reauth modal state
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const reauthCachedAt = useRef<number>(0);
  const reauthCachedPwd = useRef<string>("");

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user]);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-manage-roles", {
      body: { type: "list", search: q },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Failed to load users");
      return;
    }
    setUsers((data?.users ?? []) as UserRow[]);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [isAdmin, search, load]);

  if (authLoading || isAdmin === null) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto" />
      </AppShell>
    );
  }
  if (!isAdmin) return <Navigate to="/app" replace />;

  // Run a mutation, transparently injecting cached password if recent.
  const runMutation = async (
    action: PendingAction,
    pwd?: string,
  ): Promise<{ ok: boolean; needsReauth?: boolean; error?: string }> => {
    const body: Record<string, unknown> =
      action.type === "grant"
        ? { type: "grant", email: action.email }
        : { type: "revoke", user_id: action.user_id };
    if (pwd) body.password = pwd;

    const { data, error } = await supabase.functions.invoke("admin-manage-roles", {
      body,
    });
    const errCode = (data?.error as string | undefined) ?? undefined;
    if (errCode === "reauth_required" || errCode === "invalid_password") {
      return { ok: false, needsReauth: true, error: data?.message };
    }
    if (error || data?.error) {
      return { ok: false, error: error?.message ?? data?.error ?? "Failed" };
    }
    return { ok: true };
  };

  const startAction = async (action: PendingAction) => {
    const cacheFresh =
      reauthCachedPwd.current &&
      Date.now() - reauthCachedAt.current < REAUTH_TTL_MS;

    if (action.type === "revoke") setPendingId(action.user_id);
    const res = await runMutation(
      action,
      cacheFresh ? reauthCachedPwd.current : undefined,
    );
    if (res.ok) {
      setPendingId(null);
      toast.success(action.type === "grant" ? "Admin granted" : "Admin revoked");
      if (action.type === "grant") setGrantEmail("");
      load(search);
      return;
    }
    if (res.needsReauth) {
      // Cached password no longer valid
      reauthCachedPwd.current = "";
      setPendingId(null);
      setPassword("");
      setPendingAction(action);
      return;
    }
    setPendingId(null);
    toast.error(res.error ?? "Failed");
  };

  const confirmReauth = async () => {
    if (!pendingAction || !password) return;
    setConfirming(true);
    const res = await runMutation(pendingAction, password);
    setConfirming(false);
    if (res.ok) {
      reauthCachedPwd.current = password;
      reauthCachedAt.current = Date.now();
      toast.success(
        pendingAction.type === "grant" ? "Admin granted" : "Admin revoked",
      );
      if (pendingAction.type === "grant") setGrantEmail("");
      setPendingAction(null);
      setPassword("");
      load(search);
      return;
    }
    if (res.needsReauth) {
      toast.error(res.error ?? "Incorrect password.");
      return;
    }
    toast.error(res.error ?? "Failed");
    setPendingAction(null);
  };

  const requestGrantByEmail = () => {
    const email = grantEmail.trim();
    if (!email) return;
    startAction({ type: "grant", email, label: email });
  };

  const requestRowGrant = (u: UserRow) => {
    if (!u.email) {
      toast.error("User has no email on file.");
      return;
    }
    setPendingId(u.id);
    startAction({ type: "grant", email: u.email, label: u.email });
  };

  const requestRevoke = (u: UserRow) => {
    if (u.id === user?.id) {
      toast.error("You cannot revoke your own admin role.");
      return;
    }
    if (!confirm(`Revoke admin from ${u.email ?? u.id}?`)) return;
    startAction({ type: "revoke", user_id: u.id, label: u.email ?? u.id });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50">
              ( Admin · Roles )
            </p>
            <Link
              to="/app/admin/analytics"
              className="font-barlow text-[13px] text-[#111]/60 hover:text-[#111] underline"
            >
              Analytics →
            </Link>
          </div>
          <h1 className="font-instrument text-[44px] md:text-[56px] leading-[1.05] mb-8">
            Admin <span className="italic">access</span>
          </h1>

          <GlassCard className="p-5 md:p-6 mb-6">
            <p className="font-barlow text-[13px] uppercase tracking-[0.15em] text-[#111]/50 mb-3">
              Grant admin by email
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 rounded-full bg-white/80 border border-black/10 px-5 py-2.5 font-barlow text-[14px] focus:outline-none focus:border-black/40"
              />
              <button
                onClick={requestGrantByEmail}
                disabled={!grantEmail.trim()}
                className="rounded-full bg-[#111] text-white px-6 py-2.5 font-barlow text-[14px] font-medium hover:bg-black disabled:opacity-50 transition-colors"
              >
                Grant admin
              </button>
            </div>
            <p className="font-barlow text-[12px] text-[#111]/50 mt-2">
              You'll be asked to re-confirm your password. The user must already have an account.
            </p>
          </GlassCard>

          <GlassCard className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="font-barlow text-[13px] uppercase tracking-[0.15em] text-[#111]/50">
                Users {loading && <span className="normal-case tracking-normal text-[#111]/40">· loading…</span>}
              </p>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email"
                className="w-56 rounded-full bg-white/80 border border-black/10 px-4 py-1.5 font-barlow text-[13px] focus:outline-none focus:border-black/40"
              />
            </div>

            <div className="divide-y divide-black/5">
              {users.length === 0 && !loading && (
                <p className="font-barlow text-[14px] text-[#111]/50 py-6 text-center">
                  No users found.
                </p>
              )}
              {users.map((u) => {
                const isUserAdmin = u.roles.includes("admin");
                const self = u.id === user?.id;
                return (
                  <div
                    key={u.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-barlow text-[14px] font-medium truncate">
                        {u.email ?? "(no email)"}{" "}
                        {self && (
                          <span className="font-normal text-[#111]/50">(you)</span>
                        )}
                      </p>
                      <p className="font-barlow text-[12px] text-[#111]/50 truncate">
                        {u.display_name ? `${u.display_name} · ` : ""}
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isUserAdmin && (
                        <span className="rounded-full bg-[#111] text-white px-2.5 py-0.5 font-barlow text-[11px]">
                          admin
                        </span>
                      )}
                      {isUserAdmin ? (
                        <button
                          disabled={self || pendingId === u.id}
                          onClick={() => requestRevoke(u)}
                          className="rounded-full border border-black/15 px-3 py-1 font-barlow text-[12px] hover:bg-black/5 disabled:opacity-40"
                          title={self ? "You can't revoke your own admin role" : ""}
                        >
                          {pendingId === u.id ? "…" : "Revoke"}
                        </button>
                      ) : (
                        <button
                          disabled={pendingId === u.id}
                          onClick={() => requestRowGrant(u)}
                          className="rounded-full bg-[#111] text-white px-3 py-1 font-barlow text-[12px] hover:bg-black disabled:opacity-50"
                        >
                          {pendingId === u.id ? "…" : "Make admin"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Reauth modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#f6f4ef] rounded-2xl border border-black/10 max-w-md w-full p-6 shadow-xl"
          >
            <p className="font-barlow text-[12px] uppercase tracking-[0.2em] text-[#111]/50 mb-2">
              Confirm your password
            </p>
            <h2 className="font-instrument text-[26px] leading-tight mb-3">
              {pendingAction.type === "grant" ? "Grant admin to" : "Revoke admin from"}{" "}
              <span className="italic">{pendingAction.label}</span>
            </h2>
            <p className="font-barlow text-[13px] text-[#111]/60 mb-4">
              For your account's security, please re-enter your password to confirm this
              admin role change.
            </p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmReauth()}
              placeholder="Your password"
              className="w-full rounded-xl bg-white border border-black/15 px-4 py-2.5 font-barlow text-[14px] focus:outline-none focus:border-black/40 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setPendingAction(null);
                  setPassword("");
                }}
                disabled={confirming}
                className="rounded-full border border-black/15 px-4 py-2 font-barlow text-[13px] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmReauth}
                disabled={confirming || !password}
                className="rounded-full bg-[#111] text-white px-5 py-2 font-barlow text-[13px] font-medium hover:bg-black disabled:opacity-50"
              >
                {confirming ? "Confirming…" : "Confirm"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
};

export default AdminUsers;
