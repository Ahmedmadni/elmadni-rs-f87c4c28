import { Link } from "@tanstack/react-router";
import { PHONE, WHATSAPP } from "@/lib/properties";
import { Phone, MessageCircle, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import logo from "@/assets/madni-logo.png";

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-gold/15">
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, oklch(0.32 0.09 160 / 0.5), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className="h-12 w-12 rounded-full ring-1 ring-gold/40" />
            <div>
              <div className="font-display text-2xl text-gold-gradient">مدني العقارية</div>
              <div className="text-xs tracking-[0.3em] text-muted-foreground">MADNI · MAGHAGHA · MINYA</div>
            </div>
          </div>
          <p className="mt-5 text-muted-foreground leading-loose max-w-md">
            خبرة عقارية تثق بها. نقدم تجربة فاخرة لشراء وبيع وطلب العقارات في
            قلب مغاغة بمحافظة المنيا وصعيد مصر.
          </p>
        </div>

        <div>
          <h4 className="text-gold font-semibold mb-4">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/properties" className="hover:text-gold">العقارات</Link></li>
            <li><Link to="/request" className="hover:text-gold">طلب عقار</Link></li>
            <li><Link to="/sell" className="hover:text-gold">اعرض عقارك</Link></li>
            <li><Link to="/about" className="hover:text-gold">من نحن</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-gold font-semibold mb-4">تواصل معنا</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2" dir="ltr">
              <Phone size={16} className="text-gold" />
              <a href={`tel:${PHONE}`} className="hover:text-gold">{PHONE}</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={16} className="text-gold" />
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="hover:text-gold">
                واتساب مباشر
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gold" />
              <a href="mailto:elmadnima@gmail.com" className="hover:text-gold">elmadnima@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-gold" />
              <span>مغاغة، المنيا</span>
            </li>
          </ul>
          <div className="flex gap-3 mt-5">
            <a href="#" className="p-2 rounded-full glass hover:text-gold"><Facebook size={16} /></a>
            <a href="#" className="p-2 rounded-full glass hover:text-gold"><Instagram size={16} /></a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-6 border-t border-gold/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
        <div>© {new Date().getFullYear()} مدني العقارية. جميع الحقوق محفوظة.</div>
        <div>صُمّم بأناقة لتجربة عقارية فاخرة.</div>
      </div>
    </footer>
  );
}