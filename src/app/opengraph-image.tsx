import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #0f766e 45%, #34d399 100%)",
          color: "white",
          padding: "56px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 600, opacity: 0.9, letterSpacing: 1.2 }}>INFONET BLOG</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.08, maxWidth: 980 }}>
          Engineering stories and practical guides
        </div>
        <div style={{ fontSize: 28, opacity: 0.95 }}>Web development, publishing, and product craftsmanship</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
