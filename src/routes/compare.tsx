import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { properties, WHATSAPP, getPropertyImage } from "@/lib/properties";
import { useCompare } from "@/lib/property-store";
import { GitCompare, X, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "مقارنة العقارات | مدني العقارية" },
      { name: "description", content: "قارن بين العقارات لاتخاذ القرار الأنسب." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const cmp = useCompare();
  const items = properties.filter((p) => cmp.has(p.id));

  const rows: { label: string; key: (p: (typeof properties)[number]) => string }[] = [
    { label: "السعر", key: (p) => p.price },
    { label: "النوع", key: (p) => p.type },
    { label: "الحالة", key: (p) => p.status },
    { label: "المساحة", key: (p) => p.area ?? "—" },
    { label: "الغرف", key: (p) => `${p.rooms} غرف` },
    { label: "الموقع", key: (p) => p.location ?? "—" },
  ];

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="pt-36 pb-16 px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="text-center">
          <div className="text-xs tracking-[0.3em] text-gold mb-3">COMPARE</div>
          <h1 className="font-display text-4xl sm:text-5xl text-gold-gradient font-semibold">
            مقارنة العقارات
          </h1>
          <p className="mt-3 text-muted-foreground">
            {items.length} من {4} عقار
          </p>
          {items.length > 0 && (
            <button
              onClick={cmp.clear}
              className="mt-4 text-xs text-muted-foreground hover:text-gold transition"
            >
              مسح كل المقارنات
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-16 rounded-3xl glass p-12 text-center max-w-xl mx-auto">
            <GitCompare size={40} className="mx-auto text-gold mb-4" />
            <p className="text-foreground/85">أضف عقارات إلى المقارنة من صفحة العقارات.</p>
            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-accent-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              تصفح العقارات
            </Link>
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-3xl glass-strong luxe-shadow">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="p-4 text-right text-xs text-muted-foreground font-medium w-32 sticky right-0 glass-strong">
                    الخاصية
                  </th>
                  {items.map((p) => (
                    <th key={p.id} className="p-4 text-right min-w-[240px] align-top">
                      <div className="relative rounded-2xl overflow-hidden mb-3">
                        <img src={getPropertyImage(p)} alt={p.title} className="w-full h-36 object-cover" />
                        <button
                          onClick={() => cmp.toggle(p.id)}
                          aria-label="إزالة"
                          className="absolute top-2 left-2 grid place-content-center h-8 w-8 rounded-full glass-strong text-foreground hover:text-gold transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <Link
                        to="/properties/$id"
                        params={{ id: p.id }}
                        className="font-display text-lg text-foreground hover:text-gold transition leading-tight block"
                      >
                        {p.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} className="text-gold" /> {p.location}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-gold/10">
                    <td className="p-4 text-xs text-muted-foreground font-medium sticky right-0 glass-strong">
                      {r.label}
                    </td>
                    {items.map((p) => (
                      <td key={p.id} className="p-4 text-foreground/90">{r.key(p)}</td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-gold/10">
                  <td className="p-4 text-xs text-muted-foreground font-medium sticky right-0 glass-strong">
                    تواصل
                  </td>
                  {items.map((p) => (
                    <td key={p.id} className="p-4">
                      <a
                        href={`${WHATSAPP}?text=${encodeURIComponent("استفسار عن: " + p.title)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-accent-foreground"
                        style={{ background: "var(--gradient-gold)" }}
                      >
                        <MessageCircle size={12} /> استفسار
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}