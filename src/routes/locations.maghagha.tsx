import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "./index";

const URL = "https://madni-realstate.online/locations/maghagha";
const TITLE = "عقارات مغاغة | شقق وأراضي وبيوت للبيع في مغاغة - مدني العقارية";
const DESC =
  "أفضل العقارات في مدينة مغاغة بمحافظة المنيا: شقق، بيوت، أراضي، ومحلات للبيع والإيجار بأسعار تنافسية ومواقع مميزة مع مدني العقارية.";

export const Route = createFileRoute("/locations/maghagha")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "عقارات مغاغة, شقق مغاغة, أراضي مغاغة, بيوت مغاغة, عقارات المنيا, مدني العقارية" },
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
          name: "مدني العقارية - مغاغة",
          areaServed: { "@type": "City", name: "مغاغة", addressRegion: "المنيا", addressCountry: "EG" },
          url: URL,
        }),
      },
    ],
  }),
  component: MaghaghaPage,
});

function MaghaghaPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-36 pb-16 px-6">
        <SectionHeading
          kicker="LOCATION · مغاغة"
          title="عقارات مغاغة، المنيا"
          subtitle="نخبة من العقارات في قلب مدينة مغاغة — شقق سكنية، بيوت، أراضي استثمارية، ومحلات تجارية."
        />
        <article className="mx-auto max-w-4xl mt-10 space-y-6 text-foreground/85 leading-loose">
          <p>
            تُعد مدينة <strong>مغاغة</strong> من أهم مدن محافظة المنيا في صعيد مصر، وتشهد نمواً عمرانياً واستثمارياً متسارعاً.
            توفر <strong>مدني العقارية</strong> أفضل العروض العقارية في مغاغة سواء للسكن أو للاستثمار.
          </p>
          <h2 className="font-display text-2xl text-gold-gradient">لماذا تستثمر في مغاغة؟</h2>
          <ul className="list-disc pr-6 space-y-2">
            <li>موقع استراتيجي على طريق القاهرة - أسوان الزراعي.</li>
            <li>أسعار تنافسية مقارنة بالقاهرة والإسكندرية.</li>
            <li>نمو عمراني وبنية تحتية متطورة.</li>
            <li>قرب من المرافق الحيوية والخدمات.</li>
          </ul>
          <h2 className="font-display text-2xl text-gold-gradient">أنواع العقارات المتاحة</h2>
          <p>شقق سكنية حديثة، بيوت ودوبلكس، أراضي بناء ومزارع، محلات تجارية، ومكاتب إدارية.</p>
          <div className="pt-4">
            <Link
              to="/properties"
              className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold text-accent-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              تصفح عقارات مغاغة
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}