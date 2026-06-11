import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { CinematicIntro } from "@/components/site/CinematicIntro";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { MobileBottomNav } from "@/components/site/MobileBottomNav";
import { themeInitScript } from "@/components/site/ThemeToggle";
import { SoundEffects } from "@/components/site/SoundEffects";
import { AIAssistant } from "@/components/site/AIAssistant";
import { PageTransition } from "@/components/site/PageTransition";
import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { AuthProvider } from "@/hooks/use-auth";
import { InstallPrompt } from "@/components/site/InstallPrompt";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa-register";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "مدني العقارية | MADNI Real Estate — خبرة عقارية تثق بها" },
      { name: "description", content: "منصة عقارية مصرية فاخرة لشراء وبيع وطلب العقارات بتجربة سينمائية حديثة." },
      { property: "og:title", content: "مدني العقارية | MADNI Real Estate — خبرة عقارية تثق بها" },
      { property: "og:description", content: "منصة عقارية مصرية فاخرة لشراء وبيع وطلب العقارات بتجربة سينمائية حديثة." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "مدني العقارية" },
      { property: "og:locale", content: "ar_EG" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "مدني العقارية | MADNI Real Estate — خبرة عقارية تثق بها" },
      { name: "twitter:description", content: "منصة عقارية مصرية فاخرة لشراء وبيع وطلب العقارات بتجربة سينمائية حديثة." },
      { name: "theme-color", content: "#0F172A" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Madni" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kufam:wght@400;500;700&family=Alexandria:wght@300;400;500&family=Tajawal:wght@300;400&family=Cairo:wght@300;400&display=swap&v=20260611-listing",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          name: "مدني العقارية",
          alternateName: "MADNI Real Estate",
          url: "https://madni-realstate.online",
          logo: "https://madni-realstate.online/icons/icon-512.png",
          areaServed: [
            { "@type": "City", name: "مغاغة" },
            { "@type": "AdministrativeArea", name: "محافظة المنيا" },
          ],
          address: { "@type": "PostalAddress", addressLocality: "مغاغة", addressRegion: "المنيا", addressCountry: "EG" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "مدني العقارية",
          url: "https://madni-realstate.online",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://madni-realstate.online/properties?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SmoothScroll />
        <CinematicIntro />
        <PageTransition>
          <Outlet />
        </PageTransition>
        <MobileBottomNav />
        <SoundEffects />
        <AIAssistant />
        <FloatingWhatsApp />
        <InstallPrompt />
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
