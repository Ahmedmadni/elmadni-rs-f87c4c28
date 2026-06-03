import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/site/Navbar";
import { toast } from "sonner";
import { ArrowRight, Trash2, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  head: () => ({ meta: [{ title: "طلبات الشراء | الأدمن" }] }),
  component: AdminRequests,
});

type Req = {
  id: string; property_id: string; buyer_name: string; buyer_phone: string;
  buyer_email: string | null; message: string | null; status: string; created_at: string;
};

function AdminRequests() {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Req[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    // RLS will scope: admin sees all; owner sees own
    const { data, error } = await supabase
      .from("purchase_requests")
      .select("id,property_id,buyer_name,buyer_phone,buyer_email,message,status,created_at")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const reqs = (data as Req[]) ?? [];
    setRows(reqs);
    const ids = [...new Set(reqs.map((r) => r.property_id))];
    if (ids.length) {
      const { data: props } = await supabase.from("properties").select("id,title,code").in("id", ids);
      const map: Record<string, string> = {};
      (props ?? []).forEach((p) => { map[p.id] = `${p.title} (#${p.code})`; });
      setTitles(map);
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("purchase_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم التحديث"); load();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف الطلب؟")) return;
    const { error } = await supabase.from("purchase_requests").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف"); load();
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 mx-auto max-w-6xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold mb-4">العودة <ArrowRight size={14} /></Link>
        <h1 className="font-display text-3xl text-gold-gradient font-semibold mb-8">{isAdmin ? "طلبات الشراء — كل الطلبات" : "طلبات الشراء على عقاراتي"}</h1>
        {loading ? <div className="text-muted-foreground">جارٍ التحميل...</div>
         : rows.length === 0 ? <div className="rounded-2xl glass p-8 text-center text-muted-foreground">لا توجد طلبات.</div>
         : (
          <div className="grid gap-3">
            {rows.map((r) => (
              <div key={r.id} className="rounded-2xl glass p-4 flex flex-wrap gap-3 justify-between">
                <div>
                  <div className="font-medium">{r.buyer_name} <span className="text-xs text-muted-foreground">· {r.buyer_phone}</span></div>
                  <div className="text-xs text-muted-foreground">{r.buyer_email}</div>
                  <Link to="/properties/$id" params={{ id: r.property_id }} className="text-xs text-gold hover:underline">{titles[r.property_id] ?? r.property_id}</Link>
                  {r.message && <div className="text-sm text-foreground/85 mt-1">{r.message}</div>}
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString("ar-EG")}</div>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="rounded-full px-3 py-1 text-[11px] bg-amber-500/20 text-amber-400">{r.status}</span>
                  {r.status !== "done" && <button onClick={() => setStatus(r.id, "done")} className="rounded-full px-3 py-1.5 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 inline-flex items-center gap-1"><CheckCheck size={12} /> تم</button>}
                  {isAdmin && <button onClick={() => remove(r.id)} className="rounded-full px-3 py-1.5 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 inline-flex items-center gap-1"><Trash2 size={12} /> حذف</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}