/** @typedef {{ url: string, type: "image" | "video" }} PlatformMediaValue */

export const HEADER_MEDIA_PLATFORM_SETTING_KEY = "headerMedia";
export const FOOTER_MEDIA_PLATFORM_SETTING_KEY = "footerMedia";
export const AD_VERTICAL_PLATFORM_SETTING_KEY = "adVertical";
export const DASHBOARD_MEDIA_PLATFORM_SETTING_KEY = "dashboardMedia";
export const COMPANY_DASHBOARD_MEDIA_PLATFORM_SETTING_KEY = "companyDashboardMedia";
export const INDIVIDUAL_DASHBOARD_MEDIA_PLATFORM_SETTING_KEY = "individualDashboardMedia";

/**
 * @param {string | null | undefined} value
 * @param {PlatformMediaValue} [fallback]
 * @returns {PlatformMediaValue}
 */
export function parseMediaSetting(value, fallback = { url: "", type: "image" }) {
  if (!value) return { ...fallback };

  try {
    const parsed = JSON.parse(value);
    return {
      url: typeof parsed?.url === "string" ? parsed.url : fallback.url,
      type: parsed?.type === "video" ? "video" : "image",
    };
  } catch {
    return {
      url: value,
      type: fallback.type === "video" ? "video" : "image",
    };
  }
}

/**
 * @param {string | null | undefined} value
 * @param {string} [fallback]
 * @returns {{ isLoading: boolean, value: string }}
 */
export function resolveTextSetting(value, fallback = "") {
  if (value === undefined) {
    return { isLoading: true, value: "" };
  }

  const trimmed = typeof value === "string" ? value.trim() : "";
  return {
    isLoading: false,
    value: normalizeReviewedIndonesianText(trimmed || fallback),
  };
}

/**
 * @param {string | null | undefined} value
 * @param {PlatformMediaValue} [fallback]
 * @returns {{ isLoading: boolean, media: PlatformMediaValue }}
 */
export function resolveMediaSetting(value, fallback = { url: "", type: "image" }) {
  if (value === undefined) {
    return {
      isLoading: true,
      media: { url: "", type: fallback.type === "video" ? "video" : "image" },
    };
  }

  return {
    isLoading: false,
    media: parseMediaSetting(value, fallback),
  };
}

/**
 * @param {string | null | undefined} value
 * @param {string} [fallback]
 * @returns {string}
 */
export function normalizeContactHref(value, fallback = "mailto:hello@solidfind.id") {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return fallback;

  if (/^(mailto:|https?:\/\/|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes("@")) {
    return `mailto:${trimmed}`;
  }

  return trimmed;
}
import { normalizeReviewedIndonesianText } from "@/lib/reviewed-indonesian-copy.mjs";
