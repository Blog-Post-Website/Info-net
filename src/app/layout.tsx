import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://infonet-flax.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InfoNet Blog",
    template: "%s | InfoNet Blog",
  },
  description: "A production-ready blog about web development, engineering, and digital publishing.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "InfoNet Blog",
    title: "InfoNet Blog",
    description: "A production-ready blog about web development, engineering, and digital publishing.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InfoNet Blog",
    description: "A production-ready blog about web development, engineering, and digital publishing.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
