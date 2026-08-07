import type { Property } from "@/lib/properties";
import { WHATSAPP, getPropertyImage, getPropertyCode } from "@/lib/properties";
import { MapPin, Maximize2, BedDouble, Heart, GitCompare, CheckCircle2, Wallet, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useFavorites, useCompare, COMPARE_LIMIT } from "@/lib/property-store";
import { toast } from "sonner";

const badgeColors: Record<string, string> = {
  "جديد": "bg-primary text-primary-foreground",
  "مميز": "text-[oklch(0.12_0.005_60)]",
  "فرصة استثمارية": "bg-emerald-deep text-primary-foreground",
};

export function PropertyCard({ p }: { p: Property }) {
  const fav = useFavorites();
  const cmp = useCompare();
  const isFav = fav.has(p.id);
  const isCmp = cmp.has(p.id);
  const code = getPropertyCode(p.id);

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    fav.toggle(p.id);
    toast.success(isFav ? "تمت الإزالة من المفضلة" : "تمت الإضافة إلى المفضلة");
  };
  const onCmp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCmp && cmp.ids.length >= COMPARE_LIMIT) {
      toast.error(`الحد الأقصى للمقارنة ${COMPARE_LIMIT} عقارات`);
      return;
    }
    cmp.toggle(p.id);
    toast.success(isCmp ? "تمت الإزالة من المقارنة" : "تمت الإضافة إلى المقارنة");
  };

  const inquiryMsg = encodeURIComponent(
    `مرحباً، أرغب بالاستفسار عن بيانات إضافية عن العقار:\n\n• كود العقار: ${code}\n• ${p.title}\n• الموقع: ${p.location}\n• السعر: ${p.price}`,
  );
  const chooseMsg = encodeURIComponent(
    `مرحباً، أرغب في اختيار هذا العقار:\n\n• كود العقار: ${code}\n• ${p.title}\n• النوع: ${p.type} (${p.status})\n• الموقع: ${p.location}\n• المساحة: ${p.area}\n• الغرف: ${p.rooms}\n• السعر: ${p.price}\n• طريقة الدفع: كاش\n\nبرجاء التواصل لاستكمال الإجراءات.`,
  );

  return (
    <article className="group relative overflow-hidden rounded-2xl glass luxe-shadow transition-all duration-500 hover:-translate-y-1">
      <Link
        to="/properties/$id"
        params={{ id: p.id }}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <img
          src={getPropertyImage(p)}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <button
            onClick={onFav}
            aria-label="المفضلة"
            aria-pressed={isFav}
            className={`grid place-content-center h-8 w-8 rounded-full glass-strong transition hover:text-gold ${
              isFav ? "text-gold" : "text-foreground/80"
            }`}
          >
            <Heart size={14} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={onCmp}
            aria-label="المقارنة"
            aria-pressed={isCmp}
            className={`grid place-content-center h-8 w-8 rounded-full glass-strong transition hover:text-gold ${
              isCmp ? "text-gold" : "text-foreground/80"
            }`}
          >
            <GitCompare size={14} />
          </button>
        </div>
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          {p.badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeColors[p.badge] ?? ""}`}
              style={p.badge === "مميز" ? { background: "var(--gradient-gold)" } : undefined}
            >
              {p.badge}
            </span>
          )}
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-gold/40"
            style={{ background: "var(--gradient-gold)", color: "var(--ink-black)" }}
          >
            {p.status}
          </span>
        </div>
        <div className="absolute bottom-2.5 right-3 left-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] text-gold/90 font-medium tracking-wider">{p.type}</div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider glass-strong text-gold">
              {code}
            </span>
          </div>
          <h3 className="mt-0.5 font-listing text-base sm:text-lg text-foreground leading-snug line-clamp-1">
            {p.title}
          </h3>
        </div>
      </Link>

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 min-w-0">
            <MapPin size={12} className="text-gold shrink-0" />
            <span className="truncate">{p.location}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-primary shrink-0">
            <Wallet size={12} /> كاش
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-foreground/85">
          <span className="inline-flex items-center gap-1"><Maximize2 size={12} className="text-gold" /> {p.area}</span>
          <span className="inline-flex items-center gap-1"><BedDouble size={12} className="text-gold" /> {p.rooms} غرف</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gold/15 pt-3">
          <div className="font-display text-base text-gold-gradient font-semibold truncate">
            {p.price}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`${WHATSAPP}?text=${inquiryMsg}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="التفاصيل"
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium glass hover:text-gold transition"
            >
              <Info size={12} /> التفاصيل
            </a>
            <a
              href={`${WHATSAPP}?text=${chooseMsg}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition hover:opacity-90"
              style={{ background: "var(--gradient-gold)", color: "var(--ink-black)" }}
            >
              <CheckCircle2 size={12} /> اختيار
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}