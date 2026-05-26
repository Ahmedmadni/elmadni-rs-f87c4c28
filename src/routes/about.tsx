import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "./index";
import { ShieldCheck, Award, Users, Building2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | المدني العقارية" },
      { name: "description", content: "تعرف على المدني العقارية — خبرة سنوات في السوق العقاري المصري." },
      { property: "og:title", content: "من نحن | المدني العقارية" },
      { property: "og:description", content: "خبرة عقارية تثق بها." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const values = [
    { i: ShieldCheck, t: "الثقة", d: "علاقات طويلة الأمد مبنية على الشفافية." },
    { i: Award, t: "التميّز", d: "نختار العقارات بمعايير عالية لعملائنا." },
    { i: Users, t: "الخدمة", d: "فريق خبير يرافقك في كل خطوة." },
    { i: Building2, t: "الخبرة", d: "معرفة عميقة بالسوق العقاري المصري." },
  ];
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-36 pb-12 px-6">
        <SectionHeading kicker="ABOUT · من نحن" title="خبرة عقارية تثق بها" subtitle="المدني العقارية شريكك الموثوق في رحلتك العقارية في مصر." />

        <div className="mt-12 mx-auto max-w-4xl rounded-3xl glass-strong p-10 leading-loose text-foreground/85">
          نؤمن بأن العقار ليس مجرد مكان، بل استثمار في حياتك ومستقبل عائلتك.
          منذ تأسيسنا، نسعى إلى تقديم تجربة عقارية فاخرة تجمع بين الذوق الرفيع
          والممارسات الاحترافية، عبر فريق متخصص يفهم احتياجاتك ويعمل لتحقيقها.
        </div>

        <div className="mt-12 mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.t} className="rounded-2xl glass p-6">
              <v.i className="text-gold" size={24} />
              <div className="font-display text-2xl mt-3">{v.t}</div>
              <p className="text-sm text-muted-foreground mt-2">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}