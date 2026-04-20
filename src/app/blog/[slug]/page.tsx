import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { ComponentPropsWithoutRef } from "react";
import {
  getPostWithTags,
  getPublishedPostBySlug,
  getPublishedPosts,
  getRecommendedPublishedPostsByTagIds,
} from "@/lib/supabase/queries";
import FormLink from "@/components/FormLink";
import PublicHeader from "@/components/PublicHeader";
import PostEngagement from "@/components/PostEngagement";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infonet-flax.vercel.app";
const contactEmail = "online.upskill.dev@gmail.com";

type Params = {
  slug: string;
};

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

type MarkdownImageProps = ComponentPropsWithoutRef<"img">;

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

  let publishedPosts: Awaited<ReturnType<typeof getPublishedPosts>> = [];

  try {
    publishedPosts = (await getPublishedPosts()) || [];
  } catch {
    publishedPosts = [];
  }

  const sidebarPosts = publishedPosts.filter((candidate) => candidate.slug !== post.slug);
  const relatedPosts = sidebarPosts.slice(0, 2);
  const topStories = sidebarPosts.slice(0, 4);
  const categoryPosts = sidebarPosts.slice(0, 2);

  let recommendedPosts: Awaited<ReturnType<typeof getRecommendedPublishedPostsByTagIds>> = [];

  try {
    const postWithTags = await getPostWithTags(post.id);
    const tagIds = postWithTags.tags.map((tag) => tag.id);
    recommendedPosts = await getRecommendedPublishedPostsByTagIds({
      tagIds,
      excludePostId: post.id,
      limit: 6,
    });
  } catch {
    recommendedPosts = [];
  }

  const hasHeroImage = typeof post.featured_image_url === "string" && post.featured_image_url.trim().length > 0;

  const markdownComponents = {
    h1: ({ ...props }) => <h1 className="mt-10 mb-5 text-3xl font-bold leading-tight text-gray-900 dark:text-white" {...props} />,
    h2: ({ ...props }) => <h2 className="mt-10 mb-4 text-2xl font-bold leading-tight text-gray-900 dark:text-white" {...props} />,
    h3: ({ ...props }) => <h3 className="mt-8 mb-3 text-xl font-bold leading-snug text-gray-900 dark:text-white" {...props} />,
    p: ({ ...props }) => <p className="mb-5 text-[1.06rem] leading-8 text-gray-700 dark:text-gray-300" {...props} />,
    ul: ({ ...props }) => (
      <ul className="mb-6 list-outside list-disc space-y-2 pl-6 text-[1.03rem] text-gray-700 dark:text-gray-300" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="mb-6 list-outside list-decimal space-y-2 pl-6 text-[1.03rem] text-gray-700 dark:text-gray-300" {...props} />
    ),
    li: ({ ...props }) => <li className="pl-1 leading-8" {...props} />,
    blockquote: ({ ...props }) => (
      <blockquote
        className="my-8 border-l-0 px-0 text-[1.03rem] italic leading-8 text-gray-700 dark:text-gray-300"
        {...props}
      />
    ),
    img: ({ src, alt, ...props }: MarkdownImageProps) => {
      if (!src) return null;
      return (
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          className="mx-auto my-6 max-h-[520px] w-auto max-w-full rounded-2xl border border-gray-200 object-contain shadow-sm dark:border-gray-800"
          {...props}
        />
      );
    },
    code: (props: MarkdownCodeProps) =>
      props.inline ? (
        <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[0.92rem] text-slate-800 dark:bg-slate-800 dark:text-slate-100" {...props} />
      ) : (
        <code className="my-5 block overflow-x-auto rounded-xl bg-slate-100 p-4 font-mono text-[0.92rem] leading-7 text-slate-800 dark:bg-slate-800 dark:text-slate-100" {...props} />
      ),
    pre: ({ ...props }) => <pre className="mb-6 mt-2 overflow-x-auto" {...props} />,
    hr: ({ ...props }) => <hr className="my-10 border-slate-200 dark:border-gray-800" {...props} />,
    strong: ({ ...props }) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => {
      if (!href) {
        return <span className="text-blue-500">{children}</span>;
      }

      return (
        <FormLink href={href} className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-700">
          {children}
        </FormLink>
      );
    },
  } as const;

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
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-900 dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <PublicHeader />

      <div className="mx-auto max-w-[92rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.8fr)_minmax(320px,0.85fr)]">
          <div>
            <section className="overflow-hidden">
              {hasHeroImage ? (
                <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:float-left lg:mb-8 lg:mr-8 lg:w-[52%] lg:max-w-[52%]">
                  <img
                    src={post.featured_image_url as string}
                    alt={post.title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
              ) : null}

              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                {post.title}
              </h1>
              <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <time dateTime={post.published_at || post.created_at}>
                  {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </p>

              <article className="prose mt-8 max-w-none dark:prose-invert prose-a:no-underline [&_*]:font-sans">
                <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
              </article>
            </section>

            <div className="clear-both mt-12 space-y-6">
                <PostEngagement postId={post.id} postTitle={post.title} postSlug={post.slug} siteUrl={siteUrl} />

                <section className="rounded-[28px] border border-slate-200 bg-[#101826] p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Subscribe</p>
                  <h4 className="mt-3 text-3xl font-black leading-tight">Subscribe now for new posts</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Get updates when we publish new stories.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <FormLink
                      href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
                      className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
                    >
                      Subscribe Now
                    </FormLink>
                    <p className="text-xs text-slate-400">Send a message to {contactEmail}</p>
                  </div>
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-950">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">Recommended For You</h4>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-gray-800">
                    {recommendedPosts.length > 0 ? (
                      recommendedPosts.map((item, index) => (
                        <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                          <FormLink
                            href={`/blog/${item.slug}`}
                            className="grid w-full cursor-pointer grid-cols-[1fr_72px] items-start gap-4 text-left"
                          >
                            <div>
                              <p className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition hover:text-blue-600 dark:text-white sm:text-[1.05rem]">
                                {item.title}
                              </p>
                              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                InfoNet • {new Date(item.published_at || item.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })}
                              </p>
                            </div>

                            {item.featured_image_url ? (
                              <img
                                src={item.featured_image_url}
                                alt=""
                                className="h-16 w-16 rounded-xl object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className={`h-16 w-16 rounded-xl ${
                                  index % 3 === 0
                                    ? "bg-[linear-gradient(120deg,#0369a1_0%,#22d3ee_100%)]"
                                    : index % 3 === 1
                                      ? "bg-[linear-gradient(120deg,#be123c_0%,#fb7185_100%)]"
                                      : "bg-[linear-gradient(120deg,#334155_0%,#94a3b8_100%)]"
                                }`}
                              />
                            )}
                          </FormLink>
                        </article>
                      ))
                    ) : (
                      <p className="py-2 text-sm text-slate-500 dark:text-slate-400">
                        No recommendations yet.
                      </p>
                    )}
                  </div>
                </section>

            </div>
          </div>

          <aside className="space-y-8">
            <section className="p-0 sm:p-0">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Related Post</h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-gray-800">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((item, index) => (
                    <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <FormLink
                        href={`/blog/${item.slug}`}
                        className="grid w-full cursor-pointer grid-cols-[88px_1fr] items-start gap-4 text-left"
                      >
                        {item.featured_image_url ? (
                          <img
                            src={item.featured_image_url}
                            alt=""
                            className="h-20 w-[88px] rounded-md object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`h-20 w-[88px] rounded-md ${
                              index % 3 === 0
                                ? "bg-[linear-gradient(120deg,#0369a1_0%,#22d3ee_100%)]"
                                : index % 3 === 1
                                  ? "bg-[linear-gradient(120deg,#be123c_0%,#fb7185_100%)]"
                                  : "bg-[linear-gradient(120deg,#334155_0%,#94a3b8_100%)]"
                            }`}
                          />
                        )}
                        <div>
                          <p className="line-clamp-3 text-[1.35rem] font-bold leading-snug text-slate-900 underline underline-offset-2 transition hover:text-blue-600 dark:text-white sm:text-[1.45rem]">
                            {item.title}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.06em] text-slate-700 dark:text-slate-300">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" strokeLinecap="round" />
                            </svg>
                            {new Date(item.published_at || item.created_at)
                              .toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                              .toUpperCase()}
                          </p>
                        </div>
                      </FormLink>
                    </article>
                  ))
                ) : (
                  <p className="py-2 text-sm text-slate-500 dark:text-slate-400">No related posts yet.</p>
                )}
              </div>
            </section>

            <section className="p-0 sm:p-0">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Top Stories</h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-gray-800">
                {topStories.length > 0 ? (
                  topStories.map((item, index) => (
                    <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <FormLink
                        href={`/blog/${item.slug}`}
                        className="grid w-full cursor-pointer grid-cols-[88px_1fr] items-start gap-4 text-left"
                      >
                        {item.featured_image_url ? (
                          <img
                            src={item.featured_image_url}
                            alt=""
                            className="h-20 w-[88px] rounded-md object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`h-20 w-[88px] rounded-md ${
                              index % 3 === 0
                                ? "bg-[linear-gradient(120deg,#0369a1_0%,#22d3ee_100%)]"
                                : index % 3 === 1
                                  ? "bg-[linear-gradient(120deg,#be123c_0%,#fb7185_100%)]"
                                  : "bg-[linear-gradient(120deg,#334155_0%,#94a3b8_100%)]"
                            }`}
                          />
                        )}
                        <div>
                          <p className="line-clamp-3 text-[1.35rem] font-bold leading-snug text-slate-900 underline underline-offset-2 transition hover:text-blue-600 dark:text-white sm:text-[1.45rem]">
                            {item.title}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.06em] text-slate-700 dark:text-slate-300">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" strokeLinecap="round" />
                            </svg>
                            {new Date(item.published_at || item.created_at)
                              .toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                              .toUpperCase()}
                          </p>
                        </div>
                      </FormLink>
                    </article>
                  ))
                ) : (
                  <p className="py-2 text-sm text-slate-500 dark:text-slate-400">No top stories yet.</p>
                )}
              </div>
            </section>

            <section className="p-0 sm:p-0">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Category</h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-gray-800">
                {categoryPosts.length > 0 ? (
                  categoryPosts.map((item, index) => (
                    <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <FormLink
                        href={`/blog/${item.slug}`}
                        className="grid w-full cursor-pointer grid-cols-[88px_1fr] items-start gap-4 text-left"
                      >
                        {item.featured_image_url ? (
                          <img
                            src={item.featured_image_url}
                            alt=""
                            className="h-20 w-[88px] rounded-md object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`h-20 w-[88px] rounded-md ${
                              index % 3 === 0
                                ? "bg-[linear-gradient(120deg,#0369a1_0%,#22d3ee_100%)]"
                                : index % 3 === 1
                                  ? "bg-[linear-gradient(120deg,#be123c_0%,#fb7185_100%)]"
                                  : "bg-[linear-gradient(120deg,#334155_0%,#94a3b8_100%)]"
                            }`}
                          />
                        )}
                        <div>
                          <p className="line-clamp-3 text-[1.35rem] font-bold leading-snug text-slate-900 underline underline-offset-2 transition hover:text-blue-600 dark:text-white sm:text-[1.45rem]">
                            {item.title}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.06em] text-slate-700 dark:text-slate-300">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M12 7v5l3 2" strokeLinecap="round" />
                            </svg>
                            {new Date(item.published_at || item.created_at)
                              .toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                              .toUpperCase()}
                          </p>
                        </div>
                      </FormLink>
                    </article>
                  ))
                ) : (
                  <p className="py-2 text-sm text-slate-500 dark:text-slate-400">No categories yet.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
