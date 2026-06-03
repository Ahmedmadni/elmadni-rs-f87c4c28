import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { properties as staticProps, WHATSAPP, PHONE, getPropertyCode, getPropertyImage, type Property } from "@/lib/properties";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites, useCompare, COMPARE_LIMIT } from "@/lib/property-store";
import {
  MapPin,
  Maximize2,
  BedDouble,
  Heart,
  GitCompare,
  MessageCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PropertyCard } from "@/components/site/PropertyCard";
import { MortgageCalculator } from "@/components/site/MortgageCalculator";
import { PurchaseRequestForm } from "@/components/site/PurchaseRequestForm";

export const Route = createFileRoute("/properties/$id")({
  head: () => ({ meta: [{ title: "تفاصيل العقار | مدني العقارية" }] }),
  component: PropertyDetailsPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-content-center text-center px-6">
      <h1 className="font-display text-4xl text-gold-gradient">العقار غير موجود</h1>
      <Link to="/properties" className="mt-4 text-gold hover:underline">
        العودة إلى العقارات
      </Link>
    </div>
  ),
});

function PropertyDetailsPage() {
  const { id } = Route.useParams();
  const fav = useFavorites();
  const cmp = useCompare();

  const { data: live, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async (): Promise<Property | null> => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const base = supabase
        .from("properties")
        .select("id,code,title,type,status,badge,price,area,rooms,location,images,featured,published,sort_order,description,description_full")
        .eq("review_status", "approved")
        .eq("published", true);
      const { data, error } = isUuid
        ? await base.eq("id", id).maybeSingle()
        : await base.eq("code", id).maybeSingle();
      if (error) throw error;
      return (data as Property | null) ?? null;
    },
    staleTime: 30_000,
  });

  const p = live ?? staticProps.find((x) => x.id === id || x.code === id) ?? null;

  if (!p) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-40 pb-20 text-center px-6">
          {isLoading ? (
            <div className="text-muted-foreground">جارٍ التحميل...</div>
          ) : (
            <>
              <h1 className="font-display text-3xl text-gold-gradient mb-3">العقار غير موجود</h1>
              <Link to="/properties" className="text-gold hover:underline">العودة للعقارات</Link>
            </>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const isFav = fav.has(p.id);
  const isCmp = cmp.has(p.id);
  const code = getPropertyCode(p);

  const related = staticProps.filter((x) => x.id !== p.id && x.type === p.type).slice(0, 3);

  return (
    <div className="relative min-h-screen">
      <Navbar />

      <div className="pt-28 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition mb-6"
          >
            العودة للعقارات <ArrowRight size={14} />
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="relative overflow-hidden rounded-3xl glass luxe-shadow">
              <img src={getPropertyImage(p)} alt={p.title} className="w-full h-[60vh] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 right-6 left-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-gold tracking-[0.25em] font-medium">{p.type} · {p.status}</div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wider glass-strong text-gold">
                    كود: {code}
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-5xl text-foreground font-semibold leading-tight">
                  {p.title}
                </h1>
                <div className="mt-3 flex items-center gap-1.5 text-sm text-foreground/85">
                  <MapPin size={16} className="text-gold" /> {p.location}
                </div>
              </div>
            </div>

            <aside className="rounded-3xl glass-strong p-6 luxe-shadow h-fit space-y-6">
              <div>
                <div className="text-xs text-muted-foreground tracking-wider">السعر</div>
                <div className="mt-1 font-display text-3xl text-gold-gradient font-semibold">
                  {p.price}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Spec icon={<Maximize2 size={16} />} label="المساحة" value={p.area ?? "—"} />
                <Spec icon={<BedDouble size={16} />} label="الغرف" value={`${p.rooms} غرف`} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    fav.toggle(p.id);
                    toast.success(isFav ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة");
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm glass hover:text-gold transition ${
                    isFav ? "text-gold" : ""
                  }`}
                >
                  <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                  {isFav ? "في المفضلة" : "أضف للمفضلة"}
                </button>
                <button
                  onClick={() => {
                    if (!isCmp && cmp.ids.length >= COMPARE_LIMIT) {
                      toast.error(`الحد الأقصى ${COMPARE_LIMIT}`);
                      return;
                    }
                    cmp.toggle(p.id);
                    toast.success(isCmp ? "أزيل من المقارنة" : "أضيف للمقارنة");
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm glass hover:text-gold transition ${
                    isCmp ? "text-gold" : ""
                  }`}
                >
                  <GitCompare size={16} /> {isCmp ? "في المقارنة" : "أضف للمقارنة"}
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-gold/15">
                <a
                  href={`${WHATSAPP}?text=${encodeURIComponent(`مرحباً، أرغب بالاستفسار عن العقار:\n\n• كود العقار: ${code}\n• ${p.title}\n• الموقع: ${p.location}\n• السعر: ${p.price}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-accent-foreground"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  <MessageCircle size={16} /> تواصل واتساب
                </a>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm glass hover:text-gold transition"
                >
                  <Phone size={16} /> اتصال مباشر
                </a>
              </div>
            </aside>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl glass p-6">
              <h2 className="font-display text-2xl text-gold-gradient mb-3">عن العقار</h2>
              <p className="text-foreground/85 leading-loose text-sm">
                {p.title} يقع في {p.location}، بمساحة {p.area} ويتكون من {p.rooms} غرف.
                وحدة فاخرة بتشطيب راقٍ ومواصفات عالية الجودة، تناسب الباحثين عن الرفاهية والموقع المتميز.
                للاستفسار وحجز المعاينة، تواصل معنا عبر الواتساب أو الاتصال المباشر.
              </p>
            </div>
            <div className="rounded-3xl glass p-6 space-y-3">
              <h2 className="font-display text-2xl text-gold-gradient mb-3">المميزات</h2>
              {[
                { i: <Sparkles size={16} />, t: "تشطيب فاخر وتصميم عصري" },
                { i: <ShieldCheck size={16} />, t: "موقع مميز وأمن على مدار اليوم" },
                { i: <Sparkles size={16} />, t: "إطلالات بانورامية وتهوية ممتازة" },
                { i: <ShieldCheck size={16} />, t: "استثمار آمن مع توثيق كامل" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/85">
                  <span className="text-gold">{f.i}</span> {f.t}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <MortgageCalculator defaultPrice={p.price} />
          </div>

          <div className="mt-10 max-w-2xl mx-auto">
            <PurchaseRequestForm propertyId={p.id} />
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-2xl text-gold-gradient mb-6">عقارات مشابهة</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => <PropertyCard key={r.id} p={r} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl glass p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-gold">{icon}</span> {label}
      </div>
      <div className="mt-1 text-sm text-foreground font-medium">{value}</div>
    </div>
  );
}