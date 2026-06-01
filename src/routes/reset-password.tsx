import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "كلمة سر جديدة | مدني العقارية" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تم تحديث كلمة السر");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16 bg-background">
      <div className="w-full max-w-md rounded-3xl glass-strong p-8 luxe-shadow">
        <h1 className="text-2xl font-semibold text-center mb-6">كلمة سر جديدة</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة السر الجديدة" className="w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold" />
          <button disabled={loading} className="w-full rounded-full py-3 text-sm font-medium text-accent-foreground transition disabled:opacity-60" style={{ background: "var(--gradient-gold)" }}>
            {loading ? "جارٍ الحفظ..." : "حفظ كلمة السر"}
          </button>
        </form>
      </div>
    </div>
  );
}