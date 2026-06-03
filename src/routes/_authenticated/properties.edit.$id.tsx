import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/site/Navbar";
import { toast } from "sonner";
import { Loader2, Save, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/properties/edit/$id")({
  head: () => ({ meta: [{ title: "تعديل عقار | مدني العقارية" }] }),
  component: EditPropertyPage,
});

const TYPES = ["شقة", "بيت", "فيلا", "تاون هاوس", "أرض", "مكتب", "محل", "شاليه"];
const STATUSES = ["للبيع", "للإيجار"];

function EditPropertyPage() {
  const { id } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [denied, setDenied] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error(error?.message ?? "غير موجود"); setLoading(false); return; }
      const isOwner = data.owner_id === user.id && data.review_status === "pending";
      if (!isOwner && !isAdmin) { setDenied(true); setLoading(false); return; }
      setForm({
        title: data.title ?? "", type: data.type ?? "شقة", status: data.status ?? "للبيع",
        price: data.price ?? "", area: data.area ?? "",
        bedrooms: String(data.bedrooms ?? 0), bathrooms: String(data.bathrooms ?? 0),
        rooms: String(data.rooms ?? 0),
        city: data.city ?? "", district: data.district ?? "", address: data.address ?? "",
        location: data.location ?? "",
        description_full: data.description_full ?? data.description ?? "",
        contact_name: data.contact_name ?? "", contact_phone: data.contact_phone ?? "",
      });
      setLoading(false);
    })();
  }, [id, user, isAdmin]);

  const set = (k: string) => (v: string) => setForm((s) => ({ ...s, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("properties").update({
      title: form.title, type: form.type, status: form.status, price: form.price,
      area: form.area || null,
      rooms: Number(form.rooms) || Number(form.bedrooms) || 0,
      bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0,
      city: form.city || null, district: form.district || null, address: form.address || null,
      location: form.location || [form.district, form.city].filter(Boolean).join("، ") || null,
      description_full: form.description_full || null,
      contact_name: form.contact_name || null, contact_phone: form.contact_phone || null,
    }).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ");
    navigate({ to: "/dashboard" });
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="pt-40 text-center text-muted-foreground">جارٍ التحميل...</div></div>;
  if (denied) return <div className="min-h-screen"><Navbar /><div className="pt-40 text-center"><h1 className="text-2xl text-gold-gradient mb-3">لا تملك صلاحية التعديل</h1><Link to="/dashboard" className="text-gold hover:underline">العودة للوحة التحكم</Link></div></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 mx-auto max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold mb-6">العودة <ArrowRight size={14} /></Link>
        <h1 className="font-display text-3xl text-gold-gradient font-semibold mb-8">تعديل العقار</h1>
        <form onSubmit={save} className="rounded-3xl glass-strong p-6 sm:p-10 grid gap-5 md:grid-cols-2 luxe-shadow">
          <div className="md:col-span-2"><F label="العنوان" v={form.title} on={set("title")} /></div>
          <Sel label="النوع" v={form.type} on={set("type")} opts={TYPES} />
          <Sel label="الحالة" v={form.status} on={set("status")} opts={STATUSES} />
          <F label="السعر" v={form.price} on={set("price")} />
          <F label="المساحة" v={form.area} on={set("area")} />
          <F label="غرف النوم" v={form.bedrooms} on={set("bedrooms")} />
          <F label="الحمامات" v={form.bathrooms} on={set("bathrooms")} />
          <F label="المدينة" v={form.city} on={set("city")} />
          <F label="الحي" v={form.district} on={set("district")} />
          <div className="md:col-span-2"><F label="العنوان التفصيلي" v={form.address} on={set("address")} /></div>
          <F label="اسم التواصل" v={form.contact_name} on={set("contact_name")} />
          <F label="رقم التواصل" v={form.contact_phone} on={set("contact_phone")} dir="ltr" />
          <div className="md:col-span-2"><F label="الوصف" v={form.description_full} on={set("description_full")} textarea /></div>
          <div className="md:col-span-2 flex justify-end">
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60" style={{ background: "var(--gradient-gold)" }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function F({ label, v, on, textarea, dir }: { label: string; v: string; on: (s: string) => void; textarea?: boolean; dir?: string }) {
  const cls = "w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60";
  return (
    <label className="block">
      <span className="text-sm text-gold">{label}</span>
      <div className="mt-2 rounded-2xl glass px-4 py-3">
        {textarea
          ? <textarea dir={dir} value={v} onChange={(e) => on(e.target.value)} className={cls + " min-h-[120px] resize-none"} />
          : <input dir={dir} value={v} onChange={(e) => on(e.target.value)} className={cls} />}
      </div>
    </label>
  );
}
function Sel({ label, v, on, opts }: { label: string; v: string; on: (s: string) => void; opts: string[] }) {
  return (
    <label className="block">
      <span className="text-sm text-gold">{label}</span>
      <div className="mt-2 rounded-2xl glass px-4 py-3">
        <select value={v} onChange={(e) => on(e.target.value)} className="w-full bg-transparent outline-none">
          {opts.map((o) => <option key={o} value={o} className="bg-background">{o}</option>)}
        </select>
      </div>
    </label>
  );
}