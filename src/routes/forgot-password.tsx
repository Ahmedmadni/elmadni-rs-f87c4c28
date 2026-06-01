import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "استعادة كلمة السر | مدني العقارية" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("تم إرسال رابط إعادة التعيين إلى بريدك");
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16 bg-background">
      <div className="w-full max-w-md rounded-3xl glass-strong p-8 luxe-shadow">
        <h1 className="text-2xl font-semibold text-center mb-6">استعادة كلمة السر</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold" />
          <button disabled={loading} className="w-full rounded-full py-3 text-sm font-medium text-accent-foreground transition disabled:opacity-60" style={{ background: "var(--gradient-gold)" }}>
            {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
          </button>
        </form>
        <div className="mt-6 text-center text-xs">
          <Link to="/login" className="text-gold hover:underline">عودة لتسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}