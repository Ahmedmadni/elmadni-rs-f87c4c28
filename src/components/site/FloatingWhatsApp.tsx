import { WHATSAPP } from "@/lib/properties";

/**
 * Fixed floating WhatsApp button — always reachable from any page.
 * Placed bottom-left, with the AI assistant button sitting right beside it.
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
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3.2c-7.1 0-12.86 5.76-12.86 12.86 0 2.27.6 4.48 1.73 6.43L3.2 28.8l6.48-1.69a12.8 12.8 0 0 0 6.36 1.66h.01c7.09 0 12.85-5.76 12.85-12.86 0-3.43-1.34-6.66-3.77-9.09a12.76 12.76 0 0 0-9.09-3.62zm0 23.1h-.01a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-3.85 1 1.03-3.75-.26-.39a10.65 10.65 0 0 1-1.63-5.68c0-5.9 4.8-10.69 10.7-10.69 2.86 0 5.54 1.12 7.56 3.14a10.6 10.6 0 0 1 3.13 7.56c0 5.9-4.8 10.53-10.83 10.53zm5.87-7.99c-.32-.16-1.9-.94-2.2-1.05-.29-.1-.5-.16-.72.16-.21.32-.82 1.05-1.01 1.27-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.91-1.79-2.23-.19-.32-.02-.5.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.25 3.43 5.45 4.81.76.33 1.35.52 1.82.67.76.24 1.46.21 2.01.13.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37z" />
      </svg>
    </a>
  );
}