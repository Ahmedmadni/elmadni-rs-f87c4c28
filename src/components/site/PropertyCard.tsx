import type { Property } from "@/lib/properties";
import { WHATSAPP } from "@/lib/properties";
import { MapPin, Maximize2, BedDouble, MessageCircle, Heart, GitCompare, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useFavorites, useCompare, COMPARE_LIMIT } from "@/lib/property-store";
import { toast } from "sonner";

const badgeColors: Record<string, string> = {
  "جديد": "bg-primary/80 text-primary-foreground",
  "مميز": "text-accent-foreground",
  "فرصة استثمارية": "bg-emerald-deep text-foreground",
};

export function PropertyCard({ p }: { p: Property }) {
  const fav = useFavorites();
  const cmp = useCompare();
  const isFav = fav.has(p.id);
  const isCmp = cmp.has(p.id);

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

  return (
    <article className="group relative overflow-hidden rounded-3xl glass luxe-shadow transition-all duration-500 hover:-translate-y-1">
      <Link
        to="/properties/$id"
        params={{ id: p.id }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
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
          <span className="px-3 py-1 rounded-full text-xs font-medium glass-strong text-gold">
            {p.status}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 left-4">
          <div className="text-xs text-gold/90 font-medium tracking-wider">{p.type}</div>
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
          <div className="flex items-center gap-2">
            <Link
              to="/properties/$id"
              params={{ id: p.id }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium glass hover:text-gold transition"
            >
              التفاصيل <ArrowLeft size={12} />
            </Link>
            <a
              href={`${WHATSAPP}?text=${encodeURIComponent("مرحباً، أرغب بالاستفسار عن: " + p.title)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium glass hover:text-gold transition"
            >
              <MessageCircle size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}