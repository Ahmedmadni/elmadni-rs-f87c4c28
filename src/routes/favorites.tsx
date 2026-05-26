import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PropertyCard } from "@/components/site/PropertyCard";
import { properties } from "@/lib/properties";
import { useFavorites } from "@/lib/property-store";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "المفضلة | المدني العقارية" },
      { name: "description", content: "العقارات التي أضفتها إلى مفضلتك." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const fav = useFavorites();
  const items = properties.filter((p) => fav.has(p.id));

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="pt-36 pb-16 px-6 mx-auto max-w-7xl">
        <div className="text-center">
          <div className="text-xs tracking-[0.3em] text-gold mb-3">FAVORITES</div>
          <h1 className="font-display text-4xl sm:text-5xl text-gold-gradient font-semibold">
            المفضلة
          </h1>
          <p className="mt-3 text-muted-foreground">
            {items.length} عقار محفوظ
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-16 rounded-3xl glass p-12 text-center max-w-xl mx-auto">
            <Heart size={40} className="mx-auto text-gold mb-4" />
            <p className="text-foreground/85">لم تقم بإضافة أي عقار للمفضلة بعد.</p>
            <Link
              to="/properties"
              className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-accent-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              تصفح العقارات
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}