import type { Property } from "@/lib/properties";
import { WHATSAPP } from "@/lib/properties";
import { MapPin, Maximize2, BedDouble, MessageCircle } from "lucide-react";

const badgeColors: Record<string, string> = {
  "جديد": "bg-primary/80 text-primary-foreground",
  "مميز": "text-accent-foreground",
  "فرصة استثمارية": "bg-emerald-deep text-foreground",
};

export function PropertyCard({ p }: { p: Property }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl glass luxe-shadow transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
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
      </div>

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
            href={`${WHATSAPP}?text=${encodeURIComponent("مرحباً، أرغب بالاستفسار عن: " + p.title)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium glass hover:text-gold transition"
          >
            <MessageCircle size={14} /> استفسار
          </a>
        </div>
      </div>
    </article>
  );
}