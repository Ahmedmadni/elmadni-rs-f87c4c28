import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/site/Navbar";
import { toast } from "sonner";
import { LogOut, Plus, Home, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "لوحة التحكم | مدني العقارية" }] }),
  component: DashboardPage,
});

type Prop = { id: string; title: string; price: string; review_status: string; rejection_reason: string | null; code: string };

function DashboardPage() {
  const { user, isAdmin, signOut } = useAuth();
  const [mine, setMine] = useState<Prop[]>([]);
  const [pending, setPending] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: m } = await supabase
      .from("properties")
      .select("id,title,price,review_status,rejection_reason,code")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setMine((m as Prop[]) ?? []);
    if (isAdmin) {
      const { data: p } = await supabase
        .from("properties")
        .select("id,title,price,review_status,rejection_reason,code")
        .eq("review_status", "pending")
        .order("created_at", { ascending: false });
      setPending((p as Prop[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id, isAdmin]);

  const approve = async (id: string) => {
    const { error } = await supabase.from("properties").update({ review_status: "approved", published: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تمت الموافقة"); load();
  };
  const reject = async (id: string) => {
    const reason = window.prompt("سبب الرفض؟") ?? "";
    const { error } = await supabase.from("properties").update({ review_status: "rejected", rejection_reason: reason, published: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الرفض"); load();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف العقار؟")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف"); load();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl text-gold-gradient font-semibold">
              {isAdmin ? "لوحة تحكم الأدمن" : "لوحة تحكمي"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/sell" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
              <Plus size={16} /> إضافة عقار
            </Link>
            <button onClick={() => signOut()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm glass hover:text-gold">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>

        {isAdmin && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-gold" />
              <h2 className="text-lg font-semibold">عقارات قيد المراجعة ({pending.length})</h2>
            </div>
            <PropList items={pending} loading={loading} renderActions={(p) => (
              <>
                <button onClick={() => approve(p.id)} className="rounded-full px-3 py-1.5 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30">موافقة</button>
                <button onClick={() => reject(p.id)} className="rounded-full px-3 py-1.5 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30">رفض</button>
              </>
            )} />
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Home size={18} className="text-gold" />
            <h2 className="text-lg font-semibold">عقاراتي ({mine.length})</h2>
          </div>
          <PropList items={mine} loading={loading} renderActions={(p) => (
            <>
              <span className={`rounded-full px-3 py-1 text-[11px] ${p.review_status === "approved" ? "bg-emerald-600/20 text-emerald-400" : p.review_status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-600/20 text-red-400"}`}>
                {p.review_status === "approved" ? "موافق عليه" : p.review_status === "pending" ? "قيد المراجعة" : "مرفوض"}
              </span>
              {(p.review_status === "pending" || isAdmin) && (
                <button onClick={() => remove(p.id)} className="rounded-full px-3 py-1.5 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30">حذف</button>
              )}
            </>
          )} />
        </section>
      </div>
    </div>
  );
}

function PropList({ items, loading, renderActions }: { items: Prop[]; loading: boolean; renderActions: (p: Prop) => React.ReactNode }) {
  if (loading) return <div className="text-muted-foreground text-sm">جارٍ التحميل...</div>;
  if (items.length === 0) return <div className="rounded-2xl glass p-8 text-center text-muted-foreground text-sm">لا يوجد عناصر.</div>;
  return (
    <div className="grid gap-3">
      {items.map((p) => (
        <div key={p.id} className="rounded-2xl glass p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-medium">{p.title} <span className="text-xs text-muted-foreground">#{p.code}</span></div>
            <div className="text-sm text-gold-gradient">{p.price}</div>
            {p.rejection_reason && <div className="text-xs text-red-400 mt-1">سبب الرفض: {p.rejection_reason}</div>}
          </div>
          <div className="flex gap-2 items-center">{renderActions(p)}</div>
        </div>
      ))}
    </div>
  );
}