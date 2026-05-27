import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "./index";
import { PHONE, WHATSAPP } from "@/lib/properties";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | مدني العقارية" },
      { name: "description", content: "تواصل مع مدني العقارية للاستفسار عن العقارات أو الخدمات." },
      { property: "og:title", content: "تواصل معنا | مدني العقارية" },
      { property: "og:description", content: "نحن في خدمتك." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const items = [
    { i: Phone, t: "اتصل بنا", v: PHONE, href: `tel:${PHONE}`, ltr: true },
    { i: MessageCircle, t: "واتساب", v: "تواصل مباشر", href: WHATSAPP },
    { i: Mail, t: "البريد", v: "info@elmadni.com", href: "mailto:info@elmadni.com", ltr: true },
    { i: MapPin, t: "العنوان", v: "مغاغة، المنيا" },
  ];
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-36 pb-12 px-6">
        <SectionHeading kicker="CONTACT · تواصل" title="نحن في خدمتك دائماً" subtitle="اختر القناة الأنسب لك وسيرد عليك أحد خبرائنا فوراً." />

        <div className="mt-12 mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => {
            const Inner = (
              <>
                <it.i className="text-gold" size={22} />
                <div className="font-display text-xl mt-3">{it.t}</div>
                <div className={`text-sm text-muted-foreground mt-1 ${it.ltr ? "" : ""}`} dir={it.ltr ? "ltr" : undefined}>{it.v}</div>
              </>
            );
            return it.href ? (
              <a key={it.t} href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                className="rounded-2xl glass p-6 hover:text-gold transition">
                {Inner}
              </a>
            ) : (
              <div key={it.t} className="rounded-2xl glass p-6">{Inner}</div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}