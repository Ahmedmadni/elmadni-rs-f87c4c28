import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "./index";
import { WHATSAPP } from "@/lib/properties";
import { UploadCloud, Check, MessageCircle } from "lucide-react";

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

function SellPage() {
  const [done, setDone] = useState(false);
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-36 pb-12 px-6">
        <SectionHeading kicker="SELL · اعرض عقارك" title="بوابة عرض العقارات" subtitle="املأ بيانات عقارك ليتم مراجعته ونشره ضمن مختاراتنا الفاخرة." />

        <form
          onSubmit={(e) => { e.preventDefault(); setDone(true); }}
          className="mt-12 mx-auto max-w-4xl rounded-[2rem] glass-strong luxe-shadow p-6 sm:p-10"
        >
          {!done ? (
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="نوع العقار" placeholder="شقة / فيلا / مكتب..." />
              <Field label="الموقع" placeholder="المدينة، المنطقة" />
              <Field label="المساحة (م²)" placeholder="200" />
              <Field label="عدد الغرف" placeholder="3" />
              <Field label="السعر (ج.م)" placeholder="5,000,000" />
              <Field label="التشطيب" placeholder="سوبر لوكس / نصف تشطيب..." />
              <Field label="رقم التواصل" placeholder="01xxxxxxxxx" dir="ltr" />
              <Field label="مواعيد المعاينة" placeholder="مثلاً: الجمعة والسبت" />
              <div className="md:col-span-2">
                <Field label="وصف العقار" placeholder="اذكر مميزات العقار..." textarea />
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-gold">صور وفيديو العقار</span>
                <label className="mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/30 hover:border-gold/60 transition cursor-pointer p-10 text-center">
                  <UploadCloud size={36} className="text-gold" />
                  <div className="mt-3 text-sm text-foreground/85">اسحب الملفات هنا أو اضغط للاختيار</div>
                  <div className="mt-1 text-xs text-muted-foreground">JPG, PNG, MP4 — حتى 50MB</div>
                  <input type="file" multiple className="hidden" />
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-accent-foreground"
                  style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
                >
                  نشر العقار <Check size={16} />
                </button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-accent-foreground" style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}>
                <Check size={36} />
              </div>
              <h3 className="font-display text-3xl mt-6">تم استلام بيانات عقارك</h3>
              <p className="mt-3 text-muted-foreground">سيراجع فريقنا التفاصيل ويتواصل معك قريباً.</p>
              <a href={WHATSAPP} target="_blank" rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground"
                style={{ background: "var(--gradient-gold)" }}>
                <MessageCircle size={16} /> متابعة عبر واتساب
              </a>
            </motion.div>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, placeholder, textarea, dir }: { label: string; placeholder?: string; textarea?: boolean; dir?: string }) {
  const cls = "w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60";
  return (
    <label className="block">
      <span className="text-sm text-gold">{label}</span>
      <div className="mt-2 rounded-2xl glass px-4 py-3">
        {textarea ? (
          <textarea dir={dir} placeholder={placeholder} className={cls + " min-h-[120px] resize-none"} />
        ) : (
          <input dir={dir} placeholder={placeholder} className={cls} />
        )}
      </div>
    </label>
  );
}