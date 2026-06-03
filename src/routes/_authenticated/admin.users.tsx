import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/site/Navbar";
import { toast } from "sonner";
import { ShieldCheck, User as UserIcon, ArrowRight } from "lucide-react";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "إدارة المستخدمين | الأدمن" }] }),
  component: AdminUsers,
});

type Profile = { id: string; full_name: string | null; email: string | null; phone: string | null; created_at: string };
type RoleRow = { user_id: string; role: "admin" | "marketer" | "user" };

function AdminUsers() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: rs }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email,phone,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setRows((profiles as Profile[]) ?? []);
    const map: Record<string, Set<string>> = {};
    ((rs as RoleRow[]) ?? []).forEach((r) => { (map[r.user_id] ||= new Set()).add(r.role); });
    setRoles(map);
    setLoading(false);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const promote = async (uid: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("تمت الترقية لأدمن"); load();
  };
  const demote = async (uid: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    if (error) return toast.error(error.message);
    await logAudit("role_revoke", "user", uid, { role: "admin" });
    toast.success("تم الإلغاء"); load();
  };
  const toggleMarketer = async (uid: string, isMkt: boolean) => {
    if (isMkt) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "marketer");
      if (error) return toast.error(error.message);
      await logAudit("role_revoke", "user", uid, { role: "marketer" });
      toast.success("تم إلغاء صلاحية المسوّق");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "marketer" });
      if (error) return toast.error(error.message);
      await logAudit("role_grant", "user", uid, { role: "marketer" });
      toast.success("تم منح صلاحية المسوّق");
    }
    load();
  };

  if (authLoading) return null;
  if (!isAdmin) return <div className="min-h-screen"><Navbar /><div className="pt-40 text-center"><h1 className="text-2xl text-gold-gradient">صلاحية أدمن مطلوبة</h1></div></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 mx-auto max-w-6xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold mb-4">العودة <ArrowRight size={14} /></Link>
        <h1 className="font-display text-3xl text-gold-gradient font-semibold mb-8">إدارة المستخدمين</h1>
        {loading ? <div className="text-muted-foreground">جارٍ التحميل...</div> : (
          <div className="grid gap-3">
            {rows.map((u) => {
              const isA = roles[u.id]?.has("admin");
              return (
                <div key={u.id} className="rounded-2xl glass p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full grid place-items-center glass-strong text-gold">
                      {isA ? <ShieldCheck size={18} /> : <UserIcon size={18} />}
                    </div>
                    <div>
                      <div className="font-medium">{u.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email} {u.phone ? `· ${u.phone}` : ""}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(() => { const isM = roles[u.id]?.has("marketer"); return (
                    <span className={`rounded-full px-3 py-1 text-[11px] ${isA ? "bg-amber-500/20 text-amber-400" : isM ? "bg-emerald-600/20 text-emerald-400" : "bg-muted/40 text-muted-foreground"}`}>{isA ? "أدمن" : isM ? "مسوّق" : "مستخدم"}</span>
                    ); })()}
                    <button onClick={() => toggleMarketer(u.id, !!roles[u.id]?.has("marketer"))} className={`rounded-full px-3 py-1.5 text-xs ${roles[u.id]?.has("marketer") ? "bg-red-600/20 text-red-400" : "bg-emerald-600/20 text-emerald-400"} hover:opacity-80`}>
                      {roles[u.id]?.has("marketer") ? "إلغاء المسوّق" : "ترقية لمسوّق"}
                    </button>
                    {isA
                      ? <button onClick={() => demote(u.id)} className="rounded-full px-3 py-1.5 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30">إلغاء الأدمن</button>
                      : <button onClick={() => promote(u.id)} className="rounded-full px-3 py-1.5 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30">ترقية لأدمن</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}