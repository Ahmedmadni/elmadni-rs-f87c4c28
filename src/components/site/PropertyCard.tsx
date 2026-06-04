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
    <article className="group relative overflow-hidden rounded-3xl glass luxe-shadow transition-all duration-500 hover:-translate-y-1">
      <Link
        to="/properties/$id"
        params={{ id: p.id }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={getPropertyImage(p)}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <button
            onClick={onFav}
            aria-label="المفضلة"
            aria-pressed={isFav}
            className={`grid place-content-center h-9 w-9 rounded-full glass-strong transition hover:text-gold ${
              isFav ? "text-gold" : "text-foreground/80"
            }`}
          >
            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={onCmp}
            aria-label="المقارنة"
            aria-pressed={isCmp}
            className={`grid place-content-center h-9 w-9 rounded-full glass-strong transition hover:text-gold ${
              isCmp ? "text-gold" : "text-foreground/80"
            }`}
          >
            <GitCompare size={16} />
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {p.badge && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColors[p.badge] ?? ""}`}
              style={p.badge === "مميز" ? { background: "var(--gradient-gold)" } : undefined}
            >
              {p.badge}
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-gold border border-gold/40">
            {p.status}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 left-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-gold/90 font-medium tracking-wider">{p.type}</div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider glass-strong text-gold">
              {code}
            </span>
          </div>
          <h3 className="mt-1 font-display text-xl text-foreground font-semibold leading-tight">
            {p.title}
          </h3>
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} className="text-gold" />
          <span>{p.location}</span>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-foreground/85">
          <div className="flex items-center gap-1.5"><Maximize2 size={14} className="text-gold" /> {p.area}</div>
          <div className="flex items-center gap-1.5"><BedDouble size={14} className="text-gold" /> {p.rooms} غرف</div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gold/15 pt-4">
          <div className="font-display text-xl text-gold-gradient font-semibold">
            {p.price}
          </div>
          <a
            href={`${WHATSAPP}?text=${inquiryMsg}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium glass hover:text-gold transition"
          >
            <Info size={12} /> التفاصيل
          </a>
        </div>

        {/* Payment method box */}
        <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Wallet size={14} /> طريقة الدفع
          </div>
          <div className="mt-1 text-xs text-foreground/85 leading-relaxed">
            الدفع <span className="font-semibold">كاش</span> فقط. للدفع على دفعات
            <span className="font-semibold"> تواصل معنا</span>.
          </div>
        </div>

        <a
          href={`${WHATSAPP}?text=${chooseMsg}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
          style={{ background: "var(--gradient-gold)", color: "var(--ink-black)" }}
        >
          <CheckCircle2 size={16} /> اختيار
        </a>
      </div>
    </article>
  );
}