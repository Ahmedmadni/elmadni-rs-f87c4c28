import { Link } from "@tanstack/react-router";
import { Home, Building2, KeyRound, Heart, Phone } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "الرئيسية" },
  { to: "/properties", icon: Building2, label: "العقارات" },
  { to: "/request", icon: KeyRound, label: "طلب" },
  { to: "/favorites", icon: Heart, label: "المفضلة" },
  { to: "/contact", icon: Phone, label: "تواصل" },
] as const;

export function MobileBottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-3 inset-x-3 z-40 safe-pb rounded-2xl glass-strong luxe-shadow"
      aria-label="القائمة السفلية"
    >
      <ul className="flex items-stretch justify-between px-2 py-1.5">
        {items.map((it) => (
          <li key={it.to} className="flex-1">
            <Link
              to={it.to}
              className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-foreground/70 transition hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: it.to === "/" }}
            >
              <it.icon size={18} />
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}