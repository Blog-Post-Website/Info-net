"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FormLink from "@/components/FormLink";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published_at: string;
  featured_image_url?: string | null;
  is_featured?: boolean | null;
}

type Story = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  slug: string;
  live: boolean;
  rank: number;
  imageUrl?: string | null;
  likeCount: number;
  isFeatured: boolean;
};

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact", href: "/contact" },
];

const featuredTiles = [
  "bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#38bdf8_100%)]",
  "bg-[linear-gradient(135deg,#7c3aed_0%,#c4b5fd_100%)]",
  "bg-[linear-gradient(135deg,#0f766e_0%,#34d399_100%)]",
  "bg-[linear-gradient(135deg,#be123c_0%,#fb7185_100%)]",
  "bg-[linear-gradient(135deg,#334155_0%,#94a3b8_100%)]",
  "bg-[linear-gradient(135deg,#92400e_0%,#f59e0b_100%)]",
];

const contactEmail = "online.upskill.dev@gmail.com";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const displayName = useMemo(() => {
    if (!user) return "";
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const name = typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "";
    return name || user.email || "";
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (!user) return "";
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const url = typeof metadata?.avatar_url === "string" ? metadata.avatar_url.trim() : "";
    return url;
  }, [user]);

  const goToStory = (story: Story) => {
    if (!story.live) return;
    router.push(`/blog/${story.slug}`);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/public/posts?limit=12");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length === 0) {
      setLikeCounts({});
      return;
    }

    let cancelled = false;

    const fetchLikeCounts = async () => {
      try {
        const ids = posts.map((post) => post.id);
        const { data, error } = await supabase.from("post_likes").select("post_id").in("post_id", ids);
        if (error) throw error;

        const counts: Record<string, number> = {};
        for (const row of data ?? []) {
          const postId = (row as { post_id?: string }).post_id;
          if (!postId) continue;
          counts[postId] = (counts[postId] ?? 0) + 1;
        }

        if (!cancelled) setLikeCounts(counts);
      } catch (err) {
        console.error("Error fetching likes:", err);
        if (!cancelled) setLikeCounts({});
      }
    };

    void fetchLikeCounts();

    return () => {
      cancelled = true;
    };
  }, [posts]);

  const hasLivePosts = posts.length > 0;

  const stories: Story[] = hasLivePosts
    ? posts.map((post, index) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || post.content.substring(0, 170),
        category: navLinks[index % navLinks.length]?.label || "Tech",
        readTime: `${5 + (index % 6)} min read`,
        date: new Date(post.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        slug: post.slug,
        live: true,
        rank: index + 1,
        imageUrl: post.featured_image_url ?? null,
        likeCount: likeCounts[post.id] ?? 0,
        isFeatured: !!post.is_featured,
      }))
    : [];

  const featuredStories = useMemo(() => {
    if (!hasLivePosts) return stories.slice(0, 6);
    const featured = stories.filter((story) => story.isFeatured);
    return (featured.length > 0 ? featured : stories).slice(0, 6);
  }, [hasLivePosts, stories]);
  const topStories = useMemo(() => stories.slice(0, 4), [stories]);
  const trendingStories = useMemo(() => stories.slice(1, 7), [stories]);
  const latestStories = useMemo(() => stories.slice(4, 10), [stories]);
  const isWaitingForPosts = postsLoading && !hasLivePosts;

  const filteredLatest = searchQuery
    ? latestStories.filter((story) => {
        const q = searchQuery.toLowerCase();
        return story.title.toLowerCase().includes(q) || story.excerpt.toLowerCase().includes(q);
      })
    : latestStories;

  const renderStoryLink = (story: Story, className: string) => {
    if (!story.live) {
      return <span className={className}>{story.title}</span>;
    }

    return (
      <span onClick={(event) => event.stopPropagation()}>
        <FormLink href={`/blog/${story.slug}`} className={className}>
          {story.title}
        </FormLink>
      </span>
    );
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/blog");
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[92rem] items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <FormLink href="/" className="text-2xl font-black tracking-tight text-slate-900">
              InfoNet
            </FormLink>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium text-slate-700 lg:flex">
            {navLinks.map((link) => (
              <FormLink key={link.label} href={link.href} className="transition hover:text-blue-600">
                {link.label}
              </FormLink>
            ))}
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-4 lg:flex-[2] lg:gap-8">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 shadow-sm"
            >
              <button type="submit" className="text-slate-500 transition hover:text-slate-900" aria-label="Search blog">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </form>

            {!user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <FormLink
                  href={`/auth/login?next=${encodeURIComponent("/")}`}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Sign In
                </FormLink>
                <FormLink
                  href={`/auth/signup?next=${encodeURIComponent("/")}`}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Register
                </FormLink>
              </div>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {(displayName || user.email || "U")[0]?.toUpperCase()}
                  </div>
                )}
                <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">{displayName}</p>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.refresh();
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[92rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3 text-sm text-slate-600 lg:hidden">
          <div className="flex flex-wrap gap-3">
            {navLinks.map((link) => (
              <FormLink key={link.label} href={link.href} className="font-medium transition hover:text-blue-600">
                {link.label}
              </FormLink>
            ))}
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2.8fr)_minmax(320px,0.85fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Featured Article</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Editorial grid
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isWaitingForPosts ? (
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <article
                      key={`featured-loading-${index}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white animate-pulse"
                      aria-hidden="true"
                    >
                      <div className="h-40 bg-slate-200" />
                      <div className="space-y-3 p-4">
                        <div className="h-3 w-3/4 rounded bg-slate-200" />
                        <div className="h-7 w-full rounded bg-slate-200" />
                        <div className="h-3 w-full rounded bg-slate-200" />
                        <div className="h-3 w-5/6 rounded bg-slate-200" />
                      </div>
                    </article>
                  ))}
                </>
              ) : featuredStories.length > 0 ? (
                featuredStories.map((story, index) => (
                <article
                  key={story.id}
                  className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${story.live ? "cursor-pointer" : "cursor-default"}`}
                  role={story.live ? "link" : undefined}
                  tabIndex={story.live ? 0 : -1}
                  onClick={() => goToStory(story)}
                  onKeyDown={(event) => {
                    if (!story.live) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goToStory(story);
                    }
                  }}
                >
                  <div className={`relative h-40 ${story.imageUrl ? "bg-slate-900" : featuredTiles[index % featuredTiles.length]}`}>
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/15" />
                  </div>

                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span>{story.date}</span>
                        <span>•</span>
                        <span>{story.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                          <path
                            d="M12 20.5s-7-4.5-9.5-9C.6 8 .9 5.4 3 3.5 4.9 1.7 8 2 10 4c.7.7 1.3 1.6 2 2.8.7-1.2 1.3-2.1 2-2.8 2-2 5.1-2.3 7-.5 2.1 1.9 2.4 4.5.5 8-2.5 4.5-9.5 9-9.5 9z"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{story.likeCount}</span>
                      </div>
                    </div>

                    {renderStoryLink(story, "block cursor-pointer text-lg font-bold leading-snug transition hover:text-blue-600")}

                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">{story.excerpt}</p>

                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      {story.live ? (
                        <span onClick={(event) => event.stopPropagation()}>
                          <FormLink href={`/blog/${story.slug}`} className="cursor-pointer transition hover:text-blue-700">
                            Explore Now
                          </FormLink>
                        </span>
                      ) : (
                        <span>Explore Now</span>
                      )}
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-[2]" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M14.6 9.4 13.3 13.3 9.4 14.6 10.7 10.7z" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
                ))
              ) : (
                <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-base font-semibold text-slate-700">No featured stories yet</p>
                  <p className="mt-2 text-sm text-slate-500">Publish posts or mark posts as featured from the admin panel.</p>
                </div>
              )}
            </div>

            {isWaitingForPosts && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                Loading latest posts from the server. Please wait a moment.
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-3xl font-black tracking-tight">Top Stories</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Now</span>
            </div>
            <div className="divide-y divide-slate-100">
              {isWaitingForPosts ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <article key={`top-loading-${index}`} className="animate-pulse py-4 first:pt-0 last:pb-0" aria-hidden="true">
                    <div className="grid grid-cols-[1fr_72px] items-start gap-4">
                      <div className="space-y-2">
                        <div className="h-4 w-11/12 rounded bg-slate-200" />
                        <div className="h-4 w-8/12 rounded bg-slate-200" />
                        <div className="h-3 w-5/12 rounded bg-slate-200" />
                      </div>
                      <div className="h-16 w-16 rounded-xl bg-slate-200" />
                    </div>
                  </article>
                ))
              ) : (
                topStories.map((story, index) => (
                <article
                  key={story.id}
                  className={`py-4 first:pt-0 last:pb-0 ${story.live ? "cursor-pointer" : "cursor-default"}`}
                  role={story.live ? "link" : undefined}
                  tabIndex={story.live ? 0 : -1}
                  onClick={() => goToStory(story)}
                  onKeyDown={(event) => {
                    if (!story.live) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goToStory(story);
                    }
                  }}
                >
                  <div className="grid grid-cols-[1fr_72px] items-start gap-4">
                    <div>
                      {renderStoryLink(story, "line-clamp-2 cursor-pointer text-lg font-bold leading-snug transition hover:text-blue-600")}
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        InfoNet • {story.date}
                      </p>
                    </div>
                    {story.imageUrl ? (
                      <img
                        src={story.imageUrl}
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
                  </div>
                </article>
                ))
              )}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2.8fr)_minmax(320px,0.85fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black tracking-tight">Latest News</h3>
                <p className="mt-2 text-sm text-slate-500">Fresh posts and editor notes from the desk</p>
              </div>
              <FormLink href="/blog" className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold transition hover:bg-slate-50">
                See all
              </FormLink>
            </div>

            <div className="space-y-4">
              {isWaitingForPosts ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <article
                    key={`latest-loading-${index}`}
                    className="grid gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:grid-cols-[140px_1fr] animate-pulse"
                    aria-hidden="true"
                  >
                    <div className="h-24 rounded-2xl bg-slate-200" />
                    <div className="space-y-3">
                      <div className="h-6 w-10/12 rounded bg-slate-200" />
                      <div className="h-4 w-full rounded bg-slate-200" />
                      <div className="h-4 w-9/12 rounded bg-slate-200" />
                    </div>
                  </article>
                ))
              ) : (
                (searchQuery ? filteredLatest : latestStories).map((story, index) => (
                <article
                  key={story.id}
                  className={`grid gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:grid-cols-[140px_1fr] ${story.live ? "cursor-pointer" : "cursor-default"}`}
                  role={story.live ? "link" : undefined}
                  tabIndex={story.live ? 0 : -1}
                  onClick={() => goToStory(story)}
                  onKeyDown={(event) => {
                    if (!story.live) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goToStory(story);
                    }
                  }}
                >
                  {story.imageUrl ? (
                    <img
                      src={story.imageUrl}
                      alt=""
                      className="h-24 w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`h-24 rounded-2xl ${
                        index % 3 === 0
                          ? "bg-[linear-gradient(120deg,#0369a1_0%,#22d3ee_100%)]"
                          : index % 3 === 1
                            ? "bg-[linear-gradient(120deg,#be123c_0%,#fb7185_100%)]"
                            : "bg-[linear-gradient(120deg,#334155_0%,#94a3b8_100%)]"
                      }`}
                    />
                  )}
                  <div>
                    {renderStoryLink(story, "cursor-pointer text-2xl font-black leading-tight transition hover:text-blue-600")}
                    <p className="mt-2 text-sm text-slate-600">{story.excerpt}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                      {story.category} • {story.date}
                    </p>
                  </div>
                </article>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-[#101826] p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Subscribe</p>
              <h4 className="mt-3 text-3xl font-black leading-tight">Get the latest tech stories first</h4>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Join readers who want concise, high-signal updates on engineering, AI, security, and product strategy.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <FormLink
                  href={`mailto:${contactEmail}?subject=InfoNet%20Subscribe%20Request`}
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-emerald-400"
                >
                  Subscribe via email
                </FormLink>
                <p className="text-xs text-slate-400">Send a message to {contactEmail}</p>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-2xl font-black">Editor Picks</h4>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Selected
                </span>
              </div>
              <div className="space-y-3">
                {isWaitingForPosts ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <article key={`editor-loading-${index}`} className="rounded-2xl border border-slate-200 p-4 animate-pulse" aria-hidden="true">
                      <div className="h-3 w-1/4 rounded bg-slate-200" />
                      <div className="mt-3 h-6 w-11/12 rounded bg-slate-200" />
                      <div className="mt-3 h-3 w-6/12 rounded bg-slate-200" />
                    </article>
                  ))
                ) : (
                  stories.slice(0, 3).map((story) => (
                  <article key={story.id} className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Editor Pick</p>
                    <div className="mt-2 text-lg font-bold leading-snug">{renderStoryLink(story, "transition hover:text-blue-600")}</div>
                    <p className="mt-2 text-sm text-slate-600">{story.date} • {story.readTime}</p>
                  </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>

        {!hasLivePosts && !postsLoading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            No published posts found yet. Publish from the admin dashboard and refresh to display real stories.
          </div>
        )}
      </div>
    </main>
  );
}
