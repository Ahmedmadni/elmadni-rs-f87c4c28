import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, TrendingUp, Users, MapPin } from "lucide-react";

const stats = [
  { icon: Building2, label: "عقار مميز", value: "1,240", trend: "+18%" },
  { icon: Users, label: "عميل سعيد", value: "850", trend: "+24%" },
  { icon: MapPin, label: "منطقة راقية", value: "15", trend: "موسّع" },
  { icon: TrendingUp, label: "صفقات الشهر", value: "76", trend: "+9%" },
];

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setT({ rx: -y * 10, ry: x * 14 });
      }}
      onMouseLeave={() => setT({ rx: 0, ry: 0 })}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        animate={{ rotateX: t.rx, rotateY: t.ry }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
        className="h-full rounded-3xl glass-strong border border-gold/20 p-6 luxe-shadow"
      >
        {children}
      </motion.div>
    </div>
  );
}

function StackedCard({
  s,
  i,
  total,
  progress,
}: {
  s: (typeof stats)[number];
  i: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = i / total;
  const end = (i + 1) / total;
  const y = useTransform(progress, [start, end], [90, 0]);
  const opacity = useTransform(progress, [start, start + 0.08, end], [0, 1, 1]);
  const scale = useTransform(progress, [start, end, 1], [0.9, 1, 1 - (total - 1 - i) * 0.035]);
  const rotate = useTransform(progress, [start, end], [i % 2 === 0 ? -4 : 4, 0]);

  return (
    <motion.div
      style={{ y, opacity, scale, rotate, zIndex: i }}
      className="sticky top-28"
    >
      <TiltCard>
        <div className="flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
          <div
            className="h-12 w-12 grid place-content-center rounded-2xl text-accent-foreground"
            style={{ background: "var(--gradient-gold)" }}
          >
            <s.icon size={20} />
          </div>
          <div className="text-xs px-2 py-1 rounded-full glass text-gold">{s.trend}</div>
        </div>
        <div className="mt-6" style={{ transform: "translateZ(40px)" }}>
          <div className="font-display text-4xl text-gold-gradient">{s.value}</div>
          <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
        </div>
        <div
          className="mt-5 h-1 rounded-full overflow-hidden bg-foreground/5"
          style={{ transform: "translateZ(20px)" }}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${60 + i * 10}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="h-full"
            style={{ background: "var(--gradient-gold)" }}
          />
        </div>
      </TiltCard>
    </motion.div>
  );
}

export function Dashboard3D() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start end", "end start"],
  });

  return (
    <section className="relative py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs tracking-[0.4em] text-gold">LIVE DASHBOARD · لوحة الأداء</div>
          <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
            أرقامنا <span className="text-gold-gradient">تتحدث</span> عنا
          </h2>
          <p className="mt-4 text-muted-foreground leading-loose">
            حرّك المؤشر فوق البطاقات لاستكشاف لوحة الأداء ثلاثية الأبعاد.
          </p>
        </div>

        {/* Stacked scroll reveal — mobile & tablet */}
        <div ref={stackRef} className="lg:hidden mx-auto max-w-md space-y-6">
          {stats.map((s, i) => (
            <StackedCard key={s.label} s={s} i={i} total={stats.length} progress={scrollYProgress} />
          ))}
        </div>

        <div className="hidden lg:grid gap-5 grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 60, rotate: i % 2 === 0 ? -3 : 3, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard>
                <div className="flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
                  <div
                    className="h-12 w-12 grid place-content-center rounded-2xl text-accent-foreground"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    <s.icon size={20} />
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full glass text-gold">{s.trend}</div>
                </div>
                <div className="mt-6" style={{ transform: "translateZ(40px)" }}>
                  <div className="font-display text-4xl text-gold-gradient">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
                <div
                  className="mt-5 h-1 rounded-full overflow-hidden bg-foreground/5"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${60 + i * 10}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                    className="h-full"
                    style={{ background: "var(--gradient-gold)" }}
                  />
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}