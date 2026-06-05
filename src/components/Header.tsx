"use client";

import { Suspense, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { AuthModal } from "@/components/AuthModal";
import { SortDropdown } from "@/components/SortDropdown";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { useProEnabled } from "@/hooks/useProEnabled";
import {
  HEADER_MEDIA_PLATFORM_SETTING_KEY,
  resolveMediaSetting,
} from "@/lib/platform-settings.mjs";
import {
  encodeSubcategoryParam,
  getEffectiveSubcategoryFilters,
  getSubcategoryDisplayText,
  isSubcategoryFilterActive,
  isSubcategoryOptionSelected,
  parseSubcategoryParam,
  toggleSubcategorySelection,
} from "@/lib/category-filter.mjs";
import { expandRenovationTypes } from "@/lib/category-display.mjs";

function getCompanyCategoryTypes(company: any, category: string) {
  if (category === "renovation") return expandRenovationTypes(company.renovationTypes ?? []);
  if (category === "architecture") return company.architectureTypes ?? [];
  if (category === "interior") return company.interiorTypes ?? [];
  if (category === "real-estate") return company.realEstateTypes ?? [];
  return company.constructionTypes ?? (company.subcategory ? [company.subcategory] : []);
}

// Fallback categories shown while DB config is loading or if empty
// Only include the initially visible ones to prevent flash of hidden tabs
const mainCategories = [
  { id: "construction", label: "01. Construction" },
  { id: "renovation", label: "02. Renovation" },
];

// All categories (kept for reference / subtitle fallback)
const allCategories = [
  { id: "construction", label: "01. Construction" },
  { id: "renovation", label: "02. Renovation" },
  { id: "architecture", label: "03. Architecture" },
  { id: "interior", label: "04. Interior" },
  { id: "real-estate", label: "05. Real Estate" },
];

const categorySubtitles: Record<string, string> = {
  construction: "Find construction professionals for residential, commercial and hospitality projects.",
  renovation: "Find renovation professionals for complete upgrades, targeted improvements, and structural works.",
  architecture: "Find architecture studios for concept design, planning, and project development.",
  interior: "Find interior professionals for space planning, styling, furnitures and full interior projects.",
  "real-estate": "Find real estate professionals for property acquisition, sales, and investment opportunities.",
};

const projectSizeOptions = [
  { id: "any", label: "ANY SIZE" },
  { id: "solo", label: "SOLO / COUPLE (1-2)" },
  { id: "family", label: "FAMILY / CO-HOSTING (3-6)" },
  { id: "shared", label: "SHARED / COMMUNITY (7+)" },
];

const constructionCategories = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "hospitality", label: "HOSPITALITY" },
];

const renovationCategories = [
  { id: "all", label: "EVERY RENOVATIONS" },
  { id: "complete", label: "COMPLETE HOUSE" },
  { id: "living", label: "LIVING ROOM" },
  { id: "kitchen", label: "KITCHEN" },
  { id: "bathroom", label: "BATHROOM" },
  { id: "bedroom", label: "BEDROOM" },
  { id: "aircon", label: "AIRCON" },
  { id: "electricity", label: "ELECTRICITY" },
  { id: "plumbing", label: "PLUMBING" },
  { id: "roofing", label: "ROOFING" },
  { id: "waterproofing", label: "WATERPROOFING" },
  { id: "pool", label: "POOL" },
  { id: "mold", label: "MOLD TREATMENT" },
  { id: "tiling", label: "TILING" },
  { id: "painting", label: "PAINTING" },
  { id: "fencing", label: "FENCING" },
];

const architectureCategories = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "renovations-extensions", label: "RENOVATIONS & EXTENSIONS" },
  { id: "sustainable-eco", label: "SUSTAINABLE / ECO-ARCHI." },
];

const interiorCategories = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "hospitality", label: "HOSPITALITY" },
  { id: "furnitures", label: "FURNITURES" },
  { id: "lighting", label: "LIGHTING" },
  { id: "styling-decoration", label: "STYLING & DECORATION" },
];

const realEstateCategories = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "land-development", label: "LAND & DEVELOPMENT PLOTS" },
  { id: "property-management", label: "PROPERTY MANAGEMENT" },
  { id: "legal-notary", label: "LEGAL & NOTARY SERVICES" },
];

const locationOptions = [
  { id: "bali", label: "BALI" },
  { id: "badung", label: "BADUNG" },
  { id: "denpasar", label: "DENPASAR" },
  { id: "tabanan", label: "TABANAN" },
  { id: "gianyar", label: "GIANYAR" },
  { id: "klungkung", label: "KLUNGKUNG" },
  { id: "karangasem", label: "KARANGASEM" },
  { id: "bangli", label: "BANGLI" },
  { id: "buleleng", label: "BULELENG" },
  { id: "jembrana", label: "JEMBRANA" },
];

interface DropdownProps {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
  isProjectSize?: boolean;
  // Multi-select support (for location)
  multiSelect?: boolean;
  selectedValues?: string[];
  displayText?: string;
  isActive?: boolean;
  // Special function to check if an option should be selected (for BALI toggle)
  isOptionSelected?: (optionId: string) => boolean;
  // Align menu to right edge of button
  alignRight?: boolean;
  menuClassName?: string;
  isMobileCategoryDropdown?: boolean;
  closeSignal?: number;
}

function Dropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  width = "w-[140px]", 
  isProjectSize = false,
  multiSelect = false,
  selectedValues = [],
  displayText,
  isActive = false,
  isOptionSelected,
  alignRight = false,
  menuClassName = '',
  isMobileCategoryDropdown = false,
  closeSignal = 0,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    setIsOpen(false);
  }, [closeSignal]);

  // For PROJECT SIZE: remove numbers in parentheses when closed
  const getDisplayLabel = (fullLabel: string) => {
    if (!isProjectSize) return fullLabel;
    return fullLabel.replace(/\s*\([^)]*\)/, '');
  };

  // Get display text for button
  const getButtonText = () => {
    if (displayText) return displayText;
    if (selectedOption) return getDisplayLabel(selectedOption.label);
    return label;
  };

  // Determine if button should show active color
  const buttonIsActive = multiSelect ? isActive : !!value;

  return (
    <div className={`sf-dd relative ${width} ${isOpen ? 'z-[80]' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sf-dd-trigger w-full"
        style={{ letterSpacing: '0.12px' }}
      >
        <span className="sf-dd-label">{label}</span>
        <span className={`sf-dd-value ${buttonIsActive ? 'is-active text-[#f14110]' : 'is-ph'}`}>
          {getButtonText().replace(/^PROJECT SIZE$/i, "Any size").replace(/^CATEGORIES$/i, "All types").replace(/^LOCATION$/i, "Anywhere")}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div 
            className={`absolute top-full mt-[2px] z-[70] bg-white rounded-[6px] shadow-lg w-max max-w-[calc(100vw-40px)] ${
              alignRight ? 'right-0' : 'left-0'
            } ${menuClassName}`}
          >
            <div className={`pt-2 pb-[10px] px-3 ${isMobileCategoryDropdown ? 'pr-4' : ''}`}>
              {options.map((option, index) => {
                const isSelected = isOptionSelected 
                  ? isOptionSelected(option.id)
                  : (multiSelect 
                      ? selectedValues.includes(option.id)
                      : value === option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onChange(option.id);
                      if (!multiSelect) {
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full text-left py-2 text-[11px] flex items-center gap-[5px] ${
                      index < options.length - 1 ? 'mb-[2px]' : ''
                    } ${
                      isSelected ? 'text-[#f14110]' : 'text-[#333]'
                    }`}
                    style={{ 
                      fontFamily: 'var(--font-sora), sans-serif', 
                      fontWeight: 500,
                      letterSpacing: '0.22px',
                      borderBottom: index === 0 ? '1px solid #e4e4e4' : 'none'
                    }}
                  >
                    <span className="min-w-0 flex-1 inline-flex items-center min-h-3 leading-[14px]">{option.label}</span>
                    <div 
                      className={`flex-shrink-0 w-6 h-3 rounded-full ${isSelected ? 'bg-gradient-to-l from-[#f14110] to-[#e9a28e]' : 'bg-[#333]/25'}`}
                    >
                      <div className={`w-2 h-2 bg-white rounded-full mt-0.5 transition-all ${isSelected ? 'ml-3.5' : 'ml-0.5'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type HeaderProps = {
  resultCount?: number;
  sortControl?: ReactNode;
  showResultsBar?: boolean;
};

export function Header(props: HeaderProps = {}) {
  return (
    <Suspense fallback={null}>
      <HeaderInner {...props} />
    </Suspense>
  );
}

function HeaderInner({ resultCount, sortControl, showResultsBar = false }: HeaderProps) {
  const { user, signOut } = useClerk();
  const reviewsEnabled = useReviewsEnabled();
  const proEnabled = useProEnabled();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageConfigs = useQuery(api.pageConfigs.listVisible);
  const headerMediaValue = useQuery(api.platformSettings.get, { key: HEADER_MEDIA_PLATFORM_SETTING_KEY });
  const headerMediaState = resolveMediaSetting(headerMediaValue, { url: "", type: "image" });
  const headerMedia = headerMediaState.media;

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  // pageConfigs is undefined while loading, [] if loaded but empty
  const pageConfigsLoaded = pageConfigs !== undefined;

  // Build dynamic categories from pageConfigs, falling back to hardcoded only when loaded empty
  const dynamicCategories = useMemo(() => {
    if (!pageConfigsLoaded) return mainCategories; // still loading — use hardcoded as initial render
    if (pageConfigs.length === 0) return mainCategories; // loaded but empty — fallback
    return pageConfigs.map((p) => ({ id: p.categoryId, label: p.label }));
  }, [pageConfigs, pageConfigsLoaded]);

  const dynamicSubtitles = useMemo(() => {
    if (!pageConfigsLoaded || pageConfigs.length === 0) return categorySubtitles;
    const subs: Record<string, string> = {};
    for (const p of pageConfigs) {
      subs[p.categoryId] = p.subtitle;
    }
    return subs;
  }, [pageConfigs, pageConfigsLoaded]);

  // Build a lookup for filters by categoryId
  const configFiltersMap = useMemo(() => {
    if (!pageConfigsLoaded || pageConfigs.length === 0) return null;
    const map: Record<string, typeof pageConfigs[0]["filters"]> = {};
    for (const p of pageConfigs) {
      map[p.categoryId] = p.filters;
    }
    return map;
  }, [pageConfigs, pageConfigsLoaded]);

  const [keywords, setKeywords] = useState(searchParams.get("search") ?? "");
  const [projectSizes, setProjectSizes] = useState<string[]>(
    searchParams.get("projectSize") ? searchParams.get("projectSize")!.split(",").filter(Boolean) : []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>(
    searchParams.get("location") ? searchParams.get("location")!.split(",") : []
  );
  const [sortBy, setSortBy] = useState("latest");
  const lastCategoryButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mobileCategoryEndSpacerWidth, setMobileCategoryEndSpacerWidth] = useState(0);

  // Auth modal state
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalAccountType, setAuthModalAccountType] = useState<"company" | "individual">("individual");
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("register");
  const [dropdownCloseSignal, setDropdownCloseSignal] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileMiniHeader, setShowMobileMiniHeader] = useState(false);

  const openAuthModal = (accountType: "company" | "individual" = "individual", mode: "login" | "register" = "register") => {
    setDropdownCloseSignal((current) => current + 1);
    setMobileMenuOpen(false);
    setAuthModalAccountType(accountType);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const isDashboardPage = pathname.startsWith("/dashboard") || pathname.startsWith("/company-dashboard");
  const isCompanyDashboardPage = pathname.startsWith("/company-dashboard");
  const rootNonProfilePages = new Set(["/", "/about", "/admin", "/auth-complete", "/coming-soon", "/register-business", "/reviews", "/sso-callback", "/terms", "/upgrade"]);
  const isProfilePage = pathname.startsWith("/profile") || (
    pathname.split("/").filter(Boolean).length === 1 &&
    !rootNonProfilePages.has(pathname)
  );
  const isArticlePage = pathname.startsWith("/article");
  const fromCategory = searchParams.get("from");
  
  // Deactivate category highlighting only for:
  // - Dashboard pages
  // - Article pages opened from shared link (no fromCategory)
  const activeCategory = isDashboardPage || (isArticlePage && !fromCategory)
    ? null
    : isProfilePage
      ? (fromCategory || null)
      : (searchParams.get("category") ?? "construction");
  const useMobileCompactHeader = isDashboardPage;
  const useTopBarOnlyHeader = isCompanyDashboardPage;
  const homepageSubcategories = getEffectiveSubcategoryFilters(parseSubcategoryParam(searchParams.get("subcategory") || undefined));
  const homepageCompanies = useQuery(
    api.companies.list,
    showResultsBar
      ? {
        category: activeCategory ?? "construction",
        location: searchParams.get("location") || undefined,
        search: searchParams.get("search") || undefined,
        projectSize: searchParams.get("projectSize") || undefined,
      }
      : "skip"
  );
  const visibleCategoryIds = pageConfigs?.map((p) => p.categoryId) ?? null;
  const homepageResultCount = useMemo(() => {
    if (!showResultsBar) return resultCount ?? 0;
    if (!homepageCompanies) return resultCount ?? 0;
    return homepageCompanies
      .filter((company) => !visibleCategoryIds || visibleCategoryIds.includes(company.category))
      .filter((company) => {
        if (homepageSubcategories.length === 0) return true;
        const companyTypes = getCompanyCategoryTypes(company, activeCategory ?? "construction").map((type: string) => type.toLowerCase());
        return (
          companyTypes.includes("all") ||
          companyTypes.includes("every") ||
          homepageSubcategories.some((subcategory) => companyTypes.includes(subcategory))
        );
      })
      .length;
  }, [activeCategory, homepageCompanies, homepageSubcategories, resultCount, showResultsBar, visibleCategoryIds]);
  const showHomepageEmptyState = showResultsBar && homepageCompanies !== undefined && homepageResultCount === 0 && Boolean(
    searchParams.get("location") ||
    searchParams.get("search") ||
    searchParams.get("projectSize") ||
    homepageSubcategories.length
  );

  useEffect(() => {
    const updateMobileCategoryEndSpacer = () => {
      if (typeof window === "undefined" || window.innerWidth >= 640) {
        setMobileCategoryEndSpacerWidth(0);
        return;
      }

      const lastButtonWidth = lastCategoryButtonRef.current?.offsetWidth ?? 0;
      const horizontalPadding = 16; // matches mobile px-4 on the scroll container
      const spacerWidth = Math.max(0, window.innerWidth / 2 - horizontalPadding - lastButtonWidth / 2);

      setMobileCategoryEndSpacerWidth(spacerWidth);
    };

    updateMobileCategoryEndSpacer();
    window.addEventListener("resize", updateMobileCategoryEndSpacer);

    return () => window.removeEventListener("resize", updateMobileCategoryEndSpacer);
  }, [dynamicCategories]);

  useEffect(() => {
    if (!showResultsBar || typeof window === "undefined") {
      setShowMobileMiniHeader(false);
      return;
    }

    const updateMiniHeader = () => {
      setShowMobileMiniHeader(window.innerWidth < 640 && window.scrollY > 520);
    };

    updateMiniHeader();
    window.addEventListener("scroll", updateMiniHeader, { passive: true });
    window.addEventListener("resize", updateMiniHeader);

    return () => {
      window.removeEventListener("scroll", updateMiniHeader);
      window.removeEventListener("resize", updateMiniHeader);
    };
  }, [showResultsBar]);

  // Determine user type from Clerk metadata (default to "individual")
  const userType = (user?.publicMetadata?.accountType as string) || "individual";

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/?${params.toString()}`);
  }, [searchParams, router]);

  const handleCategoryTab = (catId: string) => {
    setMobileMenuOpen(false);
    updateParams({ category: catId, subcategory: null });
    setSelectedCategories([]);
  };

  const handleSearch = () => {
    setMobileMenuOpen(false);
    updateParams({ search: keywords || null });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setKeywords("");
    setProjectSizes([]);
    setSelectedCategories([]);
    setLocations([]);
    // Keep the current category tab, only reset filters
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== "construction") {
      params.set("category", activeCategory);
    }
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  };

  // Get dynamic filter options for current category
  const getDynamicFilter = useCallback((filterId: string) => {
    if (activeCategory && configFiltersMap && configFiltersMap[activeCategory]) {
      const filter = configFiltersMap[activeCategory].find((f) => f.id === filterId);
      if (filter) return filter.options;
    }
    return null;
  }, [activeCategory, configFiltersMap]);

  const currentLocationOptions = getDynamicFilter("location") ?? locationOptions;
  const currentProjectSizeOptions = getDynamicFilter("project-size") ?? projectSizeOptions;
  const concreteProjectSizeIds = currentProjectSizeOptions
    .filter((option) => option.id !== "any")
    .map((option) => option.id);
  const categoryOptions = useMemo(() => {
    const dynamicCats = getDynamicFilter("categories");
    if (dynamicCats) return dynamicCats;

    if (activeCategory === "renovation") return renovationCategories;
    if (activeCategory === "architecture") return architectureCategories;
    if (activeCategory === "interior") return interiorCategories;
    if (activeCategory === "real-estate") return realEstateCategories;
    return constructionCategories;
  }, [activeCategory, getDynamicFilter]);

  useEffect(() => {
    setSelectedCategories(parseSubcategoryParam(searchParams.get("subcategory"), categoryOptions));
  }, [searchParams, categoryOptions]);

  useEffect(() => {
    setProjectSizes(searchParams.get("projectSize") ? searchParams.get("projectSize")!.split(",").filter(Boolean) : []);
  }, [searchParams]);

  const handleProjectSizeChange = (sizeId: string) => {
    let nextSizes: string[];

    if (sizeId === "any") {
      nextSizes = projectSizes.includes("any") ? [] : ["any"];
    } else {
      nextSizes = projectSizes.includes(sizeId)
        ? projectSizes.filter((id) => id !== sizeId && id !== "any")
        : [...projectSizes.filter((id) => id !== "any"), sizeId];
      const hasAllConcreteSizes = concreteProjectSizeIds.length > 0 && concreteProjectSizeIds.every((id) => nextSizes.includes(id));
      if (hasAllConcreteSizes) nextSizes = ["any"];
    }

    setProjectSizes(nextSizes);
    updateParams({ projectSize: nextSizes.length > 0 ? nextSizes.join(",") : null });
  };

  const getProjectSizeDisplayText = () => {
    if (projectSizes.length === 0) return "PROJECT SIZE";
    if (projectSizes.includes("any")) return "ANY SIZE";
    if (projectSizes.length === 1) {
      const label = currentProjectSizeOptions.find((option) => option.id === projectSizes[0])?.label;
      return label ? label.replace(/\s*\([^)]*\)/, '') : "PROJECT SIZE";
    }
    return "PROJECT SIZE";
  };

  // Handle location multi-select
  const handleLocationChange = (locationId: string) => {
    let newLocations: string[];

    if (locationId === "bali") {
      // Toggle BALI: if currently has all regions, clear all; otherwise select all
      const allRegions = currentLocationOptions.filter(opt => opt.id !== "bali").map(opt => opt.id);
      const hasAllRegions = allRegions.every(region => locations.includes(region));

      if (hasAllRegions || locations.includes("bali")) {
        // Turn off BALI: clear all
        newLocations = [];
      } else {
        // Turn on BALI: select all regions
        newLocations = ["bali", ...allRegions];
      }
    } else {
      // Toggle individual region
      if (locations.includes(locationId)) {
        // Remove if already selected
        newLocations = locations.filter(loc => loc !== locationId && loc !== "bali");
      } else {
        // Add to selection
        newLocations = [...locations.filter(loc => loc !== "bali"), locationId];
      }
    }

    setLocations(newLocations);
    updateParams({ location: newLocations.length > 0 ? newLocations.join(",") : null });
  };

  // Get location display text
  const getLocationDisplayText = () => {
    if (locations.length === 0) return "LOCATION";

    // Check if all regions are selected (BALI mode)
    const allRegions = currentLocationOptions.filter(opt => opt.id !== "bali").map(opt => opt.id);
    const hasAllRegions = allRegions.every(region => locations.includes(region));

    if (locations.includes("bali") || hasAllRegions) return "BALI";
    if (locations.length === 1) return locations[0].toUpperCase();
    return "LOCATION"; // Multiple locations selected
  };

  const isLocationActive = locations.length > 0;

  // Check if BALI toggle should appear active (all regions selected)
  const isBaliActive = () => {
    const allRegions = currentLocationOptions.filter(opt => opt.id !== "bali").map(opt => opt.id);
    return allRegions.every(region => locations.includes(region)) || locations.includes("bali");
  };

  const handleCategoryChange = (subcategoryId: string) => {
    const nextCategories = toggleSubcategorySelection(selectedCategories, subcategoryId, categoryOptions);
    setSelectedCategories(nextCategories);
    updateParams({ subcategory: encodeSubcategoryParam(nextCategories, categoryOptions) });
  };

  return (
    <>
    {showResultsBar && (
      <div className={`sf-mini-header ${showMobileMiniHeader ? "is-visible" : ""}`}>
        <Link href="/" className="sf-mini-brand" onClick={() => setMobileMenuOpen(false)}>
          <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} className="h-[20px] w-auto" />
        </Link>
        <div className="sf-mini-actions">
          <button
            type="button"
            className="sf-icon-btn"
            aria-label="Search"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <button
            type="button"
            className="sf-mini-filter-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/></svg>
            Filters
          </button>
          <button
            type="button"
            className="sf-icon-btn sf-mobile-menu-btn"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          {mobileMenuOpen && (
            <div className="sf-mobile-menu sf-mini-menu" role="menu">
              <Link href="/about" role="menuitem" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <button type="button" role="menuitem" onClick={() => openAuthModal("company", "register")}>List your services</button>
              <Link href="/terms" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Terms</Link>
            </div>
          )}
        </div>
      </div>
    )}
    <header className="relative z-40 bg-[#ececec]">
      <div className={`sf-shell ${useTopBarOnlyHeader || useMobileCompactHeader ? "sf-shell-compact" : ""}`}>
      <div className="sf-shell-bg" aria-hidden="true" />
      {headerMedia.url ? (
        <>
          <div className="absolute inset-0 overflow-hidden rounded-[6px]">
            {headerMedia.type === "video" ? (
              <video src={headerMedia.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
            ) : (
              <Image
                src={headerMedia.url}
                alt="Header background"
                fill
                className="object-cover"
                unoptimized={headerMedia.url.startsWith("data:")}
              />
            )}
          </div>
          <div className="absolute inset-0 rounded-[6px] bg-black/25" />
        </>
      ) : headerMediaState.isLoading ? (
        <div className="absolute inset-0 rounded-[6px] bg-[#e4e4e4]" />
      ) : (
        null
      )}

      <div className={`relative z-10 ${useTopBarOnlyHeader ? "flex min-h-[58px] flex-col justify-center" : useMobileCompactHeader ? "flex min-h-[58px] flex-col justify-center sm:block" : ""}`}>
        {/* Top Bar */}
        <div className="sf-shell-top">
          {/* Logo */}
          <Link href="/" className="sf-shell-brand">
            <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} className="h-[18px] w-auto" />
            <span className="sf-brand-id">.id</span>
          </Link>

          {/* Right Side Buttons */}
          <div className="sf-shell-actions">
            <SignedIn>
              {/* Account icon (mobile + desktop) */}
              <Link
                href={userType === "company" ? "/company-dashboard" : "/dashboard"}
                className="sf-icon-btn"
                title="Dashboard"
              >
                <Image src="/images/icon-account.svg" alt="Dashboard" width={19} height={20} />
              </Link>
              {/* Log out button */}
              {userType === "company" ? (
                <button
                  onClick={handleSignOut}
                  className="sf-btn sf-btn-pri sf-signout-btn"
                >
                  Log out
                </button>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="sf-btn sf-btn-pri sf-signout-btn"
                >
                  Log out
                </button>
              )}
            </SignedIn>

            <SignedOut>
              {/* Account icon → opens LOGIN modal */}
              <button
                type="button"
                onClick={() => openAuthModal("individual", "login")}
                className="sf-icon-btn sf-account-btn"
              >
                <Image src="/images/icon-account.svg" alt="Account" width={19} height={20} />
              </button>
              {/* List your business → opens REGISTER modal, company pre-selected */}
              <button
                type="button"
                onClick={() => openAuthModal("company", "register")}
                className="sf-btn sf-btn-pri sf-list-services-btn"
              >
                List your services
              </button>
            </SignedOut>
            <button
              type="button"
              className="sf-icon-btn sf-mobile-menu-btn"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
            {mobileMenuOpen && (
              <div className="sf-mobile-menu" role="menu">
                <Link href="/about" role="menuitem" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <button type="button" role="menuitem" onClick={() => openAuthModal("company", "register")}>List your services</button>
                <Link href="/terms" role="menuitem" onClick={() => setMobileMenuOpen(false)}>Terms</Link>
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs - Horizontal scroll on mobile */}
        <div className={`${useTopBarOnlyHeader ? "hidden" : useMobileCompactHeader ? "hidden sm:block" : ""}`}>
          <nav className="sf-catnav relative overflow-visible">
          <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex gap-2 min-w-max">
              {dynamicCategories.map((cat, index) => (
                <button
                  key={cat.id}
                  ref={index === dynamicCategories.length - 1 ? lastCategoryButtonRef : undefined}
                  onClick={() => handleCategoryTab(cat.id)}
                  className={`sf-cat ${activeCategory === cat.id ? "active" : ""}`}
                >
                  <span className="num">{cat.label.split(".")[0]}</span>{cat.label.replace(/^\d+\.\s*/, "")}
                </button>
              ))}
              <div
                aria-hidden="true"
                className="sm:hidden flex-shrink-0"
                style={{ width: mobileCategoryEndSpacerWidth }}
              />
            </div>
          </div>
          {/* Gradient fade on right edge — mobile only, extends to screen edge past padding */}
          <div className="sm:hidden pointer-events-none absolute -right-4 top-0 bottom-0 w-20" style={{ background: 'linear-gradient(to right, transparent, #F14110)' }} />
          </nav>
          <h1 className="sf-shell-lead">
            {(activeCategory && dynamicSubtitles[activeCategory]) || (activeCategory && categorySubtitles[activeCategory]) || categorySubtitles.construction}
          </h1>
        </div>

        {/* Search Bar */}
        <div className={`${useTopBarOnlyHeader ? "hidden" : ""}`}>
          {/* Desktop: Flex with Clear button positioned right */}
          <form className="sf-searchrow" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            {/* Left side: Keywords + Filters */}
            <div className="sf-search-textbox">
              {/* Keywords Input - extended width on desktop */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input
                type="text"
                placeholder="Search construction pros..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button type="submit" className="sf-btn sf-btn-pri sf-btn-lg">Search</button>
            </div>
            <div className="sf-search-filters">
              {/* Project Size Dropdown */}
              <Dropdown
                label="PROJECT SIZE"
                options={currentProjectSizeOptions}
                value=""
                onChange={handleProjectSizeChange}
                width=""
                isProjectSize={true}
                multiSelect={true}
                selectedValues={projectSizes}
                displayText={getProjectSizeDisplayText()}
                isActive={projectSizes.length > 0}
                isOptionSelected={(optionId) => {
                  if (optionId === "any") return projectSizes.includes("any");
                  return !projectSizes.includes("any") && projectSizes.includes(optionId);
                }}
                closeSignal={dropdownCloseSignal}
              />
              <div className="sf-fdiv" />

              {/* Categories Dropdown */}
              <Dropdown
                label="CATEGORIES"
                options={categoryOptions}
                value=""
                onChange={handleCategoryChange}
                width=""
                multiSelect={true}
                selectedValues={selectedCategories}
                displayText={getSubcategoryDisplayText(selectedCategories, categoryOptions)}
                isActive={isSubcategoryFilterActive(selectedCategories, categoryOptions)}
                isOptionSelected={(optionId) => isSubcategoryOptionSelected(selectedCategories, optionId, categoryOptions)}
                closeSignal={dropdownCloseSignal}
              />
              <div className="sf-fdiv" />

              {/* Location Dropdown - multi-select enabled */}
              <Dropdown
                label="LOCATION"
                options={currentLocationOptions}
                value="" // Not used in multi-select mode
                onChange={handleLocationChange}
                width=""
                multiSelect={true}
                selectedValues={locations}
                displayText={getLocationDisplayText()}
                isActive={isLocationActive}
                alignRight={true}
                isOptionSelected={(optionId) => {
                  if (optionId === "bali") return isBaliActive();
                  return locations.includes(optionId);
                }}
                closeSignal={dropdownCloseSignal}
              />
            </div>

          </form>
        </div>
      </div>
      </div>
      {showResultsBar && (
        <>
        <div className="sf-results-bar sf-results-desktop relative z-20">
            <span className="sf-results-count"><b>{homepageResultCount}</b></span>
            <span className="sf-results-sub">solidfinds</span>
            <div className="sf-results-meta">
              {sortControl ?? (!showHomepageEmptyState && <SortDropdown value={sortBy} onChange={setSortBy} reviewsEnabled={reviewsEnabled} />)}
            </div>
          </div>
          <div className="m-results sf-results-mobile">
            <span className="m-results-count">{homepageResultCount}</span>
            <span className="m-results-sub">solidfinds</span>
            <span className="m-results-sp" />
            {proEnabled && (
              <button type="button" className="m-pill">
                <span className="m-pill-dot" />PRO
              </button>
            )}
            <button type="button" className="m-pill">
              <span className="k">Sort by</span><span className="v">Latest</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
        </>
      )}
    </header>

    {/* Auth modal — rendered outside header so it can overlay everything */}
    <AuthModal
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
      initialMode={authModalMode}
      initialAccountType={authModalAccountType}
    />

    {/* Logout prompt for individuals clicking "List your business" */}
    {showLogoutPrompt && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutPrompt(false)} />
        <div className="relative bg-white w-full max-w-[380px] rounded-[6px] p-8 text-center">
          <h3 className="text-[18px] font-bold text-[#333] mb-3">Register Your Company</h3>
          <p className="text-[12px] text-[#333]/70 mb-6 leading-[18px]">
            Log out first to register your company profile.
          </p>
          <button
            onClick={() => setShowLogoutPrompt(false)}
            className="h-10 min-w-[140px] px-6 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    )}
    </>
  );
}
