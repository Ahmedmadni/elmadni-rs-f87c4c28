import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PropertyCard } from "@/components/site/PropertyCard";
import { WHATSAPP, groupByType } from "@/lib/properties";
import heroCairo from "@/assets/hero-cairo.jpg";
import { ArrowLeft, Building2, Search, KeyRound, ShieldCheck, Sparkles, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <ServiceSplit />
      <FeaturedListings />
      <RequestCTA />
      <SellCTA />
      <TrustStrip />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <img
        src={heroCairo}
        alt="القاهرة"
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/70" />

      {/* floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gold/40"
            initial={{ y: "100vh", x: `${(i * 53) % 100}%`, opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 1, 0] }}
            transition={{ duration: 10 + (i % 6), repeat: Infinity, delay: i * 0.4, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs tracking-[0.25em] text-gold"
        >
          <Sparkles size={14} /> ELMADNI · LUXURY REAL ESTATE
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="font-display mt-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.05]"
        >
          المدني العقارية
          <span className="block mt-3 text-gold-gradient">خبرة عقارية تثق بها</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-6 mx-auto max-w-2xl text-base sm:text-lg text-foreground/85 leading-loose"
        >
          منصة عقارية حديثة تساعدك على شراء وبيع وطلب العقارات بسهولة وتجربة فاخرة
          عبر أرقى مناطق مصر.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-accent-foreground transition hover:scale-[1.03]"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
          >
            تصفح العقارات <ArrowLeft size={16} />
          </Link>
          <Link
            to="/request"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold glass-strong text-foreground hover:text-gold transition"
          >
            اطلب عقارك
          </Link>
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold border border-gold/30 hover:border-gold text-foreground/90 hover:text-gold transition"
          >
            اعرض عقارك
          </Link>
        </motion.div>

        <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { v: "+1200", l: "عقار مميز" },
            { v: "+850", l: "عميل سعيد" },
            { v: "+15", l: "منطقة راقية" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-3xl sm:text-4xl text-gold-gradient">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceSplit() {
  const cards = [
    {
      to: "/properties",
      icon: Search,
      kicker: "عرض العقارات",
      title: "تصفح أفخم العقارات",
      desc: "آلاف العقارات المختارة بعناية في أرقى مناطق مصر — شقق، فلل، مكاتب، شاليهات، وأراضٍ استثمارية.",
      cta: "ابدأ التصفح",
    },
    {
      to: "/request",
      icon: KeyRound,
      kicker: "طلب عقار",
      title: "نعثر على عقارك المثالي",
      desc: "أخبرنا بمتطلباتك ودعنا نبحث نيابة عنك. منظومة ذكية لطلب العقارات تناسب احتياجاتك واستثمارك.",
      cta: "اطلب الآن",
    },
  ];
  return (
    <section className="relative py-28 px-6">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          kicker="خدماتنا"
          title="تجربتان عقاريتان فاخرتان"
          subtitle="اختر التجربة التي تناسبك — استعرض المتاح أو اطلب ما تتمناه."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {cards.map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-[2rem] glass-strong luxe-shadow p-10 min-h-[380px] flex flex-col justify-between"
            >
              <div
                className="absolute -top-32 -left-32 h-72 w-72 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                style={{ background: "var(--gradient-gold)" }}
              />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[10px] tracking-[0.3em] text-gold">
                  <c.icon size={12} /> {c.kicker}
                </div>
                <h3 className="font-display text-4xl sm:text-5xl mt-6 leading-tight">
                  {c.title}
                </h3>
                <p className="mt-4 text-muted-foreground leading-loose max-w-md">{c.desc}</p>
              </div>
              <Link
                to={c.to}
                className="relative inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:gap-3"
                style={{ background: "var(--gradient-gold)" }}
              >
                {c.cta} <ArrowLeft size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedListings() {
  const groups = groupByType();
  const order: Array<{ type: string; kicker: string; subtitle: string }> = [
    { type: "شقة", kicker: "السكن العائلي", subtitle: "أحدث الشقق السكنية في أرقى المواقع." },
    { type: "بيت", kicker: "البيوت والعمارات", subtitle: "بيوت متعددة الأدوار وفرص تطوير مميزة." },
    { type: "أرض", kicker: "الأراضي والاستثمار", subtitle: "قطع أراضٍ بمواقع استراتيجية وأسعار تنافسية." },
    { type: "مكتب", kicker: "الأدوار الإدارية", subtitle: "أدوار إدارية وتجارية بشوارع رئيسية." },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeading
            kicker="عقارات مختارة"
            title="استعرض العقارات حسب القسم"
            subtitle={`60+ عقار متاح للبيع — شقق، بيوت، أراضٍ وأدوار إدارية بمواقع مميزة.`}
            align="start"
          />
          <Link
            to="/properties"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all"
          >
            عرض الكل <ArrowLeft size={16} />
          </Link>
        </div>

        {order.map(({ type, kicker, subtitle }) => {
          const items = groups[type] ?? [];
          if (!items.length) return null;
          return (
            <div key={type} className="mt-20">
              <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                <div>
                  <div className="text-xs tracking-[0.3em] text-gold/80 uppercase mb-2">
                    {kicker}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground">
                    {type} <span className="text-muted-foreground text-base">({items.length})</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                </div>
                <div className="flex-1 mx-6 hidden md:block hairline-gold" />
                <Link
                  to="/properties"
                  className="text-sm text-gold/90 hover:text-gold inline-flex items-center gap-1"
                >
                  عرض كل {type} <ArrowLeft size={14} />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.slice(0, 6).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                  >
                    <PropertyCard p={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RequestCTA() {
  return (
    <section className="relative py-28 px-6">
      <div
        className="mx-auto max-w-6xl rounded-[2.5rem] overflow-hidden relative p-12 md:p-20 text-center"
        style={{ background: "var(--gradient-emerald)" }}
      >
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-gold)", mixBlendMode: "overlay" }} />
        <div className="relative">
          <div className="text-xs tracking-[0.4em] text-gold">REQUEST · طلب عقار</div>
          <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
            لم تجد ما تبحث عنه؟ <br />
            <span className="text-gold-gradient">سنجده لك.</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-foreground/85 leading-loose">
            أخبرنا بمواصفات عقارك المثالي وميزانيتك، وسيتواصل معك فريق الخبراء لدينا
            بأفضل الفرص المتاحة خلال 24 ساعة.
          </p>
          <Link
            to="/request"
            className="mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-accent-foreground"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
          >
            ابدأ طلبك الآن <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SellCTA() {
  return (
    <section className="relative py-24 px-6">
      <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <div className="text-xs tracking-[0.4em] text-gold">SELL · اعرض عقارك</div>
          <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
            اعرض عقارك على <span className="text-gold-gradient">أرقى منصة</span> في مصر
          </h2>
          <p className="mt-5 text-muted-foreground leading-loose max-w-lg">
            نوفّر لك واجهة احترافية لعرض عقارك، إدارة المعاينات، ومتابعة العملاء
            المهتمين بكل سهولة وأناقة.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-foreground/85">
            {["تسويق احترافي بصور وفيديوهات سينمائية", "إدارة المواعيد والمعاينات", "تتبع العملاء المهتمين", "دعم مخصص على مدار اليوم"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold" /> {f}
              </li>
            ))}
          </ul>
          <Link
            to="/sell"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold glass-strong hover:text-gold"
          >
            ابدأ بعرض عقارك <Building2 size={16} />
          </Link>
        </div>
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden luxe-shadow">
          <img src={heroCairo} alt="Cairo" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { v: "خبرة موثوقة", d: "أكثر من عقد في السوق العقاري المصري" },
    { v: "تقييم شفّاف", d: "تسعير عادل مبني على دراسات السوق" },
    { v: "دعم مستمر", d: "فريق متاح للرد على استفساراتك دائماً" },
  ];
  return (
    <section className="relative py-20 px-6">
      <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.v} className="rounded-2xl glass p-6 text-center">
            <div className="font-display text-2xl text-gold-gradient">{it.v}</div>
            <p className="mt-2 text-sm text-muted-foreground">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-6 left-6 z-40 inline-flex items-center justify-center h-14 w-14 rounded-full text-accent-foreground transition hover:scale-110"
      style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
    >
      <MessageCircle size={22} />
    </a>
  );
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "center",
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      <div className="text-xs tracking-[0.4em] text-gold">{kicker}</div>
      <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground leading-loose">{subtitle}</p>}
    </div>
  );
}
