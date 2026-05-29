import { WHATSAPP } from "@/lib/properties";
import { MessageCircle } from "lucide-react";

/**
 * Fixed floating WhatsApp button — always reachable from any page.
 * Placed bottom-left so it doesn't collide with the AI assistant (bottom-right)
 * and stays clear of the mobile bottom-nav via safe padding.
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={`${WHATSAPP}?text=${encodeURIComponent("مرحباً، أرغب بالاستفسار عن العقارات المتاحة لدى مدني العقارية.")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-24 left-5 lg:bottom-6 lg:left-6 z-50 grid place-content-center h-14 w-14 rounded-full text-white shadow-xl transition hover:scale-105 pulse-gold"
      style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)" }}
    >
      <MessageCircle size={26} />
    </a>
  );
}