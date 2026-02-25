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
    <html lang="en" style={{ margin: 0, padding: 0, width: '100%', height: '100%' }}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0 !important; padding: 0 !important; width: 100%; height: 100%; overflow: hidden; }
        ` }} />
      </head>
      <body
        className={`${sora.variable} font-sans antialiased`}
        style={{ 
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          fontFamily: "var(--font-sora), sans-serif"
        }}
      >
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
