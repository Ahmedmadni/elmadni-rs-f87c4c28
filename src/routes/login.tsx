import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import logo from "@/assets/madni-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | مدني العقارية" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("تم تسجيل الدخول");
  };

  const onGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (res.error) toast.error("تعذّر تسجيل الدخول بجوجل");
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16 bg-background">
      <div className="w-full max-w-md rounded-3xl glass-strong p-8 luxe-shadow">
        <Link to="/" className="flex flex-col items-center gap-3 mb-6">
          <img src={logo} alt="مدني" className="h-14 w-14 rounded-full ring-1 ring-gold/40" />
          <div className="font-display text-xl text-gold-gradient font-semibold">مدني العقارية</div>
        </Link>
        <h1 className="text-2xl font-semibold text-center mb-6">تسجيل الدخول</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">البريد الإلكتروني</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">كلمة السر</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold" />
          </div>
          <button disabled={loading} className="w-full rounded-full py-3 text-sm font-medium text-accent-foreground transition disabled:opacity-60" style={{ background: "var(--gradient-gold)" }}>
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>
        <button onClick={onGoogle} className="mt-3 w-full rounded-full py-3 text-sm glass hover:text-gold transition">
          الدخول عبر Google
        </button>
        <div className="mt-6 flex items-center justify-between text-xs">
          <Link to="/signup" className="text-gold hover:underline">إنشاء حساب جديد</Link>
          <Link to="/forgot-password" className="text-muted-foreground hover:text-gold">نسيت كلمة السر؟</Link>
        </div>
      </div>
    </div>
  );
}