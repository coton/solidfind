"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const rootNonProfilePages = new Set([
  "about",
  "admin",
  "auth-complete",
  "coming-soon",
  "company-dashboard",
  "dashboard",
  "register-business",
  "reviews",
  "sign-in",
  "sign-up",
  "sso-callback",
  "terms",
  "upgrade",
]);

function usesPersistentChrome(pathname: string): boolean {
  if (pathname === "/") return true;

  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 1 && !rootNonProfilePages.has(segments[0]);
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!usesPersistentChrome(pathname)) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header showResultsBar={pathname === "/"} />
      {children}
      <Footer />
    </div>
  );
}
