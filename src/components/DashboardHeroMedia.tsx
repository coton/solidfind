"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  COMPANY_DASHBOARD_MEDIA_PLATFORM_SETTING_KEY,
  DASHBOARD_MEDIA_PLATFORM_SETTING_KEY,
  INDIVIDUAL_DASHBOARD_MEDIA_PLATFORM_SETTING_KEY,
  resolveMediaSetting,
} from "@/lib/platform-settings.mjs";

const DASHBOARD_MEDIA_FALLBACK = { url: "/images/bg-individual-page.png", type: "image" as const };

function DashboardMediaContent({
  url,
  type,
  alt,
  objectClassName,
  priority,
}: {
  url: string;
  type: "image" | "video";
  alt: string;
  objectClassName: string;
  priority?: boolean;
}) {
  if (type === "video") {
    return (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full ${objectClassName}`}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 900px) 100vw, 900px"
      className={objectClassName}
      priority={priority}
      unoptimized={url.startsWith("data:")}
    />
  );
}

export function DashboardHeroMedia({
  alt = "SolidFind",
  className = "",
  desktopAspectRatio = "900 / 200",
  mobileAspectRatio = "900 / 200",
  desktopObjectClassName = "object-cover object-center",
  mobileObjectClassName = "object-cover object-right-bottom",
  priority = false,
  variant = "individual",
}: {
  alt?: string;
  className?: string;
  desktopAspectRatio?: string;
  mobileAspectRatio?: string;
  desktopObjectClassName?: string;
  mobileObjectClassName?: string;
  priority?: boolean;
  variant?: "individual" | "company";
}) {
  const settingKey = variant === "company"
    ? COMPANY_DASHBOARD_MEDIA_PLATFORM_SETTING_KEY
    : INDIVIDUAL_DASHBOARD_MEDIA_PLATFORM_SETTING_KEY;
  const dashboardMediaValue = useQuery(api.platformSettings.get, { key: settingKey });
  const legacyDashboardMediaValue = useQuery(api.platformSettings.get, { key: DASHBOARD_MEDIA_PLATFORM_SETTING_KEY });
  const dashboardMediaState = resolveMediaSetting(dashboardMediaValue, { url: "", type: "image" });
  const legacyDashboardMediaState = resolveMediaSetting(legacyDashboardMediaValue, DASHBOARD_MEDIA_FALLBACK);
  const media = dashboardMediaState.media.url
    ? dashboardMediaState.media
    : legacyDashboardMediaState.media.url
      ? legacyDashboardMediaState.media
      : DASHBOARD_MEDIA_FALLBACK;

  return (
    <div className={`rounded-[6px] overflow-hidden ${className}`}>
      <div className="hidden sm:block relative w-full" style={{ aspectRatio: desktopAspectRatio }}>
        <DashboardMediaContent
          url={media.url}
          type={media.type}
          alt={alt}
          objectClassName={desktopObjectClassName}
          priority={priority}
        />
      </div>
      <div className="sm:hidden relative w-full" style={{ aspectRatio: mobileAspectRatio }}>
        <DashboardMediaContent
          url={media.url}
          type={media.type}
          alt={alt}
          objectClassName={mobileObjectClassName}
          priority={priority}
        />
      </div>
    </div>
  );
}
