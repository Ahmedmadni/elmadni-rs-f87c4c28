import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "./index";

const URL = "https://madni-realstate.online/locations/minya";
const TITLE = "عقارات المنيا | شقق وأراضي وفلل للبيع في المنيا - مدني العقارية";
const DESC =
  "أفضل العقارات في محافظة المنيا: شقق، فلل، أراضي، ومحلات للبيع والإيجار في كل مدن وقرى المنيا بأسعار مميزة مع مدني العقارية.";

export const Route = createFileRoute("/locations/minya")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "عقارات المنيا, شقق المنيا, أراضي المنيا, فلل المنيا, عقارات صعيد مصر, مدني العقارية" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: "مدني العقارية - المنيا",
          areaServed: { "@type": "AdministrativeArea", name: "محافظة المنيا", addressCountry: "EG" },
          url: URL,
        }),
      },
    ],
  }),
  component: MinyaPage,
});

function MinyaPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-36 pb-16 px-6">
        <SectionHeading
          kicker="LOCATION · المنيا"
          title="عقارات محافظة المنيا"
          subtitle="أفضل الفرص العقارية في عروس الصعيد — المنيا، مغاغة، بني مزار، ملوي، سمالوط وأبو قرقاص."
        />
        <article className="mx-auto max-w-4xl mt-10 space-y-6 text-foreground/85 leading-loose">
          <p>
            توفر <strong>مدني العقارية</strong> أوسع تشكيلة من العقارات في محافظة المنيا، بداية من المنيا الجديدة
            مروراً بمغاغة وملوي وحتى أصغر القرى. سواء كنت تبحث عن شقة للسكن، أرض للاستثمار، أو محل تجاري —
            فلدينا الخيار المناسب لك.
          </p>
          <h2 className="font-display text-2xl text-gold-gradient">المدن والمناطق التي نخدمها</h2>
          <ul className="grid grid-cols-2 gap-2 pr-6 list-disc">
            <li>المنيا الجديدة</li>
            <li>مغاغة</li>
            <li>بني مزار</li>
            <li>ملوي</li>
            <li>سمالوط</li>
            <li>أبو قرقاص</li>
            <li>مطاي</li>
            <li>دير مواس</li>
          </ul>
          <h2 className="font-display text-2xl text-gold-gradient">لماذا مدني العقارية؟</h2>
          <p>خبرة محلية موثوقة، تسعير شفاف، وفريق متخصص لمساعدتك في اتخاذ القرار الأنسب.</p>
          <div className="pt-4 flex gap-3 flex-wrap">
            <Link
              to="/properties"
              className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              تصفح عقارات المنيا
            </Link>
            <Link to="/locations/maghagha" className="inline-flex items-center rounded-full px-6 py-3 text-sm glass hover:text-gold">
              عقارات مغاغة
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}