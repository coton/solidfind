import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "../globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SOLIDFIND.ID - Coming Soon",
  description: "A curated platform connecting individuals and professionals across construction, renovation, and real estate.",
};

export default function ComingSoonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-sora), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
