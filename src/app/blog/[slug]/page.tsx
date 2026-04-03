import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPublishedPostBySlug } from "@/lib/supabase/queries";
import FormLink from "@/components/FormLink";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infonet-flax.vercel.app";

type Params = {
  slug: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPublishedPostBySlug(slug);
    const description = post.meta_description || post.excerpt || post.content.substring(0, 160);

    return {
      title: post.title,
      description,
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
      openGraph: {
        type: "article",
        title: post.title,
        description,
        url: `/blog/${post.slug}`,
        publishedTime: post.published_at || post.created_at,
        images: [
          {
            url: `/blog/${post.slug}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [`/blog/${post.slug}/opengraph-image`],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPublishedPostBySlug>> | null = null;

  try {
    post = await getPublishedPostBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || post.content.substring(0, 160),
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: "InfoNet",
    },
    publisher: {
      "@type": "Organization",
      name: "InfoNet",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-12 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-blue-100">
            <time dateTime={post.published_at || post.created_at}>
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <article className="prose max-w-none dark:prose-invert prose-a:no-underline">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => (
                <h1 className="mt-8 mb-4 text-3xl font-bold text-gray-900 dark:text-white" {...props} />
              ),
              h2: ({ ...props }) => (
                <h2 className="mt-6 mb-3 text-2xl font-bold text-gray-900 dark:text-white" {...props} />
              ),
              h3: ({ ...props }) => (
                <h3 className="mt-5 mb-2 text-xl font-bold text-gray-900 dark:text-white" {...props} />
              ),
              p: ({ ...props }) => (
                <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />
              ),
              ul: ({ ...props }) => (
                <ul className="mb-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="mb-4 list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300" {...props} />
              ),
              li: ({ ...props }) => <li className="ml-2" {...props} />,
              blockquote: ({ ...props }) => (
                <blockquote
                  className="my-4 border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400"
                  {...props}
                />
              ),
              code: (props: any) =>
                props.inline ? (
                  <code
                    className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800"
                    {...props}
                  />
                ) : (
                  <code
                    className="my-4 block overflow-auto rounded bg-gray-100 p-4 font-mono text-sm dark:bg-gray-800"
                    {...props}
                  />
                ),
              pre: ({ ...props }) => <pre className="mb-4" {...props} />,
              a: ({ children, href }) => {
                if (!href) {
                  return <span className="text-blue-500">{children}</span>;
                }

                return (
                  <FormLink href={href} className="text-blue-500 transition hover:text-blue-600">
                    {children}
                  </FormLink>
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <FormLink href="/blog" className="font-medium text-blue-500 transition-colors hover:text-blue-600">
            {"<-"} Back to blog
          </FormLink>
        </div>
      </div>
    </div>
  );
}
