import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SolidFind - Bali Directory",
  description: "Find trusted professionals to build, renovate, design and shape the places you live in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        dynamic
      >
        <html lang="en">
          <body
            className={`${sora.variable} font-sans antialiased`}
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </body>
        </html>
      </ClerkProvider>
    </ViewTransitions>
  );
}
