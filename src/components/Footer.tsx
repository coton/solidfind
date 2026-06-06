"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { AuthModal } from "./AuthModal";
import { useSiteLanguage } from "./LanguageProvider";
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
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("register");
  const [authModalAccountType, setAuthModalAccountType] = useState<"company" | "individual">("individual");
  const [mobileFooterOpen, setMobileFooterOpen] = useState(false);
  const [aboutHref, setAboutHref] = useState("/about");
  const { language, setLanguage, t } = useSiteLanguage();
  const userType = (user?.publicMetadata?.accountType as string) || "individual";
  const isCompanyUser = userType === "company";
  const labelFor = (english?: string, indonesian?: string) =>
    language === "id" && indonesian?.trim() ? indonesian : (english ?? "");
  const categories = pageConfigs?.length
    ? pageConfigs.map((category) => ({ id: category.categoryId, label: labelFor(category.label, (category as any).labelId).replace(/^\d+\.\s*/, "") }))
    : fallbackCategories;

  useEffect(() => {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    setAboutHref(window.location.pathname === "/about" ? currentPath : `/about?from=${encodeURIComponent(currentPath)}`);
  }, [pathname]);

  const openAuthModal = (accountType: "company" | "individual", mode: "login" | "register" = "register") => {
    setAuthModalAccountType(accountType);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  return (
    <footer className="sf-footer">
      {/* AuthModal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        initialAccountType={authModalAccountType}
      />
      <div className="sf-footer-inner">
        <div className="sf-footer-brand">
          <div className="sf-footer-topline">
            <Link href="/" className="sf-footer-lockup">
              <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} />
              <span className="sf-brand-id">.id</span>
            </Link>
            <div className="sf-footer-mobile-actions" aria-label="Footer controls">
              <button type="button" className="sf-footer-lang" onClick={toggleLanguage} aria-label={`Switch language to ${language === "en" ? "Indonesian" : "English"}`}>
                <span className={language === "en" ? "on" : ""}>EN</span>
                <span className={language === "id" ? "on" : ""}>ID</span>
              </button>
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
                {String(index + 1).padStart(2, "0")} · {t(category.label)}
              </button>
            ))}
          </div>
          <div>
            <span className="sf-tag-mono">{t("Build", "Bangun")}</span>
            {user ? (
              isCompanyUser ? (
                <button type="button" className="sf-footer-link-disabled" disabled>{t("For individuals", "Untuk individu")}</button>
              ) : (
                <Link href="/dashboard">{t("For individuals", "Untuk individu")}</Link>
              )
            ) : (
              <button type="button" onClick={() => openAuthModal("individual", "register")}>{t("For individuals", "Untuk individu")}</button>
            )}
            {user ? (
              isCompanyUser ? (
                <Link href="/company-dashboard">{t("For professionals", "Untuk profesional")}</Link>
              ) : (
                <button type="button" onClick={() => openAuthModal("company", "register")}>{t("For professionals", "Untuk profesional")}</button>
              )
            ) : (
              <button type="button" onClick={() => openAuthModal("company", "register")}>{t("For professionals", "Untuk profesional")}</button>
            )}
            {user ? (
              isCompanyUser ? (
                <Link href="/company-dashboard/edit">{t("List your services", "Daftarkan layanan")}</Link>
              ) : (
                <button type="button" onClick={() => openAuthModal("company", "register")}>{t("List your services", "Daftarkan layanan")}</button>
              )
            ) : (
              <button type="button" onClick={() => openAuthModal("company", "register")}>{t("List your services", "Daftarkan layanan")}</button>
            )}
            <Link href="/upgrade">{t("Pro guidelines", "Panduan Pro")}</Link>
          </div>
          <div>
            <span className="sf-tag-mono">Solid</span>
            <Link href={aboutHref}>{t("About", "Tentang")}</Link>
            <Link href="/terms">{t("Terms & Conditions", "Syarat & Ketentuan")}</Link>
            <a href={mailHref}>{t("Contact", "Kontak")}</a>
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
