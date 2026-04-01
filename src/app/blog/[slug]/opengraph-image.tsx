import { ImageResponse } from "next/og";
import { getPublishedPostBySlug } from "@/lib/supabase/queries";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let title = "InfoNet Blog";
  let description = "Engineering stories and practical guides";

  try {
    const post = await getPublishedPostBySlug(slug);
    title = post.title;
    description = post.meta_description || post.excerpt || post.content.substring(0, 110);
  } catch {
    // Keep fallback copy if post is unavailable.
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(120deg, #1e293b 0%, #0f766e 60%, #14b8a6 100%)",
          color: "white",
          padding: "52px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.92 }}>INFONET ARTICLE</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1040 }}>{title}</div>
        <div style={{ fontSize: 26, opacity: 0.95, maxWidth: 1020 }}>{description}</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
