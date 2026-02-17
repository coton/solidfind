import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ViewTransitions } from "next-view-transitions";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SOLIDFIND.ID - Bali's Trusted Directory for Construction & Renovation",
    template: "%s | SOLIDFIND.ID"
  },
  description: "Find trusted professionals to build, renovate, design and shape the places you live in. Browse verified construction companies, architects, and interior designers in Bali, Indonesia.",
  keywords: ["bali construction", "bali renovation", "bali architecture", "bali interior design", "bali contractors", "bali builders", "indonesia construction", "bali directory"],
  authors: [{ name: "SOLIDFIND.ID" }],
  creator: "SOLIDFIND.ID",
  publisher: "SOLIDFIND.ID",
  metadataBase: new URL("https://solidfind.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SOLIDFIND.ID - Bali's Trusted Directory for Construction & Renovation",
    description: "Find trusted professionals to build, renovate, design and shape the places you live in.",
    url: "https://solidfind.vercel.app",
    siteName: "SOLIDFIND.ID",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLIDFIND.ID - Bali's Trusted Directory",
    description: "Find trusted professionals to build, renovate, design and shape the places you live in.",
    creator: "@solidfind",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // TODO: Add real verification code
  },
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
            <NextTopLoader color="#f14110" showSpinner={false} height={3} />
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </body>
        </html>
      </ClerkProvider>
    </ViewTransitions>
  );
}
