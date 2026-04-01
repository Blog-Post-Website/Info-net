import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/supabase/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infonet-flax.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const posts = await getPublishedPosts();
    const postRoutes: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || post.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
