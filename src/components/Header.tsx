"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { AuthModal } from "@/components/AuthModal";

const mainCategories = [
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
  alignRight = false
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, right: 0, width: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const rightPos = window.innerWidth - rect.right;
      setMenuPos({ top: rect.bottom + 2, left: rect.left, right: rightPos, width: rect.width });
      // Allow rendering after position is calculated
      requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${width}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 bg-[#f8f8f8] rounded-[6px] flex items-center justify-between px-3 w-full"
        style={{ letterSpacing: '0.12px' }}
      >
        <span className={`text-[11px] font-semibold leading-[11px] ${buttonIsActive ? 'text-[#f14110]' : 'text-[#333]'}`}>
          {getButtonText()}
        </span>
        <Image src="/images/btn-down.svg" alt="" width={8} height={5} className="rotate-90 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div 
            className={`fixed bg-white rounded-[6px] shadow-lg transition-opacity duration-75 w-max ${isPositioned ? 'opacity-100' : 'opacity-0'}`} 
            style={{
              zIndex: 9999,
              ...(alignRight 
                ? { top: menuPos.top, right: menuPos.right }
                : { top: menuPos.top, left: menuPos.left }
              )
            }}
          >
            <div className="pt-2 pb-[10px] px-3">
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
                    className={`w-full text-left py-2 text-[11px] flex items-center ${
                      index < options.length - 1 ? 'mb-[2px]' : ''
                    } ${
                      isSelected ? 'text-[#f14110]' : 'text-[#333]'
                    }`}
                    style={{ 
                      fontFamily: 'var(--font-sora), sans-serif', 
                      fontWeight: 500,
                      letterSpacing: '0.22px',
                      borderBottom: index < options.length - 1 ? '1px solid #e4e4e4' : 'none'
                    }}
                  >
                    <span className="whitespace-nowrap mr-[40px]">{option.label}</span>
                    <div 
                      className={`flex-shrink-0 w-6 h-3 rounded-full ml-auto ${isSelected ? 'bg-gradient-to-l from-[#f14110] to-[#e9a28e]' : 'bg-[#333]/25'}`}
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

export function Header() {
  return (
    <Suspense fallback={<header className="relative"><div className="h-[200px]" /></header>}>
      <HeaderInner />
    </Suspense>
  );
}

function HeaderInner() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keywords, setKeywords] = useState(searchParams.get("search") ?? "");
  const [projectSize, setProjectSize] = useState(searchParams.get("projectSize") ?? "");
  const [category, setCategory] = useState(searchParams.get("subcategory") ?? "");
  const [locations, setLocations] = useState<string[]>(
    searchParams.get("location") ? searchParams.get("location")!.split(",") : []
  );

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalAccountType, setAuthModalAccountType] = useState<"company" | "individual">("individual");
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("register");

  const openAuthModal = (accountType: "company" | "individual" = "individual", mode: "login" | "register" = "register") => {
    setAuthModalAccountType(accountType);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const activeCategory = searchParams.get("category") ?? "construction";

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
    const target = pathname === "/" ? "/" : "/";
    router.push(`${target}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  const handleCategoryTab = (catId: string) => {
    updateParams({ category: catId, subcategory: null });
    setCategory("");
  };

  const handleSearch = () => {
    updateParams({ search: keywords || null });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setKeywords("");
    setProjectSize("");
    setCategory("");
    setLocations([]);
    router.push("/");
  };

  // Handle location multi-select
  const handleLocationChange = (locationId: string) => {
    let newLocations: string[];
    
    if (locationId === "bali") {
      // Toggle BALI: if currently has all regions, clear all; otherwise select all
      const allRegions = locationOptions.filter(opt => opt.id !== "bali").map(opt => opt.id);
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
    const allRegions = locationOptions.filter(opt => opt.id !== "bali").map(opt => opt.id);
    const hasAllRegions = allRegions.every(region => locations.includes(region));
    
    if (locations.includes("bali") || hasAllRegions) return "BALI";
    if (locations.length === 1) return locations[0].toUpperCase();
    return "LOCATION"; // Multiple locations selected
  };

  const isLocationActive = locations.length > 0;
  
  // Check if BALI toggle should appear active (all regions selected)
  const isBaliActive = () => {
    const allRegions = locationOptions.filter(opt => opt.id !== "bali").map(opt => opt.id);
    return allRegions.every(region => locations.includes(region)) || locations.includes("bali");
  };

  // Get categories based on active main category
  const getCategoryOptions = () => {
    if (activeCategory === "renovation") {
      return renovationCategories;
    }
    if (activeCategory === "architecture") {
      return architectureCategories;
    }
    if (activeCategory === "interior") {
      return interiorCategories;
    }
    if (activeCategory === "real-estate") {
      return realEstateCategories;
    }
    return constructionCategories;
  };

  return (
    <>
    <header className="relative">
      {/* Gradient Background - Desktop: #E4E4E4 to #F14110, Mobile: #E9A28E to #F14110 */}
      <div
        className="absolute inset-0 rounded-b-[6px]"
        style={{
          background: "linear-gradient(to right, #E9A28E, #F14110)"
        }}
      />
      <div
        className="hidden sm:block absolute inset-0 rounded-b-[6px]"
        style={{
          background: "linear-gradient(to right, #E4E4E4, #F14110)"
        }}
      />

      <div className="relative z-10 px-5 sm:px-0 pt-4 sm:pt-6 pb-[10px] sm:pb-8">
        {/* Top Bar */}
        <div className="max-w-[900px] mx-auto flex items-center justify-between mb-8 sm:mb-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/logo-full.svg" alt="SolidFind.id" width={175} height={19} className="h-[19px] w-auto" />
          </Link>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Desktop: IG (first) */}
            <button className="hidden sm:block text-[#f8f8f8] hover:opacity-80 transition-opacity">
              <Image src="/images/icon-ig.svg" alt="Instagram" width={20} height={20} />
            </button>

            <SignedIn>
              {/* Desktop: Account icon (second) */}
              <Link
                href={userType === "company" ? "/company-dashboard" : "/dashboard"}
                className="hidden sm:block text-[#f8f8f8] hover:opacity-80 transition-opacity"
                title="Dashboard"
              >
                <Image src="/images/icon-account.svg" alt="Dashboard" width={19} height={20} />
              </Link>
              {/* List your business button (third) */}
              <Link
                href="/register-business"
                className="h-10 px-4 rounded-full border border-[#f8f8f8] text-[#f8f8f8] text-[11px] font-medium tracking-[0.22px] hover:bg-white hover:text-[#F14110] transition-colors flex items-center"
              >
                List your business
              </Link>
            </SignedIn>

            <SignedOut>
              {/* Desktop: Account icon → opens LOGIN modal */}
              <button
                onClick={() => openAuthModal("individual", "login")}
                className="hidden sm:block text-[#f8f8f8] hover:opacity-80 transition-opacity"
              >
                <Image src="/images/icon-account.svg" alt="Account" width={19} height={20} />
              </button>
              {/* List your business → opens REGISTER modal, company pre-selected */}
              <button
                onClick={() => openAuthModal("company", "register")}
                className="h-10 px-4 rounded-full border border-[#f8f8f8] text-[#f8f8f8] text-[11px] font-medium tracking-[0.22px] hover:bg-white hover:text-[#F14110] transition-colors flex items-center"
              >
                List your business
              </button>
            </SignedOut>
          </div>
        </div>

        {/* Category Tabs - Horizontal scroll on mobile */}
        <div className="max-w-[900px] mx-auto mb-4">
          <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex gap-2 min-w-max">
              {mainCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryTab(cat.id)}
                  className={`h-10 px-4 sm:px-5 rounded-full text-[11px] sm:text-[12px] font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-[#f8f8f8] text-[#f14110]"
                      : "text-[#f8f8f8] border border-transparent hover:border-white hover:text-[#FFF]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[#f8f8f8] text-[9px] mt-4 font-medium leading-[12px]">
            {categorySubtitles[activeCategory] || categorySubtitles.construction}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-[900px] mx-auto">
          {/* Desktop: Flex with Clear button positioned right */}
          <div className="hidden sm:flex items-center justify-between gap-0">
            {/* Left side: Keywords + Filters */}
            <div className="flex items-center gap-[2px]">
              {/* Keywords Input - extended width on desktop */}
              <div className="w-[390px] h-10 bg-[#f8f8f8] rounded-[6px] flex items-center px-3">
                <input
                  type="text"
                  placeholder="Search by keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-[11px] text-[#333] placeholder:text-[#333]/55 outline-none font-medium"
                />
              </div>

              {/* Project Size Dropdown */}
              <Dropdown
                label="PROJECT SIZE"
                options={projectSizeOptions}
                value={projectSize}
                onChange={(val) => { setProjectSize(val); updateParams({ projectSize: val || null }); }}
                width="w-[140px]"
                isProjectSize={true}
              />

              {/* Categories Dropdown */}
              <Dropdown
                label="CATEGORIES"
                options={getCategoryOptions()}
                value={category}
                onChange={(val) => { setCategory(val); updateParams({ subcategory: val || null }); }}
                width="w-[140px]"
              />

              {/* Location Dropdown - multi-select enabled */}
              <Dropdown
                label="LOCATION"
                options={locationOptions}
                value="" // Not used in multi-select mode
                onChange={handleLocationChange}
                width="w-[120px]"
                multiSelect={true}
                selectedValues={locations}
                displayText={getLocationDisplayText()}
                isActive={isLocationActive}
                isOptionSelected={(optionId) => {
                  if (optionId === "bali") return isBaliActive();
                  return locations.includes(optionId);
                }}
              />

              {/* Search Button - 40x40 container with 34x34 icon centered */}
              <button onClick={handleSearch} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#f8f8f8] rounded-[6px]">
                <Image src="/images/btn-search.svg" alt="Search" width={34} height={34} className="w-[34px] h-[34px]" />
              </button>
            </div>

            {/* Clear Filters - aligned to right of 900px container */}
            <button
              onClick={clearFilters}
              className="text-[#f8f8f8] text-[11px] font-medium underline tracking-[0.22px] whitespace-nowrap"
            >
              Clear
            </button>
          </div>

          {/* Mobile: Stack vertically with equal-width filters */}
          <div className="flex sm:hidden flex-col gap-[2px]">
            {/* Keywords Input with Search Button */}
            <div className="flex items-center gap-[2px] mb-[2px]">
              <div className="flex-1 h-10 bg-[#f8f8f8] rounded-[6px] flex items-center px-3">
                <input
                  type="text"
                  placeholder="Enter Keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-[11px] text-[#333] placeholder:text-[#333]/55 outline-none font-medium"
                />
              </div>
              {/* Search Button */}
              <button onClick={handleSearch} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#f8f8f8] rounded-[6px]">
                <Image src="/images/btn-search.svg" alt="Search" width={34} height={34} className="w-[34px] h-[34px]" />
              </button>
            </div>

            {/* Filters Row + Clear - with vertical centering */}
            <div className="flex items-center gap-[2px]">
              {/* Filters Row - Equal width with 2px gap */}
              <div className="flex-1 flex items-center gap-[2px]">
                {/* Project Size Dropdown */}
                <div className="flex-1">
                  <Dropdown
                    label="PROJECT SIZE"
                    options={projectSizeOptions}
                    value={projectSize}
                    onChange={(val) => { setProjectSize(val); updateParams({ projectSize: val || null }); }}
                    width="w-full"
                    isProjectSize={true}
                  />
                </div>

                {/* Categories Dropdown */}
                <div className="flex-1">
                  <Dropdown
                    label="CATEGORIES"
                    options={getCategoryOptions()}
                    value={category}
                    onChange={(val) => { setCategory(val); updateParams({ subcategory: val || null }); }}
                    width="w-full"
                  />
                </div>

                {/* Location Dropdown */}
                <div className="flex-1">
                  <Dropdown
                    label="LOCATION"
                    options={locationOptions}
                    value="" // Not used in multi-select mode
                    onChange={handleLocationChange}
                    width="w-full"
                    multiSelect={true}
                    selectedValues={locations}
                    displayText={getLocationDisplayText()}
                    isActive={isLocationActive}
                    isOptionSelected={(optionId) => {
                      if (optionId === "bali") return isBaliActive();
                      return locations.includes(optionId);
                    }}
                    alignRight={true}
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters - aligned right, vertically centered */}
            <div className="flex justify-end mt-2">
              <button
                onClick={clearFilters}
                className="text-[#f8f8f8] text-[10px] font-medium underline tracking-[0.22px]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Auth modal — rendered outside header so it can overlay everything */}
    <AuthModal
      isOpen={authModalOpen}
      onClose={() => setAuthModalOpen(false)}
      initialMode={authModalMode}
      initialAccountType={authModalAccountType}
    />
    </>
  );
}
