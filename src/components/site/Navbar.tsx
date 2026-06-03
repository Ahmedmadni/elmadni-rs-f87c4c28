import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Heart, GitCompare, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import logo from "@/assets/madni-logo.png";
import { useFavorites, useCompare } from "@/lib/property-store";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/properties", label: "العقارات" },
  { to: "/projects", label: "المشاريع" },
  { to: "/sell", label: "اعرض عقارك" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const fav = useFavorites();
  const cmp = useCompare();
  const { isAuthenticated, user, isAdmin, signOut } = useAuth();
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user?.email ||
    "حسابي";
  const initial = (displayName || "?").trim().charAt(0).toUpperCase();

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
            scrolled ? "bg-background border-2 border-gold/40 luxe-shadow" : "bg-background border border-gold/30 shadow-lg"
          }`}
        >
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="مدني العقارية"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-1 ring-gold/40 group-hover:ring-gold transition shadow-[0_0_20px_rgba(201,168,76,0.35)]"
            />
            <div className="leading-tight hidden sm:block">
              <div className="font-display text-gold-gradient font-bold tracking-tight font-sans text-xl">
                مدني
              </div>
              <div className="text-[10px] tracking-[0.3em] text-muted-foreground mt-0.5">
                MADNI · MAGHAGHA
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="relative px-4 py-2 text-sm font-bold text-foreground hover:text-gold transition-colors"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <IconLink to="/favorites" label="المفضلة" count={fav.ids.length}>
              <Heart size={16} />
            </IconLink>
            <IconLink to="/compare" label="المقارنة" count={cmp.ids.length}>
              <GitCompare size={16} />
            </IconLink>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="حسابي"
                    className="grid place-content-center h-10 w-10 rounded-full glass text-foreground/85 hover:text-gold transition font-semibold"
                  >
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer gap-2">
                      <LayoutDashboard size={14} /> لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="cursor-pointer gap-2">
                        <Shield size={14} /> إدارة المستخدمين
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      void signOut();
                    }}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut size={14} /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                aria-label="تسجيل الدخول"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm glass text-foreground/85 hover:text-gold transition"
              >
                <User size={14} /> دخول
              </Link>
            )}
            <Link
              to="/request"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:scale-[1.03]"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold-glow)" }}
            >
              اطلب عقارك
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle compact />
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
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-base border-b border-gold/10 text-foreground/90 hover:text-gold flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} /> لوحة التحكم
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/users"
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 text-base border-b border-gold/10 text-foreground/90 hover:text-gold flex items-center gap-2"
                    >
                      <Shield size={16} /> إدارة المستخدمين
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      void signOut();
                    }}
                    className="px-4 py-3 text-base border-b border-gold/10 text-destructive hover:opacity-80 flex items-center gap-2 text-right"
                  >
                    <LogOut size={16} /> تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-base border-b border-gold/10 text-foreground/90 hover:text-gold flex items-center gap-2"
                  >
                    <User size={16} /> تسجيل الدخول
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-base border-b border-gold/10 text-foreground/90 hover:text-gold flex items-center gap-2"
                  >
                    إنشاء حساب جديد
                  </Link>
                </>
              )}
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
  to: "/favorites" | "/compare";
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