import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/site/Navbar";
import { ArrowRight, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "سجلّ العمليات | الأدمن" }] }),
  component: AdminAudit,
});

type Row = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

const actionLabel: Record<string, string> = {
  approve: "اعتماد",
  reject: "رفض",
  delete: "حذف",
  role_grant: "منح دور",
  role_revoke: "إلغاء دور",
};

function AdminAudit() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <div className="min-h-screen"><Navbar /><div className="pt-40 text-center"><h1 className="text-2xl text-gold-gradient">صلاحية أدمن مطلوبة</h1></div></div>;

  const filtered = rows.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.action.toLowerCase().includes(q) || r.entity_type.toLowerCase().includes(q) || (r.entity_id ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 mx-auto max-w-6xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold mb-4">العودة <ArrowRight size={14} /></Link>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-gold" size={20} />
          <h1 className="font-display text-3xl text-gold-gradient font-semibold">سجلّ العمليات</h1>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بنوع العملية أو الكيان..."
          className="w-full max-w-md rounded-full glass px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold mb-6"
        />
        {loading ? <div className="text-muted-foreground">جارٍ التحميل...</div> : (
          <div className="grid gap-2">
            {filtered.length === 0 && <div className="rounded-2xl glass p-8 text-center text-muted-foreground text-sm">لا توجد سجلات.</div>}
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl glass p-3 text-xs flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-1 bg-gold/10 text-gold font-medium">{actionLabel[r.action] || r.action}</span>
                  <span className="text-muted-foreground">{r.entity_type}</span>
                  {r.entity_id && <span className="font-mono text-[10px] opacity-60">#{r.entity_id.slice(0, 8)}</span>}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  {r.details && <span className="font-mono opacity-70">{JSON.stringify(r.details)}</span>}
                  <span>{new Date(r.created_at).toLocaleString("ar-EG")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}