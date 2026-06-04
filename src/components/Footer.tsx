"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { usePathname } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { AuthModal } from "./AuthModal";
import {
  FOOTER_MEDIA_PLATFORM_SETTING_KEY,
  normalizeContactHref,
  resolveMediaSetting,
  resolveTextSetting,
} from "@/lib/platform-settings.mjs";

export function Footer() {
  const footerMediaValue = useQuery(api.platformSettings.get, { key: FOOTER_MEDIA_PLATFORM_SETTING_KEY });
  const pageConfigs = useQuery(api.pageConfigs.listVisible);
  const pathname = usePathname();
  const footerMediaState = resolveMediaSetting(footerMediaValue, { url: "", type: "image" });
  const footerMedia = footerMediaState.media;
  const igUrl = useQuery(api.platformSettings.get, { key: "ig_url" });
  const igUrlState = resolveTextSetting(igUrl, "#");
  const igVisible = useQuery(api.platformSettings.get, { key: "ig_visible" });
  const igVisibleState = resolveTextSetting(igVisible, "true");
  const contactUrl = useQuery(api.platformSettings.get, { key: "contact_url" });
  const contactUrlState = resolveTextSetting(contactUrl, "mailto:hello@solidfind.id");

  const igHref = igUrlState.value || "#";
  const mailHref = normalizeContactHref(contactUrlState.value);
  const showIg = igVisibleState.value !== "false";
  const { user } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const userType = (user?.publicMetadata?.accountType as string) || "individual";
  const accountDashboardHref = userType === "company" ? "/company-dashboard" : "/dashboard";
  const aboutHref = pathname === "/about" ? "/about" : `/about?from=${encodeURIComponent(pathname)}`;
  const footerCategories = pageConfigs?.length
    ? pageConfigs.map((page) => ({ id: page.categoryId, label: page.label.replace(/^\d+\.\s*/, "") }))
    : [
      { id: "construction", label: "Construction" },
      { id: "renovation", label: "Renovation" },
    ];

  // Footer Account button behavior (same as Header):
  // - If logged in as individual: link to /dashboard
  // - If logged in as company: link to /company-dashboard
  // - If not logged in: open AuthModal

  return (
    <div className="px-3 pb-3 pt-8 sm:px-5 sm:pb-5">
      <footer className="relative z-0 min-h-[280px] overflow-hidden rounded-t-[var(--sf-radius-page)] bg-[var(--sf-ink)] text-white">
      {/* AuthModal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
        initialAccountType="individual"
      />
      
      {footerMedia.url ? (
        <div className="absolute inset-0">
          {footerMedia.type === "video" ? (
            <video src={footerMedia.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
          ) : (
            <Image
              src={footerMedia.url}
              alt="Footer background"
              fill
              className="object-cover"
              unoptimized={footerMedia.url.startsWith("data:")}
            />
          )}
          <div className="absolute inset-0 bg-black/25" />
        </div>
      ) : footerMediaState.isLoading ? (
        <div className="absolute inset-0 bg-[#e4e4e4]" />
      ) : (
        <div className="absolute inset-0 bg-[var(--sf-ink)]" />
      )}
      <div className="relative z-10 mx-auto grid max-w-[var(--sf-content)] gap-10 px-6 py-10 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] sm:px-10 sm:py-14">
        <div>
          <Image src="/images/logo-full-white.svg" alt="SolidFind.id" width={176} height={20} className="mb-6 h-5 w-auto" />
          <p className="max-w-[420px] text-[14px] leading-[var(--sf-lh-loose)] text-white/72">
            SolidFind.id is an independent platform built to bring clarity, trust, and perspective to the places we live in.
          </p>
          <div className="mt-7 flex items-center gap-4">
            {showIg && (
              <a href={igHref} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-white/18">
                <Image src="/images/footer-ig.svg" alt="Instagram" width={18} height={18} />
              </a>
            )}
            <a href={mailHref} className="grid h-9 w-9 place-items-center rounded-full border border-white/18">
              <Image src="/images/footer-mail.svg" alt="Email" width={21} height={17} />
            </a>
          </div>
        </div>
        <div>
          <p className="sf-tag-light mb-4">Categories</p>
          <nav className="flex flex-col gap-3 text-[14px] text-white/72">
            {footerCategories.map((category) => (
              <Link key={category.id} href={`/?category=${category.id}`}>{category.label}</Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="sf-tag-light mb-4">Build</p>
          <nav className="flex flex-col gap-3 text-[14px] text-white/72">
            <Link href={aboutHref}>About</Link>
            {user ? (
              <Link href={accountDashboardHref}>Dashboard</Link>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="text-left">For individuals</button>
            )}
            <button onClick={() => setIsAuthModalOpen(true)} className="text-left">List your services</button>
          </nav>
        </div>
        <div>
          <p className="sf-tag-light mb-4">Solid</p>
          <nav className="flex flex-col gap-3 text-[14px] text-white/72">
            <Link href="/terms">Terms & Conditions</Link>
            <a href={mailHref}>Contact</a>
          </nav>
        </div>
      </div>
      <div className="relative z-10 mx-auto flex max-w-[var(--sf-content)] flex-col gap-2 border-t border-white/10 px-6 py-5 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <span>© {new Date().getFullYear()} SolidFind.id</span>
        <span>An independent platform for the places we live in.</span>
      </div>
      </footer>
    </div>
  );
}
