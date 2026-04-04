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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infonet-flax.vercel.app";
const contactEmail = "online.upskill.dev@gmail.com";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact", href: "/contact" },
];

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

  const summary = post.excerpt || post.meta_description || post.content.substring(0, 220);
  const hasHeroImage = typeof post.featured_image_url === "string" && post.featured_image_url.trim().length > 0;

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
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 dark:bg-gray-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto flex max-w-[92rem] items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <FormLink href="/" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              InfoNet
            </FormLink>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium text-slate-700 dark:text-slate-200 lg:flex">
            {navLinks.map((link) => (
              <FormLink key={link.label} href={link.href} className="transition hover:text-blue-600">
                {link.label}
              </FormLink>
            ))}
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-6 lg:max-w-[760px]">
            <form
              action="/blog"
              method="get"
              className="flex w-full min-w-0 flex-1 max-w-[760px] items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-950"
            >
              <button type="submit" className="text-slate-500 transition hover:text-slate-900 dark:hover:text-white" aria-label="Search blog">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <input
                type="search"
                name="search"
                placeholder="Search"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </form>

            <FormLink
              href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
              className="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:inline-flex"
            >
              Subscribe Now
            </FormLink>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[92rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2.8fr)_minmax(320px,0.85fr)]">
          <div>
            <header className={hasHeroImage ? "grid gap-8 lg:grid-cols-[1.25fr_1fr]" : ""}>
              {hasHeroImage ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <img
                    src={post.featured_image_url as string}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}

              <div>
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

                <p className="mt-6 text-base leading-7 text-slate-700 dark:text-slate-300">{summary}</p>
              </div>
            </header>

            <div className="mt-10">
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
                    p: ({ ...props }) => <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
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
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800" {...props} />
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

              <div className="mt-12 space-y-6">
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
                              <p className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition hover:text-blue-600 dark:text-white">
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

                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <FormLink href="/blog" className="font-medium text-blue-500 transition-colors hover:text-blue-600">
                    {"<-"} Back to blog
                  </FormLink>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-950 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Related Post</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-gray-800">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((item, index) => (
                    <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <FormLink
                        href={`/blog/${item.slug}`}
                        className="grid w-full cursor-pointer grid-cols-[1fr_72px] items-start gap-4 text-left"
                      >
                        <div>
                          <p className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition hover:text-blue-600 dark:text-white">
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
                  <p className="py-2 text-sm text-slate-500 dark:text-slate-400">No related posts yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-950 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Top Stories</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-gray-800">
                {topStories.length > 0 ? (
                  topStories.map((item, index) => (
                    <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <FormLink
                        href={`/blog/${item.slug}`}
                        className="grid w-full cursor-pointer grid-cols-[1fr_72px] items-start gap-4 text-left"
                      >
                        <div>
                          <p className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition hover:text-blue-600 dark:text-white">
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
                  <p className="py-2 text-sm text-slate-500 dark:text-slate-400">No top stories yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-gray-800 dark:bg-gray-950 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Category</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-gray-800">
                {categoryPosts.length > 0 ? (
                  categoryPosts.map((item, index) => (
                    <article key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <FormLink
                        href={`/blog/${item.slug}`}
                        className="grid w-full cursor-pointer grid-cols-[1fr_72px] items-start gap-4 text-left"
                      >
                        <div>
                          <p className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition hover:text-blue-600 dark:text-white">
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
