import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Post Website",
  description: "A production-ready human-operated blog platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
