import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { DeletionBannerWrapper } from "@/components/DeletionBannerWrapper";
import { SiteChrome } from "@/components/SiteChrome";
import { ViewTransitions } from "next-view-transitions";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const clerkLocalization = {
  signIn: {
    start: {
      subtitle: "Welcome back! Please sign in to continue.\nSelamat Datang kembali! Silakan masuk untuk melanjutkan.",
    },
    password: {
      subtitle: "Enter the password associated with your account:\nMasukkan kata sandi yang terkait dengan akun Anda:",
      actionLink: "Use another method\nGunakan metode lain",
    },
    newDeviceVerificationNotice:
      "You're signing in from a new device. We're asking for verification to keep your account secure.\nAnda masuk dari perangkat baru. Kami meminta verifikasi untuk menjaga keamanan akun Anda.",
  },
  footerActionLink__useAnotherMethod: "Use another method\nGunakan metode lain",
};

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
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInFallbackRedirectUrl="/auth-complete"
        signUpFallbackRedirectUrl="/auth-complete"
        signInForceRedirectUrl="/auth-complete"
        signUpForceRedirectUrl="/auth-complete"
        localization={clerkLocalization}
      >
        <html lang="en">
          <body
            className={`${sora.variable} font-sans antialiased`}
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            <NextTopLoader color="#f14110" showSpinner={false} height={3} />
            <ConvexClientProvider>
              <DeletionBannerWrapper />
              <SiteChrome>{children}</SiteChrome>
            </ConvexClientProvider>
          </body>
        </html>
      </ClerkProvider>
    </ViewTransitions>
  );
}
