import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import logo from "@/assets/madni-logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "إنشاء حساب | مدني العقارية" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: fullName, phone },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("تم إنشاء الحساب — مرحباً بك!");
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16 bg-background">
      <div className="w-full max-w-md rounded-3xl glass-strong p-8 luxe-shadow">
        <Link to="/" className="flex flex-col items-center gap-3 mb-6">
          <img src={logo} alt="مدني" className="h-14 w-14 rounded-full ring-1 ring-gold/40" />
          <div className="font-display text-xl text-gold-gradient font-semibold">مدني العقارية</div>
        </Link>
        <h1 className="text-2xl font-semibold text-center mb-6">إنشاء حساب جديد</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="الاسم الكامل" value={fullName} onChange={setFullName} required />
          <Field label="رقم الهاتف" value={phone} onChange={setPhone} required />
          <Field label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} required />
          <Field label="كلمة السر" type="password" value={password} onChange={setPassword} required />
          <button disabled={loading} className="w-full rounded-full py-3 text-sm font-medium text-accent-foreground transition disabled:opacity-60" style={{ background: "var(--gradient-gold)" }}>
            {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          لديك حساب؟ <Link to="/login" className="text-gold hover:underline">تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold" />
    </div>
  );
}