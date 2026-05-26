import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WHATSAPP } from "@/lib/properties";
import compoundImg from "@/assets/type-townhouse.jpg";
import coastImg from "@/assets/type-chalet.jpg";
import towerImg from "@/assets/type-apartment.jpg";
import officeImg from "@/assets/type-office.jpg";
import { ArrowLeft, MapPin, Building2 } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "المشاريع | المدني العقارية" },
      { name: "description", content: "مشاريع عقارية فاخرة وفرص استثمارية مختارة في أرقى مناطق مصر." },
      { property: "og:title", content: "المشاريع | المدني العقارية" },
      { property: "og:description", content: "أبرز المشاريع العقارية والاستثمارية." },
    ],
  }),
  component: ProjectsPage,
});

type Project = {
  id: string;
  name: string;
  developer: string;
  location: string;
  type: string;
  delivery: string;
  units: string;
  image: string;
  highlight: string;
};

const projects: Project[] = [
  {
    id: "p1",
    name: "مدني تاور",
    developer: "المدني للتطوير العقاري",
    location: "العاصمة الإدارية الجديدة",
    type: "إداري · تجاري",
    delivery: "2027",
    units: "180 وحدة",
    image: officeImg,
    highlight: "أحدث مشاريع المنطقة المركزية بتصميم سينمائي",
  },
  {
    id: "p2",
    name: "إميرالد ريزيدنس",
    developer: "المدني العقارية",
    location: "التجمع الخامس، القاهرة الجديدة",
    type: "سكني فاخر",
    delivery: "2026",
    units: "240 شقة",
    image: towerImg,
    highlight: "إطلالات بانورامية وتشطيب من الخارج",
  },
  {
    id: "p3",
    name: "غولد كمبوند",
    developer: "المدني العقارية",
    location: "مدينتي، القاهرة",
    type: "تاون هاوس وفلل",
    delivery: "2026",
    units: "85 وحدة",
    image: compoundImg,
    highlight: "كمبوند مغلق بحدائق وخدمات راقية",
  },
  {
    id: "p4",
    name: "هاسيندا إكلوسيف",
    developer: "المدني العقارية",
    location: "هاسيندا باي، الساحل الشمالي",
    type: "شاليهات وفلل",
    delivery: "2026",
    units: "120 وحدة",
    image: coastImg,
    highlight: "واجهة بحرية ممتدة على البحر المتوسط",
  },
];

function ProjectsPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <section className="pt-36 pb-12 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-xs tracking-[0.4em] text-gold">PROJECTS</div>
          <h1 className="font-display mt-3 text-5xl sm:text-6xl text-gold-gradient leading-tight">
            مشاريعنا المختارة
          </h1>
          <p className="mt-4 text-muted-foreground leading-loose max-w-2xl mx-auto">
            مشاريع عقارية واستثمارية مختارة بعناية في أرقى مناطق مصر — من العاصمة الإدارية إلى الساحل الشمالي.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl space-y-10">
          {projects.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`grid gap-8 lg:grid-cols-2 items-center ${
                i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] luxe-shadow group">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
                <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs text-gold">
                  <Building2 size={12} /> تسليم {p.delivery}
                </div>
              </div>

              <div className="rounded-[2rem] glass-strong p-8 sm:p-10 luxe-shadow">
                <div className="text-xs tracking-[0.3em] text-gold mb-3">{p.developer}</div>
                <h2 className="font-display text-4xl sm:text-5xl leading-tight">{p.name}</h2>
                <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} className="text-gold" /> {p.location}
                </div>
                <p className="mt-5 text-foreground/85 leading-loose">{p.highlight}</p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Spec label="النوع" value={p.type} />
                  <Spec label="عدد الوحدات" value={p.units} />
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  <a
                    href={`${WHATSAPP}?text=${encodeURIComponent("استفسار عن مشروع: " + p.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-accent-foreground"
                    style={{ background: "var(--gradient-gold)" }}
                  >
                    استفسر عن المشروع <ArrowLeft size={14} />
                  </a>
                  <Link
                    to="/properties"
                    className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold glass hover:text-gold transition"
                  >
                    تصفح الوحدات
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}