import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PropertyCard } from "@/components/site/PropertyCard";
import { properties } from "@/lib/properties";
import { SectionHeading } from "./index";
import { Search } from "lucide-react";

export const Route = createFileRoute("/properties")({
  head: () => ({
    meta: [
      { title: "العقارات | المدني العقارية" },
      { name: "description", content: "تصفّح أفخم العقارات في مصر — شقق، فلل، مكاتب، شاليهات وأراضٍ." },
      { property: "og:title", content: "العقارات | المدني العقارية" },
      { property: "og:description", content: "أفخم العقارات في أرقى مناطق مصر." },
    ],
  }),
  component: PropertiesPage,
});

const types = ["الكل", "شقة", "بيت", "أرض", "مكتب", "فيلا", "تاون هاوس", "شاليه", "محل"];
const statuses = ["الكل", "للبيع", "للإيجار"];

function PropertiesPage() {
  const [type, setType] = useState("الكل");
  const [status, setStatus] = useState("الكل");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      properties.filter((p) => {
        const okType = type === "الكل" || p.type === type;
        const okStatus = status === "الكل" || p.status === status;
        const okQ =
          !q ||
          p.title.includes(q) ||
          p.location.includes(q);
        return okType && okStatus && okQ;
      }),
    [type, status, q],
  );

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="pt-36 pb-12 px-6">
        <SectionHeading kicker="MARKETPLACE · عرض العقارات" title="استكشف أفخم العقارات" subtitle="فلترة ذكية للوصول السريع لما يناسبك." />

        <div className="mt-10 mx-auto max-w-5xl rounded-3xl glass-strong p-5 luxe-shadow">
          <div className="flex items-center gap-3 rounded-2xl glass px-4 py-3">
            <Search size={18} className="text-gold" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالمنطقة أو نوع العقار..."
              className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Chips label="النوع" options={types} value={type} onChange={setType} />
            <Chips label="الحالة" options={statuses} value={status} onChange={setStatus} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">لا توجد نتائج مطابقة.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Chips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-4 py-1.5 rounded-full text-xs transition ${
              value === o
                ? "text-accent-foreground"
                : "glass text-foreground/80 hover:text-gold"
            }`}
            style={value === o ? { background: "var(--gradient-gold)" } : undefined}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}