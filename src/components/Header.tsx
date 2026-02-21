"use client";

import { Suspense, useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

const mainCategories = [
  { id: "construction", label: "01. Construction" },
  { id: "renovation", label: "02. Renovation" },
  { id: "architecture", label: "03. Architecture" },
  { id: "interior", label: "04. Interior" },
  { id: "real-estate", label: "05. Real Estate" },
];

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
  customMenuWidth?: number;
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
  customMenuWidth
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
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
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      // Allow rendering after position is calculated
      requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Determine menu width
  const menuWidth = customMenuWidth || (isProjectSize ? 230 : menuPos.width);

  return (
    <div className={`relative ${width}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 bg-[#f8f8f8] rounded-[6px] flex items-center justify-between px-3 w-full"
        style={{ letterSpacing: '0.12px' }}
      >
        <span className={`text-[11px] font-semibold ${buttonIsActive ? 'text-[#f14110]' : 'text-[#333]'}`}>
          {getButtonText()}
        </span>
        <Image src="/images/btn-down.svg" alt="" width={8} height={5} className="rotate-90" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div 
            className={`fixed bg-white rounded-[6px] shadow-lg z-50 max-h-[300px] overflow-y-auto transition-opacity duration-75 ${isPositioned ? 'opacity-100' : 'opacity-0'}`} 
            style={{ top: menuPos.top, left: menuPos.left, width: menuWidth }}
          >
            <div className="pt-2 pb-[10px] px-3">
              {options.map((option, index) => {
                const isSelected = multiSelect 
                  ? selectedValues.includes(option.id)
                  : value === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onChange(option.id);
                      if (!multiSelect) {
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full text-left py-2 text-[11px] flex items-center justify-between ${
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
                    <span className="whitespace-nowrap flex-1">{option.label}</span>
                    <div 
                      className={`flex-shrink-0 w-6 h-3 rounded-full ${isSelected ? 'bg-gradient-to-l from-[#f14110] to-[#e9a28e]' : 'bg-[#333]/25'}`}
                      style={{ marginLeft: '10px' }}
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
  // Location now supports multiple values (comma-separated)
  const [locations, setLocations] = useState<string[]>(
    searchParams.get("location") ? searchParams.get("location")!.split(",") : []
  );

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
      // If BALI is selected, clear all others and set only BALI
      newLocations = ["bali"];
    } else {
      // Remove BALI if it was selected
      let filtered = locations.filter(loc => loc !== "bali");
      
      if (filtered.includes(locationId)) {
        // Remove if already selected
        newLocations = filtered.filter(loc => loc !== locationId);
      } else {
        // Add to selection
        newLocations = [...filtered, locationId];
      }
    }
    
    setLocations(newLocations);
    updateParams({ location: newLocations.length > 0 ? newLocations.join(",") : null });
  };

  // Get location display text
  const getLocationDisplayText = () => {
    if (locations.length === 0) return "LOCATION";
    if (locations.includes("bali")) return "BALI";
    if (locations.length === 1) return locations[0].toUpperCase();
    return "LOCATION"; // Multiple locations selected
  };

  const isLocationActive = locations.length > 0;

  // Get categories based on active main category
  const getCategoryOptions = () => {
    if (activeCategory === "renovation") {
      return renovationCategories;
    }
    return constructionCategories;
  };

  return (
    <header className="relative">
      {/* Gradient Background - matches Figma: #E4E4E4 to #F14110 */}
      <div
        className="absolute inset-0 rounded-b-[6px]"
        style={{
          background: "linear-gradient(to right, #E4E4E4, #F14110)"
        }}
      />

      <div className="relative z-10 px-4 sm:px-0 pt-4 sm:pt-6 pb-6 sm:pb-8">
        {/* Top Bar */}
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 justify-between mb-4 sm:mb-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/images/logo-full.svg" alt="SolidFind.id" width={175} height={19} className="h-[19px] w-auto" />
          </Link>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="text-[#f8f8f8] hover:opacity-80 transition-opacity">
              <Image src="/images/icon-ig.svg" alt="Instagram" width={20} height={20} />
            </button>

            <SignedIn>
              <Link
                href="/register-business"
                className="hidden sm:flex h-10 px-4 rounded-full border border-[#f8f8f8] text-[#f8f8f8] text-[11px] font-medium tracking-[0.22px] hover:bg-white/10 transition-colors items-center"
              >
                List your business
              </Link>
              <Link
                href={userType === "company" ? "/company-dashboard" : "/dashboard"}
                className="text-[#f8f8f8] hover:opacity-80 transition-opacity"
                title="Dashboard"
              >
                <Image src="/images/icon-account.svg" alt="Dashboard" width={19} height={20} />
              </Link>
            </SignedIn>

            <SignedOut>
              <Link
                href="/sign-in"
                className="text-[#f8f8f8] hover:opacity-80 transition-opacity"
              >
                <Image src="/images/icon-account.svg" alt="Account" width={19} height={20} />
              </Link>
              <Link
                href="/sign-up"
                className="hidden sm:flex h-10 px-4 rounded-full border border-[#f8f8f8] text-[#f8f8f8] text-[11px] font-medium tracking-[0.22px] hover:bg-white/10 transition-colors items-center"
              >
                List your business
              </Link>
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
                      : "text-[#f8f8f8] hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[#f8f8f8] text-[9px] mt-4 font-medium leading-[12px]">
            Browse construction professionals for residential, commercial and hospitality projects in Indonesia.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-[900px] mx-auto">
          {/* Mobile: Stack vertically, Desktop: Flex with Clear button positioned right */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-2 sm:gap-0">
            {/* Left side: Keywords + Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[2px]">
              {/* Keywords Input - extended width on desktop */}
              <div className="w-full sm:w-[370px] h-10 bg-[#f8f8f8] rounded-[6px] flex items-center px-3">
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
              <div className="flex-shrink-0">
                <Dropdown
                  label="PROJECT SIZE"
                  options={projectSizeOptions}
                  value={projectSize}
                  onChange={(val) => { setProjectSize(val); updateParams({ projectSize: val || null }); }}
                  width="w-[120px] sm:w-[140px]"
                  isProjectSize={true}
                />
              </div>

              {/* Categories Dropdown */}
              <div className="flex-shrink-0">
                <Dropdown
                  label="CATEGORIES"
                  options={getCategoryOptions()}
                  value={category}
                  onChange={(val) => { setCategory(val); updateParams({ subcategory: val || null }); }}
                  width="w-[120px] sm:w-[140px]"
                />
              </div>

              {/* Location Dropdown - multi-select enabled */}
              <div className="flex-shrink-0">
                <Dropdown
                  label="LOCATION"
                  options={locationOptions}
                  value="" // Not used in multi-select mode
                  onChange={handleLocationChange}
                  width="w-[100px] sm:w-[120px]"
                  multiSelect={true}
                  selectedValues={locations}
                  displayText={getLocationDisplayText()}
                  isActive={isLocationActive}
                  customMenuWidth={200}
                />
              </div>

              {/* Search Button - 40x40 to match input height */}
              <button onClick={handleSearch} className="w-10 h-10 flex-shrink-0">
                <Image src="/images/btn-search.svg" alt="Search" width={40} height={40} className="w-10 h-10" />
              </button>
            </div>

            {/* Clear Filters - aligned to right of 900px container */}
            <button
              onClick={clearFilters}
              className="text-[#f8f8f8] text-[10px] sm:text-[11px] font-medium underline tracking-[0.22px] whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
