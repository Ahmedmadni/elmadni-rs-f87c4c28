import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "madni:theme";
type Theme = "dark" | "light";

function apply(t: Theme) {
  const html = document.documentElement;
  html.classList.toggle("dark", t === "dark");
  html.style.colorScheme = t;
}

export function ThemeToggle({ compact }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? "dark";
    setTheme(stored);
    apply(stored);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(KEY, next);
    apply(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      className={`relative grid place-content-center ${compact ? "h-9 w-9" : "h-10 w-10"} rounded-full glass text-foreground/85 hover:text-gold transition`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

/** Inline script string — runs before paint to avoid theme flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}')||'dark';var h=document.documentElement;if(t==='dark')h.classList.add('dark');h.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;