import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "./index";
import { UploadCloud, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "اعرض عقارك | مدني العقارية" },
      { name: "description", content: "اعرض عقارك على أرقى منصة عقارية في مصر بصور وفيديوهات احترافية." },
      { property: "og:title", content: "اعرض عقارك | مدني العقارية" },
      { property: "og:description", content: "بوابة البائع — تسويق احترافي وإدارة كاملة." },
    ],
  }),
  component: SellPage,
});

const TYPES = ["شقة", "بيت", "فيلا", "تاون هاوس", "أرض", "مكتب", "محل", "شاليه"] as const;
const PURPOSES = ["للبيع", "للإيجار"] as const;

function SellPage() {
  const { user, isAuthenticated, loading, canPublish } = useAuth();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    title: "",
    type: "شقة",
    purpose: "للبيع",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    city: "",
    district: "",
    address: "",
    description_full: "",
    contact_name: "",
    contact_phone: "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((s) => ({ ...s, [k]: v }));

  if (loading) return null;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-40 pb-20 px-6 text-center">
          <h1 className="font-display text-3xl text-gold-gradient mb-3">سجّل دخولك لعرض عقارك</h1>
          <p className="text-muted-foreground mb-6">يلزم حساب للنشر وإدارة عقاراتك.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="rounded-full px-6 py-2.5 text-sm text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>تسجيل الدخول</Link>
            <Link to="/signup" className="rounded-full px-6 py-2.5 text-sm glass hover:text-gold">إنشاء حساب</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  if (!canPublish) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-40 pb-20 px-6 text-center max-w-xl mx-auto">
          <h1 className="font-display text-3xl text-gold-gradient mb-3">حساب مسوّق مطلوب</h1>
          <p className="text-muted-foreground mb-6">نشر العقارات متاح للمسوّقين والإدارة فقط. تواصل مع الإدارة لترقية حسابك.</p>
          <Link to="/dashboard" className="rounded-full px-6 py-2.5 text-sm glass hover:text-gold">لوحة التحكم</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    const incoming = Array.from(list);
    const valid: File[] = [];
    for (const f of incoming) {
      if (!ALLOWED_MIME.includes(f.type)) {
        toast.error(`نوع الملف غير مدعوم: ${f.name}`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`الملف أكبر من 10MB: ${f.name}`);
        continue;
      }
      valid.push(f);
    }
    const next = [...files, ...valid].slice(0, 12);
    setFiles(next);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title || !form.price || !form.contact_phone) {
      toast.error("يرجى تعبئة الحقول الأساسية");
      return;
    }
    setSubmitting(true);
    try {
      const code = "MAD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data: ins, error } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          code,
          title: form.title,
          type: form.type,
          status: form.purpose,
          purpose: form.purpose === "للبيع" ? "sale" : "rent",
          price: form.price,
          area: form.area || null,
          rooms: Number(form.bedrooms) || 0,
          bedrooms: Number(form.bedrooms) || 0,
          bathrooms: Number(form.bathrooms) || 0,
          city: form.city || null,
          district: form.district || null,
          address: form.address || null,
          location: [form.district, form.city].filter(Boolean).join("، ") || null,
          description: form.description_full.slice(0, 200) || null,
          description_full: form.description_full || null,
          contact_name: form.contact_name || null,
          contact_phone: form.contact_phone,
          review_status: "pending",
          published: false,
          images: [],
        })
        .select("id")
        .single();
      if (error) throw error;
      const propertyId = ins!.id as string;

      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!ALLOWED_MIME.includes(f.type)) {
          toast.error(`تم تخطّي ملف غير صورة: ${f.name}`);
          continue;
        }
        const extByMime: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/gif": "gif",
        };
        const ext = extByMime[f.type] ?? "jpg";
        const path = `${user.id}/${propertyId}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("property-images")
          .upload(path, f, { upsert: false, contentType: f.type });
        if (upErr) { toast.error("تعذّر رفع صورة: " + upErr.message); continue; }
        const { data: pub } = supabase.storage.from("property-images").getPublicUrl(path);
        uploadedUrls.push(pub.publicUrl);
        await supabase.from("property_images").insert({ property_id: propertyId, url: pub.publicUrl, sort_order: i });
      }
      if (uploadedUrls.length > 0) {
        await supabase.from("properties").update({ images: uploadedUrls }).eq("id", propertyId);
      }
      toast.success("تم استلام عقارك للمراجعة");
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-36 pb-12 px-6">
        <SectionHeading kicker="SELL · اعرض عقارك" title="بوابة عرض العقارات" subtitle="املأ بيانات عقارك ليتم مراجعته ونشره ضمن مختاراتنا الفاخرة." />

        <form onSubmit={onSubmit} className="mt-12 mx-auto max-w-4xl rounded-[2rem] glass-strong luxe-shadow p-6 sm:p-10">
          {!done ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="عنوان العقار *" value={form.title} onChange={set("title")} placeholder="مثلاً: شقة فاخرة بإطلالة مفتوحة" />
              </div>
              <Select label="نوع العقار" value={form.type} onChange={set("type")} options={TYPES as readonly string[]} />
              <Select label="الغرض" value={form.purpose} onChange={set("purpose")} options={PURPOSES as readonly string[]} />
              <Field label="السعر (ج.م) *" value={form.price} onChange={set("price")} placeholder="5,000,000" />
              <Field label="المساحة (م²)" value={form.area} onChange={set("area")} placeholder="200" />
              <Field label="عدد غرف النوم" value={form.bedrooms} onChange={set("bedrooms")} placeholder="3" />
              <Field label="عدد الحمامات" value={form.bathrooms} onChange={set("bathrooms")} placeholder="2" />
              <Field label="المدينة" value={form.city} onChange={set("city")} placeholder="القاهرة" />
              <Field label="الحي / المنطقة" value={form.district} onChange={set("district")} placeholder="التجمع الخامس" />
              <div className="md:col-span-2">
                <Field label="العنوان التفصيلي" value={form.address} onChange={set("address")} placeholder="الشارع والمعالم القريبة" />
              </div>
              <Field label="اسم التواصل" value={form.contact_name} onChange={set("contact_name")} />
              <Field label="رقم التواصل *" value={form.contact_phone} onChange={set("contact_phone")} placeholder="01xxxxxxxxx" dir="ltr" />
              <div className="md:col-span-2">
                <Field label="وصف العقار" textarea value={form.description_full} onChange={set("description_full")} placeholder="اذكر مميزات العقار..." />
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-gold">صور وفيديو العقار</span>
                <label className="mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/30 hover:border-gold/60 transition cursor-pointer p-10 text-center">
                  <UploadCloud size={36} className="text-gold" />
                  <div className="mt-3 text-sm text-foreground/85">اسحب الملفات هنا أو اضغط للاختيار</div>
                  <div className="mt-1 text-xs text-muted-foreground">JPG, PNG — حتى 12 صورة</div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                </label>
                {files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden glass px-2 py-1 text-xs flex items-center gap-2">
                        <span className="max-w-[140px] truncate">{f.name}</span>
                        <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-accent-foreground"
                  style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
                >
                  {submitting ? (<><Loader2 size={16} className="animate-spin" /> جارٍ الإرسال...</>) : (<>إرسال للمراجعة <Check size={16} /></>)}
                </button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-accent-foreground" style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}>
                <Check size={36} />
              </div>
              <h3 className="font-display text-3xl mt-6">تم استلام عقارك</h3>
              <p className="mt-3 text-muted-foreground">عقارك الآن قيد المراجعة. ستجد حالته في لوحة تحكمك.</p>
              <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
                الذهاب للوحة التحكم
              </Link>
            </motion.div>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, placeholder, textarea, dir, value, onChange }: { label: string; placeholder?: string; textarea?: boolean; dir?: string; value?: string; onChange?: (v: string) => void }) {
  const cls = "w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60";
  return (
    <label className="block">
      <span className="text-sm text-gold">{label}</span>
      <div className="mt-2 rounded-2xl glass px-4 py-3">
        {textarea ? (
          <textarea dir={dir} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} className={cls + " min-h-[120px] resize-none"} />
        ) : (
          <input dir={dir} placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} className={cls} />
        )}
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="block">
      <span className="text-sm text-gold">{label}</span>
      <div className="mt-2 rounded-2xl glass px-4 py-3">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent outline-none text-foreground">
          {options.map((o) => <option key={o} value={o} className="bg-background">{o}</option>)}
        </select>
      </div>
    </label>
  );
}