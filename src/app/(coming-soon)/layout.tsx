import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
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
    <html lang="en" className="m-0 p-0">
      <body
        className={`${sora.variable} font-sans antialiased m-0 p-0 overflow-hidden`}
        style={{ fontFamily: "var(--font-sora), sans-serif" }}
      >
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
