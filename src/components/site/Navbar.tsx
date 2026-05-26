import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Heart, GitCompare } from "lucide-react";
import logo from "@/assets/madni-logo.jpg";
import { useFavorites, useCompare } from "@/lib/property-store";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/properties", label: "العقارات" },
  { to: "/request", label: "طلب عقار" },
  { to: "/sell", label: "اعرض عقارك" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const fav = useFavorites();
  const cmp = useCompare();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          className={`flex items-center justify-between rounded-full px-4 sm:px-6 py-3 transition-all duration-500 ${
            scrolled ? "glass-strong luxe-shadow" : "glass"
          }`}
        >
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="المدني العقارية"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/40 group-hover:ring-gold transition"
            />
            <div className="leading-tight hidden sm:block">
              <div className="font-display text-lg text-gold-gradient font-semibold">
                المدني العقارية
              </div>
              <div className="text-[10px] tracking-[0.25em] text-muted-foreground">
                ELMADNI · REAL ESTATE
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="relative px-4 py-2 text-sm text-foreground/85 hover:text-gold transition-colors"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <IconLink to="/favorites" label="المفضلة" count={fav.ids.length}>
              <Heart size={16} />
            </IconLink>
            <IconLink to="/compare" label="المقارنة" count={cmp.ids.length}>
              <GitCompare size={16} />
            </IconLink>
            <Link
              to="/request"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:scale-[1.03]"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
            >
              اطلب عقارك
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-1">
            <IconLink to="/favorites" label="المفضلة" count={fav.ids.length} compact>
              <Heart size={16} />
            </IconLink>
            <IconLink to="/compare" label="المقارنة" count={cmp.ids.length} compact>
              <GitCompare size={16} />
            </IconLink>
            <button
              className="p-2 text-foreground"
              onClick={() => setOpen((v) => !v)}
              aria-label="القائمة"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="lg:hidden mt-2 rounded-3xl glass-strong p-4 reveal">
            <div className="flex flex-col">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-base border-b border-gold/10 last:border-0 text-foreground/90 hover:text-gold"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/favorites"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-base border-b border-gold/10 text-foreground/90 hover:text-gold flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><Heart size={16} /> المفضلة</span>
                <span className="text-xs text-gold">{fav.ids.length}</span>
              </Link>
              <Link
                to="/compare"
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-base border-b border-gold/10 text-foreground/90 hover:text-gold flex items-center justify-between"
              >
                <span className="flex items-center gap-2"><GitCompare size={16} /> المقارنة</span>
                <span className="text-xs text-gold">{cmp.ids.length}</span>
              </Link>
              <Link
                to="/request"
                onClick={() => setOpen(false)}
                className="mt-3 text-center rounded-full px-5 py-3 text-sm font-medium text-accent-foreground"
                style={{ background: "var(--gradient-gold)" }}
              >
                اطلب عقارك
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function IconLink({
  to,
  label,
  count,
  children,
  compact,
}: {
  to: string;
  label: string;
  count: number;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`relative grid place-content-center ${compact ? "h-9 w-9" : "h-10 w-10"} rounded-full glass text-foreground/85 hover:text-gold transition`}
      activeProps={{ className: "text-gold" }}
    >
      {children}
      {count > 0 && (
        <span
          className="absolute -top-1 -left-1 grid place-content-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold text-accent-foreground"
          style={{ background: "var(--gradient-gold)" }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}