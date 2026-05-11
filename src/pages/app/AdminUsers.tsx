import { useCallback, useEffect, useState } from "react";
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

const AdminUsers = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [grantEmail, setGrantEmail] = useState("");
  const [granting, setGranting] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

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

  const grant = async () => {
    const email = grantEmail.trim();
    if (!email) return;
    setGranting(true);
    const { data, error } = await supabase.functions.invoke("admin-manage-roles", {
      body: { type: "grant", email },
    });
    setGranting(false);
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Failed to grant");
      return;
    }
    toast.success(`Admin granted to ${data.email}`);
    setGrantEmail("");
    load(search);
  };

  const revoke = async (u: UserRow) => {
    if (u.id === user?.id) {
      toast.error("You cannot revoke your own admin role.");
      return;
    }
    if (!confirm(`Revoke admin from ${u.email ?? u.id}?`)) return;
    setPendingId(u.id);
    const { error, data } = await supabase.functions.invoke("admin-manage-roles", {
      body: { type: "revoke", user_id: u.id },
    });
    setPendingId(null);
    if (error || data?.error) {
      toast.error(error?.message ?? data?.error ?? "Failed to revoke");
      return;
    }
    toast.success("Admin revoked");
    load(search);
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
                onClick={grant}
                disabled={granting || !grantEmail.trim()}
                className="rounded-full bg-[#111] text-white px-6 py-2.5 font-barlow text-[14px] font-medium hover:bg-black disabled:opacity-50 transition-colors"
              >
                {granting ? "Granting…" : "Grant admin"}
              </button>
            </div>
            <p className="font-barlow text-[12px] text-[#111]/50 mt-2">
              The user must already have an account.
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
                          onClick={() => revoke(u)}
                          className="rounded-full border border-black/15 px-3 py-1 font-barlow text-[12px] hover:bg-black/5 disabled:opacity-40"
                          title={self ? "You can't revoke your own admin role" : ""}
                        >
                          {pendingId === u.id ? "…" : "Revoke"}
                        </button>
                      ) : (
                        <button
                          disabled={pendingId === u.id}
                          onClick={async () => {
                            setPendingId(u.id);
                            const { error, data } = await supabase.functions.invoke(
                              "admin-manage-roles",
                              { body: { type: "grant", email: u.email } },
                            );
                            setPendingId(null);
                            if (error || data?.error) {
                              toast.error(error?.message ?? data?.error ?? "Failed");
                              return;
                            }
                            toast.success("Admin granted");
                            load(search);
                          }}
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
    </AppShell>
  );
};

export default AdminUsers;
