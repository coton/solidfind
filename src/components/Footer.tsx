"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { AuthModal } from "./AuthModal";
import {
  normalizeContactHref,
  resolveTextSetting,
} from "@/lib/platform-settings.mjs";

const fallbackCategories = [
  { id: "construction", label: "Construction" },
  { id: "renovation", label: "Renovation" },
  { id: "architecture", label: "Architecture" },
  { id: "interior", label: "Interior" },
  { id: "real-estate", label: "Real Estate" },
];

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const pageConfigs = useQuery(api.pageConfigs.listVisible);
  const igUrl = useQuery(api.platformSettings.get, { key: "ig_url" });
  const igUrlState = resolveTextSetting(igUrl, "#");
  const contactUrl = useQuery(api.platformSettings.get, { key: "contact_url" });
  const contactUrlState = resolveTextSetting(contactUrl, "mailto:hello@solidfind.id");

  const igHref = igUrlState.value || "#";
  const mailHref = normalizeContactHref(contactUrlState.value);
  const { user } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileFooterOpen, setMobileFooterOpen] = useState(false);
  const [footerLanguage, setFooterLanguage] = useState<"EN" | "ID">("EN");
  const [aboutHref, setAboutHref] = useState("/about");
  const userType = (user?.publicMetadata?.accountType as string) || "individual";
  const accountDashboardHref = userType === "company" ? "/company-dashboard" : "/dashboard";
  const categories = pageConfigs?.length
    ? pageConfigs.map((category) => ({ id: category.categoryId, label: category.label.replace(/^\d+\.\s*/, "") }))
    : fallbackCategories;

  useEffect(() => {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    setAboutHref(window.location.pathname === "/about" ? currentPath : `/about?from=${encodeURIComponent(currentPath)}`);
  }, [pathname]);

  // Footer Account button behavior (same as Header):
  // - If logged in as individual: link to /dashboard
  // - If logged in as company: link to /company-dashboard
  // - If not logged in: open AuthModal

  return (
    <footer className="sf-footer">
      {/* AuthModal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
        initialAccountType="individual"
      />
      <div className="sf-footer-inner">
        <div className="sf-footer-brand">
          <div className="sf-footer-topline">
            <Link href="/" className="sf-footer-lockup">
              <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} />
              <span className="sf-brand-id">.id</span>
            </Link>
            <div className="sf-footer-mobile-actions" aria-label="Footer controls">
              <span className="sf-footer-lang" aria-label="Language">
                <button
                  type="button"
                  className={footerLanguage === "EN" ? "on" : ""}
                  onClick={() => setFooterLanguage("EN")}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={footerLanguage === "ID" ? "on" : ""}
                  onClick={() => setFooterLanguage("ID")}
                >
                  ID
                </button>
              </span>
              <button
                type="button"
                className="sf-footer-toggle"
                onClick={() => setMobileFooterOpen((open) => !open)}
                aria-expanded={mobileFooterOpen}
                aria-label={mobileFooterOpen ? "Close footer links" : "Open footer links"}
              >
                {mobileFooterOpen ? "↑" : "↓"}
              </button>
            </div>
          </div>
          <p>An independent platform for the places we live in.</p>
        </div>
        <div className={`sf-footer-cols sf-footer-collapsible ${mobileFooterOpen ? "is-open" : ""}`}>
          <div>
            <span className="sf-tag-mono">Categories</span>
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => router.push(`/?category=${category.id}`)}
              >
                {String(index + 1).padStart(2, "0")} · {category.label}
              </button>
            ))}
          </div>
          <div>
            <span className="sf-tag-mono">Build</span>
            {user ? (
              <Link href={accountDashboardHref}>For individuals</Link>
            ) : (
              <button type="button" onClick={() => setIsAuthModalOpen(true)}>For individuals</button>
            )}
            <Link href="/register-business">For professionals</Link>
            <Link href="/register-business">List your services</Link>
            <Link href="/upgrade">Pro guidelines</Link>
          </div>
          <div>
            <span className="sf-tag-mono">Solid</span>
            <Link href={aboutHref}>About</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <a href={mailHref}>Contact</a>
          </div>
        </div>
      </div>
      <div className="sf-footer-bar">
        <span>© 2026 SolidFind.id</span>
        <a href={igHref} target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
    </footer>
  );
}
