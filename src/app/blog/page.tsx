import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/supabase/queries";
import FormLink from "@/components/FormLink";
import PublicHeader from "@/components/PublicHeader";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest articles on web development, software engineering, and publishing.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | InfoNet Blog",
    description: "Read the latest articles on web development, software engineering, and publishing.",
    url: "/blog",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "InfoNet Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | InfoNet Blog",
    description: "Read the latest articles on web development, software engineering, and publishing.",
    images: ["/opengraph-image"],
  },
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infonet-flax.vercel.app";

  try {
    posts = (await getPublishedPosts()) || [];
  } catch {
    posts = [];
  }

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "InfoNet Blog",
    description: "Read the latest articles on web development, software engineering, and publishing.",
    url: `${siteUrl}/blog`,
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/blog/${post.slug}`,
      name: post.title,
    })),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold">Blog</h1>
          <p className="text-lg text-blue-100">
            Thoughts on web development, technology, and digital publishing.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-gray-200 pb-8 dark:border-gray-700">
                <FormLink href={`/blog/${post.slug}`} className="contents">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 transition-colors hover:text-blue-500 dark:text-white">
                    {post.title}
                  </h2>
                </FormLink>
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <time dateTime={post.published_at || post.created_at}>
                    {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <p className="mb-4 line-clamp-3 text-gray-700 dark:text-gray-300">
                  {post.excerpt || post.content.substring(0, 160)}...
                </p>
                <FormLink href={`/blog/${post.slug}`} className="font-medium text-blue-500 transition-colors hover:text-blue-600">
                  Read more {"->"}
                </FormLink>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No posts published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
