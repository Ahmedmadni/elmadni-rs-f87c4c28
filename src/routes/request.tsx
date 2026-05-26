import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "./index";
import { WHATSAPP } from "@/lib/properties";
import { Check, ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/request")({
  head: () => ({
    meta: [
      { title: "طلب عقار | المدني العقارية" },
      { name: "description", content: "اطلب عقارك المثالي بمواصفات محددة وسنبحث لك عن أفضل الفرص." },
      { property: "og:title", content: "طلب عقار | المدني العقارية" },
      { property: "og:description", content: "منظومة ذكية لطلب العقارات في مصر." },
    ],
  }),
  component: RequestPage,
});

type Form = {
  type: string;
  governorate: string;
  area: string;
  budget: string;
  size: string;
  rooms: string;
  purpose: string;
  furnished: string;
  notes: string;
  phone: string;
  contact: string;
};

const steps = ["العقار", "الموقع والميزانية", "التفاصيل", "التواصل"];

function RequestPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<Form>({
    type: "", governorate: "", area: "", budget: "", size: "", rooms: "",
    purpose: "سكن", furnished: "غير مفروش", notes: "", phone: "", contact: "واتساب",
  });
  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const submit = () => setDone(true);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-36 pb-12 px-6">
        <SectionHeading kicker="REQUEST · طلب عقار" title="أخبرنا بعقارك المثالي" subtitle="املأ النموذج وسنتواصل معك بأفضل الفرص خلال 24 ساعة." />

        <div className="mt-12 mx-auto max-w-3xl rounded-[2rem] glass-strong luxe-shadow p-6 sm:p-10">
          {!done ? (
            <>
              {/* progress */}
              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className={`h-1 rounded-full transition-all ${i <= step ? "" : "bg-muted"}`}
                      style={i <= step ? { background: "var(--gradient-gold)" } : undefined}
                    />
                    <div className={`mt-2 text-[11px] ${i === step ? "text-gold" : "text-muted-foreground"}`}>{s}</div>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-5"
                >
                  {step === 0 && (
                    <>
                      <Select label="نوع العقار" value={form.type} onChange={set("type")} options={["شقة", "فيلا", "تاون هاوس", "مكتب", "شاليه", "محل", "أرض"]} />
                      <Select label="الغرض" value={form.purpose} onChange={set("purpose")} options={["سكن", "استثمار", "إيجار"]} />
                      <Select label="التشطيب" value={form.furnished} onChange={set("furnished")} options={["مفروش", "غير مفروش", "نصف تشطيب"]} />
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <Field label="المحافظة" value={form.governorate} onChange={set("governorate")} placeholder="القاهرة، الجيزة، الإسكندرية..." />
                      <Field label="المنطقة" value={form.area} onChange={set("area")} placeholder="التجمع الخامس، الشيخ زايد..." />
                      <Field label="الميزانية (ج.م)" value={form.budget} onChange={set("budget")} placeholder="5,000,000" />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Field label="المساحة المطلوبة (م²)" value={form.size} onChange={set("size")} placeholder="200" />
                      <Field label="عدد الغرف" value={form.rooms} onChange={set("rooms")} placeholder="3" />
                      <Field label="تفاصيل إضافية" value={form.notes} onChange={set("notes")} placeholder="اذكر أي متطلبات خاصة..." textarea />
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <Field label="رقم الهاتف" value={form.phone} onChange={set("phone")} placeholder="01xxxxxxxxx" dir="ltr" />
                      <Select label="طريقة التواصل المفضّلة" value={form.contact} onChange={set("contact")} options={["واتساب", "اتصال", "بريد إلكتروني"]} />
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex justify-between gap-3">
                <button
                  onClick={prev}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm disabled:opacity-40"
                >
                  <ArrowRight size={16} /> السابق
                </button>
                {step < steps.length - 1 ? (
                  <button
                    onClick={next}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-accent-foreground"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    التالي <ArrowLeft size={16} />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-accent-foreground"
                    style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
                  >
                    إرسال الطلب <Check size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center text-accent-foreground"
                style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}>
                <Check size={36} />
              </div>
              <h3 className="font-display text-3xl mt-6">تم استلام طلبك بنجاح</h3>
              <p className="mt-3 text-muted-foreground">سيتواصل معك فريقنا خلال 24 ساعة بأفضل الفرص.</p>
              <a
                href={WHATSAPP}
                target="_blank" rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground"
                style={{ background: "var(--gradient-gold)" }}
              >
                <MessageCircle size={16} /> متابعة عبر واتساب
              </a>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea, dir }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean; dir?: string }) {
  const cls = "w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60";
  return (
    <label className="block">
      <span className="text-sm text-gold">{label}</span>
      <div className="mt-2 rounded-2xl glass px-4 py-3">
        {textarea ? (
          <textarea dir={dir} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls + " min-h-[100px] resize-none"} />
        ) : (
          <input dir={dir} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
        )}
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <div className="text-sm text-gold">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`px-4 py-2 rounded-full text-xs transition ${value === o ? "text-accent-foreground" : "glass text-foreground/80 hover:text-gold"}`}
            style={value === o ? { background: "var(--gradient-gold)" } : undefined}
          >{o}</button>
        ))}
      </div>
    </div>
  );
}