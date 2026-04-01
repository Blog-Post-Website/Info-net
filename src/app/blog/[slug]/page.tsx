"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  published_at: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Fetch published post by slug from public endpoint
        const res = await fetch(`/api/public/posts/${slug}`);
        if (res.ok) {
          const found = await res.json();
          setPost(found);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Post not found
        </h1>
        <Link href="/blog" className="text-blue-500 hover:text-blue-600">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-blue-100">
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <article className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />
              ),
              h2: ({ ...props }) => (
                <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" {...props} />
              ),
              h3: ({ ...props }) => (
                <h3 className="text-xl font-bold mt-5 mb-2 text-gray-900 dark:text-white" {...props} />
              ),
              p: ({ ...props }) => (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props} />
              ),
              ul: ({ ...props }) => (
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2" {...props} />
              ),
              li: ({ ...props }) => <li className="ml-2" {...props} />,
              blockquote: ({ ...props }) => (
                <blockquote
                  className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
                  {...props}
                />
              ),
              code: (props: any) =>
                props.inline ? (
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono" {...props} />
                ) : (
                  <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded my-4 overflow-auto text-sm font-mono" {...props} />
                ),
              pre: ({ ...props }) => <pre className="mb-4" {...props} />,
              a: ({ ...props }) => (
                <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link href="/blog" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
            ← Back to blog
          </Link>
        </div>
      </div>
    </div>
  );
}
