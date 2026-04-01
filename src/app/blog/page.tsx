import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/supabase/queries";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | InfoNet Blog",
    description: "Read the latest articles on web development, software engineering, and publishing.",
  },
};

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];

  try {
    posts = (await getPublishedPosts()) || [];
  } catch {
    posts = [];
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 transition-colors hover:text-blue-500 dark:text-white">
                    {post.title}
                  </h2>
                </Link>
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
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-medium text-blue-500 transition-colors hover:text-blue-600"
                >
                  Read more {"->"}
                </Link>
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
