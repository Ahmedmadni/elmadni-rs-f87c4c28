import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://madni-realstate.online";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/properties", changefreq: "daily", priority: "0.9" },
          { path: "/request", changefreq: "weekly", priority: "0.8" },
          { path: "/sell", changefreq: "weekly", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/projects", changefreq: "weekly", priority: "0.7" },
          { path: "/compare", changefreq: "monthly", priority: "0.4" },
          { path: "/locations/maghagha", changefreq: "weekly", priority: "0.9" },
          { path: "/locations/minya", changefreq: "weekly", priority: "0.9" },
        ];

        const propertyEntries: SitemapEntry[] = [];
        try {
          const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          if (url && key) {
            const sb = createClient(url, key);
            const { data } = await sb
              .from("properties")
              .select("id,code,updated_at")
              .eq("review_status", "approved")
              .eq("published", true)
              .order("updated_at", { ascending: false })
              .limit(2000);
            for (const row of data ?? []) {
              const slug = (row as { code?: string | null; id: string }).code ?? row.id;
              const upd = (row as { updated_at?: string | null }).updated_at;
              propertyEntries.push({
                path: `/properties/${slug}`,
                lastmod: upd ? new Date(upd).toISOString() : undefined,
                changefreq: "weekly",
                priority: "0.8",
              });
            }
          }
        } catch {
          // best-effort; static entries still ship
        }

        const entries = [...staticEntries, ...propertyEntries];
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});