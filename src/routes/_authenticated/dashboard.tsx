import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/site/Navbar";
import { toast } from "sonner";
import { LogOut, Plus, Home, ShieldCheck, Users, Inbox, Pencil, Bell, Search, FileText } from "lucide-react";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "لوحة التحكم | مدني العقارية" }] }),
  component: DashboardPage,
});

type Prop = { id: string; title: string; price: string; review_status: string; rejection_reason: string | null; code: string };
type Notif = { id: string; title: string; body: string | null; read: boolean; link: string | null; created_at: string };

function DashboardPage() {
  const { user, isAdmin, role, signOut } = useAuth();
  const [mine, setMine] = useState<Prop[]>([]);
  const [pending, setPending] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, users: 0, marketers: 0 });
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

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
      const [allCount, apr, pen, rej, profCount, mkts] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("review_status", "approved"),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("review_status", "pending"),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("review_status", "rejected"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "marketer"),
      ]);
      setStats({
        total: allCount.count ?? 0,
        approved: apr.count ?? 0,
        pending: pen.count ?? 0,
        rejected: rej.count ?? 0,
        users: profCount.count ?? 0,
        marketers: mkts.count ?? 0,
      });
    }
    const { data: nd } = await supabase
      .from("notifications")
      .select("id,title,body,read,link,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifs((nd as Notif[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id, isAdmin]);

  const approve = async (id: string) => {
    const { error } = await supabase.from("properties").update({ review_status: "approved", published: true }).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("approve", "property", id);
    toast.success("تمت الموافقة"); load();
  };
  const reject = async (id: string) => {
    const reason = window.prompt("سبب الرفض؟") ?? "";
    const { error } = await supabase.from("properties").update({ review_status: "rejected", rejection_reason: reason, published: false }).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("reject", "property", id, { reason });
    toast.success("تم الرفض"); load();
  };
  const remove = async (id: string) => {
    if (!confirm("حذف العقار؟")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "property", id);
    toast.success("تم الحذف"); load();
  };

  const markAllRead = async () => {
    if (!user) return;
    const ids = notifs.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ read: true }).in("id", ids);
    setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;
  const filterFn = (p: Prop) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.price.toLowerCase().includes(q);
  };
  const roleLabel = role === "admin" ? "أدمن" : role === "marketer" ? "مسوّق" : "مستخدم";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl text-gold-gradient font-semibold">
              {isAdmin ? "لوحة تحكم الأدمن" : "لوحة تحكمي"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.email} · <span className="text-gold">{roleLabel}</span></p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative">
              <button onClick={() => setNotifOpen((v) => !v)} className="relative h-10 w-10 grid place-items-center rounded-full glass hover:text-gold" aria-label="الإشعارات">
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] grid place-items-center text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-auto rounded-2xl glass-strong p-3 z-50 luxe-shadow">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="text-sm font-semibold">الإشعارات</div>
                    {unreadCount > 0 && <button onClick={markAllRead} className="text-[11px] text-gold hover:underline">تعليم الكل مقروء</button>}
                  </div>
                  {notifs.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-4 text-center">لا توجد إشعارات</div>
                  ) : notifs.map((n) => (
                    <div key={n.id} className={`p-2 rounded-lg text-xs mb-1 ${n.read ? "opacity-60" : "bg-gold/5"}`}>
                      <div className="font-medium">{n.title}</div>
                      {n.body && <div className="text-muted-foreground mt-0.5">{n.body}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link to="/sell" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
              <Plus size={16} /> إضافة عقار
            </Link>
            <Link to="/admin/requests" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm glass hover:text-gold">
              <Inbox size={16} /> طلبات الشراء
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin/users" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm glass hover:text-gold">
                  <Users size={16} /> المستخدمون
                </Link>
                <Link to="/admin/audit" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm glass hover:text-gold">
                  <FileText size={16} /> السجل
                </Link>
              </>
            )}
            <button onClick={() => signOut()} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm glass hover:text-gold">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { label: "الإجمالي", value: stats.total },
              { label: "معتمد", value: stats.approved },
              { label: "قيد المراجعة", value: stats.pending },
              { label: "مرفوض", value: stats.rejected },
              { label: "المستخدمون", value: stats.users },
              { label: "المسوّقون", value: stats.marketers },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl glass p-4">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-bold text-gold-gradient mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="relative mb-6 max-w-md">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالعنوان أو الكود أو السعر..."
            className="w-full rounded-full glass pr-9 pl-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        {isAdmin && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-gold" />
              <h2 className="text-lg font-semibold">عقارات قيد المراجعة ({pending.filter(filterFn).length})</h2>
            </div>
            <PropList items={pending.filter(filterFn)} loading={loading} renderActions={(p) => (
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
            <h2 className="text-lg font-semibold">عقاراتي ({mine.filter(filterFn).length})</h2>
          </div>
          <PropList items={mine.filter(filterFn)} loading={loading} renderActions={(p) => (
            <>
              <span className={`rounded-full px-3 py-1 text-[11px] ${p.review_status === "approved" ? "bg-emerald-600/20 text-emerald-400" : p.review_status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-600/20 text-red-400"}`}>
                {p.review_status === "approved" ? "موافق عليه" : p.review_status === "pending" ? "قيد المراجعة" : "مرفوض"}
              </span>
              {(p.review_status === "pending" || isAdmin) && (
                <Link to="/properties/edit/$id" params={{ id: p.id }} className="rounded-full px-3 py-1.5 text-xs glass hover:text-gold inline-flex items-center gap-1"><Pencil size={12} /> تعديل</Link>
              )}
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