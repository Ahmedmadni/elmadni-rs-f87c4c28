import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function PurchaseRequestForm({ propertyId }: { propertyId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || phone.trim().length < 6) {
      toast.error("يرجى إدخال اسم ورقم هاتف صحيحين");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("purchase_requests").insert({
      property_id: propertyId,
      buyer_name: name.trim(),
      buyer_phone: phone.trim(),
      buyer_email: email.trim() || null,
      message: message.trim() || null,
      buyer_user_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تم إرسال طلبك، سيتم التواصل معك قريباً");
    setName(""); setPhone(""); setEmail(""); setMessage("");
  };

  return (
    <form onSubmit={submit} className="rounded-3xl glass-strong p-6 luxe-shadow space-y-3">
      <h2 className="font-display text-2xl text-gold-gradient mb-2">اطلب الشراء أو الاستفسار</h2>
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" className="w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold text-sm" />
      <div className="grid sm:grid-cols-2 gap-3">
        <input required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الهاتف" className="w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold text-sm" />
        <input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني (اختياري)" className="w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold text-sm" />
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="رسالتك (اختياري)" className="w-full rounded-xl glass px-4 py-3 outline-none focus:ring-1 focus:ring-gold text-sm min-h-[100px] resize-none" />
      <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-accent-foreground disabled:opacity-60" style={{ background: "var(--gradient-gold)" }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        إرسال الطلب
      </button>
    </form>
  );
}