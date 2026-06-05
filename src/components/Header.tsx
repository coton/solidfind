"use client";

import { Suspense, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { AuthModal } from "@/components/AuthModal";
import { useSiteLanguage } from "@/components/LanguageProvider";
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
  const { language, setLanguage, t } = useSiteLanguage();
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
  const [mobileOpenSegment, setMobileOpenSegment] = useState<"Size" | "Type" | "Location" | null>(null);
  const [mobileDrawerSection, setMobileDrawerSection] = useState<"cat" | "build" | "solid">("cat");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [showMobileMiniHeader, setShowMobileMiniHeader] = useState(false);

  const openAuthModal = (accountType: "company" | "individual" = "individual", mode: "login" | "register" = "register") => {
    setDropdownCloseSignal((current) => current + 1);
    setMobileMenuOpen(false);
    setMobileOpenSegment(null);
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
  const hideMobileProfileHeader = isProfilePage;
  
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
  const proOnly = searchParams.get("pro") === "1";
  const sortParam = searchParams.get("sort") || "latest";
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
      .filter((company) => !proOnly || company.isPro === true)
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
  }, [activeCategory, homepageCompanies, homepageSubcategories, proOnly, resultCount, showResultsBar, visibleCategoryIds]);
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

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const toggleProOnly = () => {
    updateParams({ pro: proOnly ? null : "1" });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setMobileSortOpen(false);
    updateParams({ sort: value === "latest" ? null : value });
  };

  const handleCategoryTab = (catId: string) => {
    setMobileMenuOpen(false);
    setMobileOpenSegment(null);
    updateParams({ category: catId, subcategory: null });
    setSelectedCategories([]);
  };

  const handleSearch = () => {
    setMobileMenuOpen(false);
    setMobileOpenSegment(null);
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

  const handleIndividualsLink = () => {
    setMobileMenuOpen(false);
    if (!user) {
      openAuthModal("individual", "register");
      return;
    }
    if (userType !== "company") router.push("/dashboard");
  };

  const handleProfessionalsLink = () => {
    setMobileMenuOpen(false);
    if (!user) {
      openAuthModal("company", "register");
      return;
    }
    if (userType === "company") router.push("/company-dashboard");
    else openAuthModal("company", "register");
  };

  const handleListServicesLink = () => {
    setMobileMenuOpen(false);
    if (!user) {
      openAuthModal("company", "register");
      return;
    }
    if (userType === "company") router.push("/company-dashboard/edit");
    else openAuthModal("company", "register");
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
    if (projectSizes.length === 0) return "Any size";
    if (projectSizes.includes("any")) return "ANY SIZE";
    if (projectSizes.length === 1) {
      const label = currentProjectSizeOptions.find((option) => option.id === projectSizes[0])?.label;
      return label ? label.replace(/\s*\([^)]*\)/, '') : "Any size";
    }
    return `${projectSizes.length} sizes`;
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
    if (locations.length === 0) return "Anywhere";

    // Check if all regions are selected (BALI mode)
    const allRegions = currentLocationOptions.filter(opt => opt.id !== "bali").map(opt => opt.id);
    const hasAllRegions = allRegions.every(region => locations.includes(region));

    if (locations.includes("bali") || hasAllRegions) return "BALI";
    if (locations.length === 1) return locations[0].toUpperCase();
    return `${locations.length} areas`;
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

  const activeCategoryName = activeCategory
    ? (dynamicCategories.find((cat) => cat.id === activeCategory)?.label.replace(/^\d+\.\s*/, "") ?? activeCategory)
    : "Construction";
  const activeSubtitle = (activeCategory && dynamicSubtitles[activeCategory]) || (activeCategory && categorySubtitles[activeCategory]) || categorySubtitles.construction;
  const mobileTypeDisplayText = isSubcategoryFilterActive(selectedCategories, categoryOptions)
    ? getSubcategoryDisplayText(selectedCategories, categoryOptions)
    : "All types";
  const mobileLocationOptions = currentLocationOptions.filter((option) => option.id !== "bali");

  const renderMobileFilterMenu = () => {
    if (!mobileOpenSegment) return null;

    if (mobileOpenSegment === "Size") {
      return (
        <div className="m-ddmenu m-ddmenu-size">
          {currentProjectSizeOptions.map((option, index) => {
            const selected = option.id === "any"
              ? projectSizes.length === 0 || projectSizes.includes("any")
              : !projectSizes.includes("any") && projectSizes.includes(option.id);
            return (
              <button key={option.id} type="button" className={`m-ddopt ${index === 0 ? "all" : ""}`} onClick={() => handleProjectSizeChange(option.id)}>
                <span className="lbl">{option.label.replace(/\s*\([^)]*\)/, "")}</span>
                <span className={`m-switch ${selected ? "on" : ""}`}><span className="knob" /></span>
              </button>
            );
          })}
        </div>
      );
    }

    if (mobileOpenSegment === "Type") {
      return (
        <div className="m-ddmenu m-ddmenu-type">
          {categoryOptions.map((option, index) => {
            const selected = isSubcategoryOptionSelected(selectedCategories, option.id, categoryOptions);
            return (
              <button key={option.id} type="button" className={`m-ddopt ${index === 0 ? "all" : ""}`} onClick={() => handleCategoryChange(option.id)}>
                <span className="lbl">{option.label}</span>
                <span className={`m-switch ${selected ? "on" : ""}`}><span className="knob" /></span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="m-ddmenu m-ddmenu-location">
        <button type="button" className="m-ddopt all" onClick={() => handleLocationChange("bali")}>
          <span className="lbl">Bali - all regions</span>
          <span className={`m-switch ${isBaliActive() ? "on" : ""}`}><span className="knob" /></span>
        </button>
        {mobileLocationOptions.map((option) => {
          const selected = locations.includes(option.id);
          return (
            <button key={option.id} type="button" className="m-ddopt" onClick={() => handleLocationChange(option.id)}>
              <span className="lbl">{option.label}</span>
              <span className={`m-switch ${selected ? "on" : ""}`}><span className="knob" /></span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderMobileDrawer = () => {
    if (!mobileMenuOpen) return null;
    const toggleSection = (section: "cat" | "build" | "solid") => {
      setMobileDrawerSection((current) => current === section ? "solid" : section);
    };

    return (
      <div className="m-overlay">
        <div className="m-scrim" onClick={() => setMobileMenuOpen(false)} />
        <div className="m-drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="m-drawer-top">
            <div className="m-drawer-head">
              <span className="m-drawer-mark" aria-hidden="true">
                <svg viewBox="0 0 83.88 83.88" width="36" height="36" fill="currentColor"><path d="M65.19,0H18.69c-2.4,0-4.69.95-6.39,2.65L2.65,12.3c-1.69,1.69-2.65,3.99-2.65,6.39v46.5c0,2.4.95,4.69,2.65,6.39l9.66,9.66c1.69,1.69,3.99,2.65,6.39,2.65h48.61c1.04,0,2.04-.41,2.78-1.15h0c1.53-1.53,1.53-4.02,0-5.55l-8.98-8.98c-1.23-1.23-3.14-1.54-4.65-.68-5.01,2.85-10.79,4.19-16.77,3.74-6.16-.46-12.06-2.89-16.76-6.9-13.2-11.25-13.78-31.18-1.76-43.2,5.55-5.55,12.93-8.61,20.79-8.61s15.23,3.06,20.79,8.61h0c9.58,9.58,11.15,24.17,4.71,35.4-.87,1.52-.59,3.44.65,4.69l8.96,8.96c1.53,1.53,4.02,1.53,5.55,0l.12-.12c.74-.74,1.15-1.74,1.15-2.78V18.69c0-2.4-.95-4.69-2.65-6.39l-9.66-9.66c-1.69-1.69-3.99-2.65-6.39-2.65Z"/><path d="M41.94,23.25c-4.79,0-9.58,1.82-13.22,5.47-7.29,7.29-7.29,19.15,0,26.44,7.29,7.29,19.15,7.29,26.44,0,7.29-7.29,7.29-19.15,0-26.44-3.64-3.65-8.43-5.47-13.22-5.47Z"/></svg>
              </span>
              <span className="m-topbar-sp" />
              <button type="button" className="sf-lang m-drawer-lang" onClick={toggleLanguage} aria-label={`Switch language to ${language === "en" ? "Indonesian" : "English"}`}>
                <span className={language === "en" ? "on" : ""}>EN</span>
                <span className={language === "id" ? "on" : ""}>ID</span>
              </button>
              <button className="m-iconbtn m-drawer-close" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
          </div>

          <div className="m-drawer-nav">
            <div className={`m-acc ${mobileDrawerSection === "cat" ? "open" : ""}`}>
              <button className="m-acc-head" type="button" onClick={() => toggleSection("cat")}><span className="lbl">Categories</span><span>⌄</span></button>
              {mobileDrawerSection === "cat" && (
                <div className="m-acc-body">
                  {dynamicCategories.map((cat, index) => (
                    <button key={cat.id} type="button" onClick={() => handleCategoryTab(cat.id)}>
                      {String(index + 1).padStart(2, "0")} · {cat.label.replace(/^\d+\.\s*/, "")}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={`m-acc ${mobileDrawerSection === "build" ? "open" : ""}`}>
              <button className="m-acc-head" type="button" onClick={() => toggleSection("build")}><span className="lbl">Build</span><span>⌄</span></button>
              {mobileDrawerSection === "build" && (
                <div className="m-acc-body">
                  <button type="button" onClick={handleIndividualsLink}>For individuals</button>
                  <button type="button" onClick={handleProfessionalsLink}>For professionals</button>
                  <button type="button" onClick={handleListServicesLink}>List your services</button>
                  <Link href="/upgrade" onClick={() => setMobileMenuOpen(false)}>Pro guidelines</Link>
                </div>
              )}
            </div>
            <div className={`m-acc ${mobileDrawerSection === "solid" ? "open" : ""}`}>
              <button className="m-acc-head" type="button" onClick={() => toggleSection("solid")}><span className="lbl">Solid</span><span>⌄</span></button>
              {mobileDrawerSection === "solid" && (
                <div className="m-acc-body">
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
                  <Link href="/terms" onClick={() => setMobileMenuOpen(false)}>Terms and Conditions</Link>
                  <a href="mailto:hello@solidfind.id" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                </div>
              )}
            </div>
          </div>

          <div className="m-drawer-foot">
            <button className="m-btn m-btn-pri m-btn-block" type="button" onClick={handleListServicesLink}>List your services</button>
            {user ? (
              <button className="m-btn m-btn-ghost m-btn-block" type="button" onClick={handleSignOut}>Log out</button>
            ) : (
              <button className="m-btn m-btn-ghost m-btn-block" type="button" onClick={() => openAuthModal("individual", "login")}>Log in</button>
            )}
          </div>
          <div className="m-drawer-divide" />
          <div className="m-drawer-legal">
            <span className="cc">© 2026 SolidFind.id</span>
            <a href="https://instagram.com/solidfind.id" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
    {!useTopBarOnlyHeader && !useMobileCompactHeader && !hideMobileProfileHeader && (
      <div className="sf-mobile-webkit-head sm:hidden">
        <div className={`sf-mini-header ${showMobileMiniHeader ? "is-visible" : ""}`}>
          <Link href="/" className="sf-mini-brand" onClick={() => setMobileMenuOpen(false)}>
            <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={136} height={20} className="h-[20px] w-auto" />
          </Link>
          <div className="sf-mini-actions">
            <button type="button" className="sf-icon-btn" aria-label="Search" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            </button>
            <button type="button" className="sf-mini-filter-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/></svg>
              Filters
            </button>
            <button type="button" className="sf-icon-btn sf-mobile-menu-btn" aria-label="Menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        <div className="m-head">
          <div className="m-topbar">
            <Link href="/" className="m-brand">
              <Image src="/assets/solidfind-logo.svg" alt="SolidFind" width={158} height={24} />
              <span className="id">.id</span>
            </Link>
            <span className="m-topbar-sp" />
            <SignedIn>
              <Link href={userType === "company" ? "/company-dashboard" : "/dashboard"} className="m-iconbtn" aria-label="Dashboard">
                <Image src="/images/icon-account.svg" alt="" width={20} height={20} />
              </Link>
            </SignedIn>
            <SignedOut>
              <button type="button" className="m-iconbtn" aria-label="Account" onClick={() => openAuthModal("individual", "login")}>
                <Image src="/images/icon-account.svg" alt="" width={20} height={20} />
              </button>
            </SignedOut>
            <button type="button" className="m-iconbtn" aria-label="Menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
          </div>
          <h1 className="m-head-lead">{activeSubtitle}</h1>
          <div className="m-cats">
            {dynamicCategories.map((cat) => {
              const label = cat.label.replace(/^\d+\.\s*/, "");
              const num = cat.label.split(".")[0].padStart(2, "0");
              return (
                <button key={cat.id} type="button" className={`m-cat ${activeCategory === cat.id ? "on" : ""}`} onClick={() => handleCategoryTab(cat.id)}>
                  <span className="n">{num}</span>{label}
                </button>
              );
            })}
          </div>
          <form className="m-search" onSubmit={(event) => { event.preventDefault(); handleSearch(); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder={`Search ${activeCategoryName.toLowerCase()} pros...`}
            />
            <button type="submit" className="m-search-btn">Search</button>
          </form>
          <div className="m-filterblock">
            <button type="button" className={`m-filterseg ${mobileOpenSegment === "Size" ? "open" : ""}`} onClick={() => setMobileOpenSegment(mobileOpenSegment === "Size" ? null : "Size")}>
              <span className="k">Project size</span>
              <span className={`v ${projectSizes.length === 0 ? "ph" : ""}`}>{getProjectSizeDisplayText()} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>
            </button>
            <button type="button" className={`m-filterseg ${mobileOpenSegment === "Type" ? "open" : ""}`} onClick={() => setMobileOpenSegment(mobileOpenSegment === "Type" ? null : "Type")}>
              <span className="k">Categories</span>
              <span className={`v ${!isSubcategoryFilterActive(selectedCategories, categoryOptions) ? "ph" : ""}`}>{mobileTypeDisplayText} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>
            </button>
            <button type="button" className={`m-filterseg ${mobileOpenSegment === "Location" ? "open" : ""}`} onClick={() => setMobileOpenSegment(mobileOpenSegment === "Location" ? null : "Location")}>
              <span className="k">Location</span>
              <span className={`v ${!isLocationActive ? "ph" : ""}`}>{getLocationDisplayText()} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>
            </button>
          </div>
        </div>
        <div className="sf-mobile-filter-layer">
          {renderMobileFilterMenu()}
        </div>
        {showResultsBar && (
          <div className="m-results sf-results-mobile">
            <span className="m-results-count">{homepageResultCount}</span>
            <span className="m-results-sub">solidfinds</span>
            <span className="m-results-sp" />
            {proEnabled && (
              <button type="button" className={`m-pill ${proOnly ? "on" : ""}`} onClick={toggleProOnly} aria-pressed={proOnly}>
                <span className="m-pill-dot" />PRO
              </button>
            )}
            <div className="m-sort-wrap">
              <button type="button" className="m-pill" onClick={() => setMobileSortOpen((open) => !open)}>
                <span className="k">Sort by</span><span className="v">{sortParam === "latest" ? "Latest" : sortParam.replace(/-/g, " ")}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {mobileSortOpen && (
                <div className="m-sort-menu">
                  {["latest", ...(reviewsEnabled ? ["ranking"] : []), "team-smallest", "team-largest", "projects-few", "projects-more"].map((option) => (
                    <button key={option} type="button" className={sortParam === option ? "on" : ""} onClick={() => handleSortChange(option)}>
                      {option === "latest" ? "Latest" : option.replace(/-/g, " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

    <header className={`relative z-40 bg-[#f8f8f8] ${!useTopBarOnlyHeader && !useMobileCompactHeader ? "hidden sm:block" : ""} ${hideMobileProfileHeader ? "hidden sm:block" : ""}`}>
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
            <button type="button" className="sf-lang" onClick={toggleLanguage} aria-label={`Switch language to ${language === "en" ? "Indonesian" : "English"}`}>
              <span className={language === "en" ? "on" : ""}>EN</span>
              <span className={language === "id" ? "on" : ""}>ID</span>
            </button>
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
                  {t("Log out", "Keluar")}
                </button>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="sf-btn sf-btn-pri sf-signout-btn"
                >
                  {t("Log out", "Keluar")}
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
                {t("List your services", "Daftarkan layanan")}
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
              {proEnabled && !showHomepageEmptyState && (
                <button type="button" className={`sf-pro-filter ${proOnly ? "on" : ""}`} onClick={toggleProOnly} aria-pressed={proOnly}>
                  <span className="m-pill-dot" />Pro Account only
                </button>
              )}
              {sortControl ?? (!showHomepageEmptyState && <SortDropdown value={sortParam || sortBy} onChange={handleSortChange} reviewsEnabled={reviewsEnabled} />)}
            </div>
          </div>
        </>
      )}
    </header>
    {renderMobileDrawer()}

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
