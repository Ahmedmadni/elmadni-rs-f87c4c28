import { createServerFn } from "@tanstack/react-start";

/**
 * Headless WordPress integration (REST API).
 *
 * Set the env var WORDPRESS_API_URL to your site's REST endpoint, e.g.
 *   WORDPRESS_API_URL=https://your-wp-site.com/wp-json/wp/v2
 *
 * Optional: WORDPRESS_PROPERTY_CPT to override the custom post type slug
 * (defaults to "properties"). Optional: WORDPRESS_AUTH for "Bearer ..." or
 * "Basic ..." if your endpoints require auth.
 */

type WpImage = { source_url?: string };
type WpEmbedded = { ["wp:featuredmedia"]?: WpImage[] };

export type WpPost = {
  id: number;
  slug: string;
  link: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  featuredImage: string | null;
  meta?: Record<string, unknown>;
};

function base(): string | null {
  const v = process.env.WORDPRESS_API_URL;
  return v ? v.replace(/\/$/, "") : null;
}

async function wpFetch<T>(path: string): Promise<T> {
  const root = base();
  if (!root) throw new Error("WORDPRESS_API_URL is not configured");
  const auth = process.env.WORDPRESS_AUTH;
  const res = await fetch(`${root}${path}`, {
    headers: {
      Accept: "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
  });
  if (!res.ok) throw new Error(`WordPress request failed: ${res.status}`);
  return (await res.json()) as T;
}

function normalize(raw: {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  date: string;
  meta?: Record<string, unknown>;
  _embedded?: WpEmbedded;
}): WpPost {
  const media = raw._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  return {
    id: raw.id,
    slug: raw.slug,
    link: raw.link,
    title: raw.title.rendered,
    excerpt: raw.excerpt?.rendered ?? "",
    content: raw.content?.rendered ?? "",
    date: raw.date,
    featuredImage: media,
    meta: raw.meta,
  };
}

export const getWordPressPosts = createServerFn({ method: "GET" })
  .inputValidator(
    (d: { perPage?: number; page?: number; cpt?: string } | undefined) => d ?? {},
  )
  .handler(async ({ data }) => {
    if (!base()) return { configured: false as const, posts: [] as WpPost[] };
    const cpt = data.cpt || process.env.WORDPRESS_PROPERTY_CPT || "posts";
    const perPage = data.perPage ?? 12;
    const page = data.page ?? 1;
    const raw = await wpFetch<Parameters<typeof normalize>[0][]>(
      `/${cpt}?per_page=${perPage}&page=${page}&_embed=wp:featuredmedia`,
    );
    return { configured: true as const, posts: raw.map(normalize) };
  });

export const getWordPressPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string; cpt?: string }) => d)
  .handler(async ({ data }) => {
    if (!base()) return { configured: false as const, post: null as WpPost | null };
    const cpt = data.cpt || process.env.WORDPRESS_PROPERTY_CPT || "posts";
    const raw = await wpFetch<Parameters<typeof normalize>[0][]>(
      `/${cpt}?slug=${encodeURIComponent(data.slug)}&_embed=wp:featuredmedia`,
    );
    return { configured: true as const, post: raw[0] ? normalize(raw[0]) : null };
  });