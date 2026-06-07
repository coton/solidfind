"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useClerk, useReverification } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import type { OAuthStrategy } from "@clerk/types";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MagicLinkLoadingPage } from "@/components/MagicLinkLoadingPage";
import { buildCompanyProfilePath } from "@/lib/company-profile-url.mjs";
import { COMPANY_ADDRESS_VALIDATION_MESSAGE, isLikelyCompanyAddress, normalizeCompanyAddress } from "@/lib/company-address-validation.mjs";
import { MIN_COMPANY_SINCE_YEAR, getMaxCompanySinceYear, isValidCompanySinceYear, normalizeCompanySinceYearInput } from "@/lib/company-since-year-validation.mjs";
import { isValidEmail, isValidPhone, isValidSocialProfile, isValidWebsite, isValidWhatsApp } from "@/lib/company-contact-validation.mjs";
import { Star, X, Upload, Lock, Check, ChevronDown, Phone, Globe, Instagram } from "lucide-react";
import { uploadFile as uploadFileToStorage } from "@/lib/uploadFile";
import { useProEnabled } from "@/hooks/useProEnabled";
import { calculateProfileCompletionScore, getProfileCompletionStatus } from "@/lib/profile-completion.mjs";
import { PROJECT_BUDGET_TIERS_PLATFORM_KEY, parseProjectBudgetTiers } from "@/lib/project-budget-tiers.mjs";

type SetupOAuthStrategy = Extract<OAuthStrategy, "oauth_google">;
type ServiceOption = { id: string; label: string };
const completeHouseChildren = ["living", "kitchen", "bathroom", "bedroom", "electricity", "plumbing"];
const categoryPriority = ["construction", "renovation", "architecture", "interior", "real-estate"] as const;
type CompanyCategoryId = (typeof categoryPriority)[number];

const categorySelectOptions: { id: CompanyCategoryId; label: string }[] = [
  { id: "construction", label: "Construction" },
  { id: "renovation", label: "Renovation" },
  { id: "architecture", label: "Architecture" },
  { id: "interior", label: "Interior" },
  { id: "real-estate", label: "Real Estate" },
];

const languageOptions = ["Bahasa", "English", "Mandarin", "Japanese", "French", "Dutch"];
const projectSizeOptions = [
  { id: "any", label: "ANY SIZE" },
  { id: "solo", label: "SOLO/COUPLE (1-2)" },
  { id: "family", label: "FAMILY/CO-HOSTING (3-6)" },
  { id: "shared", label: "SHARED/COMMUNITY (7+)" },
];
const concreteProjectSizeIds = projectSizeOptions
  .filter((option) => option.id !== "any")
  .map((option) => option.id);

const constructionServices = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "hospitality", label: "HOSPITALITY" },
];

const renovationServices = [
  { id: "every", label: "EVERY RENOVATIONS" },
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

const architectureServices = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "renovations-extensions", label: "RENOVATIONS & EXTENSIONS" },
  { id: "sustainable-eco", label: "SUSTAINABLE / ECO-ARCHI." },
];

const interiorServices = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "hospitality", label: "HOSPITALITY" },
  { id: "furnitures", label: "FURNITURES" },
  { id: "lighting", label: "LIGHTING" },
  { id: "styling-decoration", label: "STYLING & DECORATION" },
];

const realEstateServices = [
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

function getAllOptionId(options: ServiceOption[]) {
  return options.find((option) => option.id === "all" || option.id === "every")?.id ?? null;
}

function normalizeAllSelection(selected: string[], options: ServiceOption[]) {
  const allId = getAllOptionId(options);
  if (!allId) return selected;
  const allAliases = ["all", "every"];
  if (selected.some((id) => allAliases.includes(id)) && !selected.includes(allId)) {
    return [allId];
  }
  return selected.filter((id) => options.some((option) => option.id === id));
}

function resolveCategorySelection(enabled: boolean, selected: string[], options: ServiceOption[]) {
  if (!enabled) return [];
  const normalized = normalizeAllSelection(selected, options);
  if (normalized.length > 0) return normalized;
  const allId = getAllOptionId(options);
  return allId ? [allId] : options[0]?.id ? [options[0].id] : [];
}

function hasEnabledCategorySelection(enabled: boolean, selected: string[], options: ServiceOption[]) {
  return resolveCategorySelection(enabled, selected, options).length > 0;
}

function getPrimaryActiveCategory(categories: Record<(typeof categoryPriority)[number], string[]>) {
  return categoryPriority.find((category) => categories[category].length > 0) ?? "construction";
}

const proFeatures = [
  { icon: "star", title: "Priority positioning in search results", subtitle: "Penempatan prioritas dalam hasil pencarian" },
  { icon: "ai", title: "Structured for AI-assisted search", subtitle: "Terstruktur untuk pencarian yang dibantu AI" },
  { icon: "stats", title: "Visibility analytics — who's interested and when", subtitle: "Analisis visibilitas — siapa yang tertarik dan kapan" },
  { icon: "photos", title: "Up to 12 project photos or videos", subtitle: "Hingga 12 foto atau video proyek" },
  { icon: "ad", title: "Ad placements across the website", subtitle: "Penempatan iklan di seluruh situs web" },
];

function useStorageUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(api.files.getUrl, storageId ? { storageId } : "skip");
}

function ProjectImage({ storageId }: { storageId: Id<"_storage"> }) {
  const url = useStorageUrl(storageId);
  if (!url) return <div className="w-full h-full bg-[#e4e4e4]" />;
  return <Image src={url} alt="Project" fill className="object-cover" />;
}

function ExternalImagePreview({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="absolute inset-0 bg-[#e4e4e4]"
        aria-label={`${alt} unavailable`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23e4e4e4'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e4e4e4'/%3E%3C/svg%3E")`,
          backgroundSize: '10px 10px',
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function RequiredStar() {
  return <span className="text-[#f14110]">*</span>;
}

function WhatsappGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.07-1.33A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.93-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.13c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.12.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

function EmailGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LinkedinGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3.5" />
      <path d="M8 11v6" />
      <path d="M8 8.2v.1" />
      <path d="M12 17v-6" />
      <path d="M12 13.8c0-1.7 1-2.9 2.5-2.9 1.6 0 2.5 1.1 2.5 3V17" />
    </svg>
  );
}

function CompletionLine({ complete, children }: { complete: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${complete ? "border-[#f14110] bg-[#f14110] text-white" : "border-[#333]/20 text-transparent"}`}>
        <Check className="h-2.5 w-2.5" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function ProfileAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#333]/10 py-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left text-[10px] font-semibold text-[#333] tracking-[0.2px]"
      >
        {title}
        <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  );
}

function SetupSocialButton({ label, icon, onClick, disabled }: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex h-[38px] w-full items-center justify-center gap-2 rounded-[6px] border border-[#E4E4E4] bg-white text-[12px] font-medium text-[#333] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: hovered ? "#F0F0F0" : "white" }}
    >
      {icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function getSocialProviderLabel(strategy: SetupOAuthStrategy | null) {
  switch (strategy) {
    case "oauth_google":
      return "Google";
    default:
      return "Social";
  }
}

function getSocialProviderIcon(strategy: SetupOAuthStrategy | null) {
  switch (strategy) {
    case "oauth_google":
      return <GoogleIcon />;
    default:
      return null;
  }
}

function SetupBackButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-6 top-7 flex items-center gap-1 bg-transparent text-[11px] font-medium text-[#999] transition-colors hover:text-[#f14110] sm:left-8"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M6.5 1.5L3 5L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const proEnabled = useProEnabled();
  const [showProModal, setShowProModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingNavigationHref, setPendingNavigationHref] = useState<string | null>(null);
  const [openProfileExplainer, setOpenProfileExplainer] = useState<"english" | "indonesian" | null>(null);
  const [redirected, setRedirected] = useState(false);
  const [isDirty, setIsDirty] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const hydratedCompanyIdRef = useRef<string | null>(null);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const company = useQuery(
    api.companies.getByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );

  // If user has no company, redirect to individual dashboard
  if (currentUser && company === null && !redirected) {
    setRedirected(true);
    router.push("/dashboard");
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  const pageConfigs = useQuery(api.pageConfigs.listVisible);
  const projectBudgetTiersSetting = useQuery(api.platformSettings.get, { key: PROJECT_BUDGET_TIERS_PLATFORM_KEY });
  const projectBudgetTiers = useMemo(
    () => parseProjectBudgetTiers(projectBudgetTiersSetting ?? undefined),
    [projectBudgetTiersSetting]
  );
  const visibleCategoryOptions = useMemo(() => {
    if (!pageConfigs || pageConfigs.length === 0) {
      return categorySelectOptions.filter((category) => category.id === "construction" || category.id === "renovation");
    }
    return categorySelectOptions.filter((category) => pageConfigs.some((page) => page.categoryId === category.id));
  }, [pageConfigs]);
  const visibleCategoryIds = useMemo(() => visibleCategoryOptions.map((category) => category.id), [visibleCategoryOptions]);
  const isCategoryVisible = (catId: string) => visibleCategoryIds.includes(catId as CompanyCategoryId);
  const getCategoryServiceOptions = useMemo(() => {
    return (categoryId: string, fallback: ServiceOption[]) => {
      const dynamicOptions = pageConfigs
        ?.find((page) => page.categoryId === categoryId)
        ?.filters.find((filter) => filter.id === "categories")
        ?.options;
      return dynamicOptions && dynamicOptions.length > 0 ? dynamicOptions : fallback;
    };
  }, [pageConfigs]);
  const constructionServiceOptions = getCategoryServiceOptions("construction", constructionServices);
  const renovationServiceOptions = getCategoryServiceOptions("renovation", renovationServices);
  const architectureServiceOptions = getCategoryServiceOptions("architecture", architectureServices);
  const interiorServiceOptions = getCategoryServiceOptions("interior", interiorServices);
  const realEstateServiceOptions = getCategoryServiceOptions("real-estate", realEstateServices);

  const updateCompany = useMutation(api.companies.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteAccount = useMutation(api.users.deleteAccount);

  const handleDeleteAccount = async () => {
    if (!clerkUser?.id) return;
    await deleteAccount({ clerkId: clerkUser.id });
    await handleSignOut();
  };

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [roleDiscipline, setRoleDiscipline] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState<CompanyCategoryId>("construction");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [description, setDescription] = useState("");
  const [projectsNumber, setProjectsNumber] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [budgetMinIndex, setBudgetMinIndex] = useState(9);
  const [budgetMaxIndex, setBudgetMaxIndex] = useState(10);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Bahasa", "English"]);

  // Toggles
  const [selectedProjectSizes, setSelectedProjectSizes] = useState<string[]>([]);
  const [, setProjectSizeEnabled] = useState(true);
  const [selectedConstruction, setSelectedConstruction] = useState<string[]>([]);
  const [constructionEnabled, setConstructionEnabled] = useState(false);
  const [selectedRenovation, setSelectedRenovation] = useState<string[]>([]);
  const [renovationEnabled, setRenovationEnabled] = useState(false);
  const [selectedArchitecture, setSelectedArchitecture] = useState<string[]>([]);
  const [architectureEnabled, setArchitectureEnabled] = useState(false);
  const [selectedInterior, setSelectedInterior] = useState<string[]>([]);
  const [interiorEnabled, setInteriorEnabled] = useState(false);
  const [selectedRealEstate, setSelectedRealEstate] = useState<string[]>([]);
  const [realEstateEnabled, setRealEstateEnabled] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [, setLocationEnabled] = useState(true);

  // Image state
  const [logoId, setLogoId] = useState<Id<"_storage"> | undefined>();
  const [projectImageIds, setProjectImageIds] = useState<Id<"_storage">[]>([]);
  const [projectImageUrls, setProjectImageUrls] = useState<string[]>([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [setupStage, setSetupStage] = useState<"method" | "emailChoice" | "verify" | "password" | "socialFinish">("method");
  const [setupSelectedSocial, setSetupSelectedSocial] = useState<SetupOAuthStrategy | null>(null);
  const [setupLoginEmail, setSetupLoginEmail] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState("");
  const [setupAccountSaving, setSetupAccountSaving] = useState(false);
  const [setupAccountError, setSetupAccountError] = useState("");
  const [setupSocialLoading, setSetupSocialLoading] = useState<SetupOAuthStrategy | null>(null);
  const [setupVerificationCode, setSetupVerificationCode] = useState("");
  const [setupVerificationRequestSubmitted, setSetupVerificationRequestSubmitted] = useState(false);
  const [setupVerificationSent, setSetupVerificationSent] = useState(false);
  const [setupVerificationSending, setSetupVerificationSending] = useState(false);
  const [setupVerificationSubmitting, setSetupVerificationSubmitting] = useState(false);
  const createExternalAccount = useReverification((params: {
    strategy: SetupOAuthStrategy;
    redirectUrl: string;
    oidcLoginHint?: string;
  }) => clerkUser?.createExternalAccount(params));
  const setupEmailResourceRef = useRef<{
    id: string;
    emailAddress: string;
    prepareVerification: (params: { strategy: "email_code" }) => Promise<unknown>;
    attemptVerification: (params: { code: string }) => Promise<{ verification?: { status?: string | null } | null }>;
  } | null>(null);

  // Mandatory fields validation
  const hasCategory = hasEnabledCategorySelection(constructionEnabled, selectedConstruction, constructionServiceOptions)
    || hasEnabledCategorySelection(renovationEnabled, selectedRenovation, renovationServiceOptions)
    || hasEnabledCategorySelection(architectureEnabled, selectedArchitecture, architectureServiceOptions)
    || hasEnabledCategorySelection(interiorEnabled, selectedInterior, interiorServiceOptions)
    || hasEnabledCategorySelection(realEstateEnabled, selectedRealEstate, realEstateServiceOptions);
  const missingProjectSize = selectedProjectSizes.length === 0;
  const missingLocation = selectedLocations.length === 0;
  const missingDescription = !description.trim();
  const missingEmail = !email.trim();
  const normalizedAddress = normalizeCompanyAddress(address);
  const missingAddress = !normalizedAddress;
  const invalidAddress = Boolean(normalizedAddress && !isLikelyCompanyAddress(normalizedAddress));
  const maxCompanySinceYear = getMaxCompanySinceYear();
  const invalidFoundedYear = Boolean(foundedYear && !isValidCompanySinceYear(foundedYear, maxCompanySinceYear));
  const invalidPhone = !isValidPhone(phone);
  const invalidEmail = !isValidEmail(email);
  const invalidWebsite = !isValidWebsite(website);
  const invalidWhatsapp = !isValidWhatsApp(whatsapp);
  const invalidFacebook = !isValidSocialProfile(facebook, "facebook");
  const invalidLinkedin = !isValidSocialProfile(linkedin, "linkedin");
  const invalidInstagram = !isValidSocialProfile(instagram, "instagram");
  const hasInvalidContactField = invalidPhone || invalidEmail || invalidWebsite || invalidWhatsapp || invalidFacebook || invalidLinkedin || invalidInstagram;

  // Determine the bottom hint text and whether it's a warning (orange)
  let bottomHintText = "*Select at least 1 category before saving\n*Pilih setidaknya 1 kategori sebelum menyimpan";
  let bottomHintIsWarning = false;

  if (!hasCategory) {
    // Category missing — keep the repeated warning consistently orange
    bottomHintText = "*Select at least 1 category before saving\n*Pilih setidaknya 1 kategori sebelum menyimpan";
    bottomHintIsWarning = true;
  } else if (missingLocation && !missingProjectSize) {
    bottomHintText = "*Location needs to be activated\n*Lokasi perlu diaktifkan";
    bottomHintIsWarning = true;
  } else if (missingProjectSize && !missingLocation) {
    bottomHintText = "*Project size needs to be selected\n*Ukuran proyek perlu dipilih";
    bottomHintIsWarning = true;
  } else if (missingProjectSize && missingLocation) {
    bottomHintText = "*Project size and Location need to be selected\n*Ukuran proyek dan Lokasi perlu dipilih";
    bottomHintIsWarning = true;
  } else if (missingDescription) {
    bottomHintText = "*Company description is required\n*Deskripsi perusahaan wajib diisi";
    bottomHintIsWarning = true;
  } else if (missingEmail) {
    bottomHintText = "*Company email is required\n*Email perusahaan wajib diisi";
    bottomHintIsWarning = true;
  } else if (missingAddress) {
    bottomHintText = "*Company address is required\n*Alamat perusahaan wajib diisi";
    bottomHintIsWarning = true;
  } else if (invalidAddress) {
    bottomHintText = `*${COMPANY_ADDRESS_VALIDATION_MESSAGE}\n*Masukkan alamat yang valid`;
    bottomHintIsWarning = true;
  } else if (invalidFoundedYear) {
    bottomHintText = `*Founded year must be 4 digits from ${MIN_COMPANY_SINCE_YEAR} to ${maxCompanySinceYear}\n*Tahun berdiri harus 4 angka dari ${MIN_COMPANY_SINCE_YEAR} sampai ${maxCompanySinceYear}`;
    bottomHintIsWarning = true;
  } else if (hasInvalidContactField) {
    bottomHintText = "*Please check contact and social fields format\n*Mohon periksa format kontak dan media sosial";
    bottomHintIsWarning = true;
  }

  const canSave = hasCategory && !missingProjectSize && !missingLocation && !missingDescription && !missingEmail && !missingAddress && !invalidAddress && !invalidFoundedYear && !hasInvalidContactField;
  const isFirstCompanyConnection = searchParams.get("firstConnection") === "1";
  const hasSetupAccountQuery = searchParams.get("setupAccount") === "1";
  const hasCompletedSetupSignInMethod = Boolean(
    clerkUser?.passwordEnabled || (clerkUser?.externalAccounts?.length ?? 0) > 0
  );
  const shouldPromptSetupAccount = !!clerkUser && (hasSetupAccountQuery || !hasCompletedSetupSignInMethod);
  const isResolvingSetupAccount = (hasSetupAccountQuery || shouldPromptSetupAccount) && (!clerkUser || currentUser === undefined || company === undefined);
  const primaryCompanyEmail = clerkUser?.primaryEmailAddress?.emailAddress || "";
  const storedCompanyEmail = company?.email || primaryCompanyEmail;
  const setupDisplayEmail = setupLoginEmail || storedCompanyEmail;
  const isDifferentSocialEmail = Boolean(
    setupSelectedSocial
    && setupLoginEmail.trim()
    && storedCompanyEmail
    && setupLoginEmail.trim().toLowerCase() !== storedCompanyEmail.trim().toLowerCase()
  );
  const hasCompleteVerificationCode = setupVerificationCode.trim().length === 6;

  const logoUrl = useStorageUrl(logoId);
  const logoPreviewUrl = logoUrl ?? company?.imageUrl;
  const totalProjectImages = projectImageUrls.length + projectImageIds.length;
  const findBudgetTierIndex = (rawValue: unknown, fallbackIndex: number) => {
    const value = Number(rawValue);
    if (!Number.isFinite(value)) return Math.min(fallbackIndex, projectBudgetTiers.length - 1);
    const idrValue = value < 100_000 ? value * 1_000_000 : value;
    const exact = projectBudgetTiers.findIndex((tier) => tier.value === idrValue);
    if (exact >= 0) return exact;
    const nearest = projectBudgetTiers.reduce((bestIndex, tier, index) => {
      const best = projectBudgetTiers[bestIndex];
      return Math.abs(tier.value - idrValue) < Math.abs(best.value - idrValue) ? index : bestIndex;
    }, 0);
    return nearest;
  };
  const profileCompletionItems = {
    identity: companyName.trim().length >= 2 && selectedLocations.length > 0 && description.trim().length > 0,
    contact: Boolean(phone.trim() || whatsapp.trim()),
    projectScope: selectedProjectSizes.length > 0 && hasCategory,
    onlinePresence: Boolean(website.trim() || instagram.trim() || facebook.trim() || linkedin.trim()),
    profileDetails: Boolean(
      foundedYear
      && isValidCompanySinceYear(foundedYear, maxCompanySinceYear)
      && Number(teamSize) >= 1
    ),
    projectMedia: totalProjectImages > 0,
  };
  const activeCategories = [
    hasEnabledCategorySelection(constructionEnabled, selectedConstruction, constructionServiceOptions) ? "construction" : null,
    hasEnabledCategorySelection(renovationEnabled, selectedRenovation, renovationServiceOptions) ? "renovation" : null,
    hasEnabledCategorySelection(architectureEnabled, selectedArchitecture, architectureServiceOptions) ? "architecture" : null,
    hasEnabledCategorySelection(interiorEnabled, selectedInterior, interiorServiceOptions) ? "interior" : null,
    hasEnabledCategorySelection(realEstateEnabled, selectedRealEstate, realEstateServiceOptions) ? "real-estate" : null,
  ].filter(Boolean) as string[];
  const profileCompletionScore = calculateProfileCompletionScore(
    {
      companyName,
      categories: activeCategories,
      locations: selectedLocations,
      description,
      phone,
      whatsapp,
      email,
      website,
      instagram,
      facebook,
      linkedin,
      foundedYear,
      teamSize,
      projects: projectsNumber,
      hasLogo: Boolean(logoPreviewUrl),
      projectPhotoCount: totalProjectImages,
      isReviewed: company?.isReviewed,
    },
    Boolean(company?.isPro)
  );
  const profileCompletionStatus = getProfileCompletionStatus(profileCompletionScore);

  // Populate form when company data loads
  useEffect(() => {
    if (company) {
      const companyKey = String(company._id);
      if (hydratedCompanyIdRef.current === companyKey) return;
      hydratedCompanyIdRef.current = companyKey;

      setCompanyName(company.name ?? "");
      setRoleDiscipline(company.roleDiscipline ?? "");
      setPrimaryCategory(categoryPriority.includes(company.category as CompanyCategoryId) ? company.category as CompanyCategoryId : "construction");
      setAddress(company.address ?? "");
      setPhone(company.phone ?? "");
      setEmail(company.email ?? "");
      setWebsite(company.website ?? "");
      setWhatsapp(company.whatsapp ?? "");
      setFacebook(company.facebook ?? "");
      setLinkedin(company.linkedin ?? "");
      setInstagram(company.instagram ?? "");
      setDescription(company.description ?? "");
      setProjectsNumber(company.projects?.toString() ?? "");
      setTeamSize(company.teamSize?.toString() ?? "");
      setSelectedProjectSizes(company.projectSizes ?? []);
      setProjectSizeEnabled((company.projectSizes ?? []).length > 0);
      setSelectedConstruction(company.constructionTypes ?? []);
      setConstructionEnabled((company.constructionTypes ?? []).length > 0);
      setSelectedRenovation(company.renovationTypes ?? []);
      setRenovationEnabled((company.renovationTypes ?? []).length > 0);
      setSelectedArchitecture(company.architectureTypes ?? []);
      setArchitectureEnabled((company.architectureTypes ?? []).length > 0);
      setSelectedInterior(company.interiorTypes ?? []);
      setInteriorEnabled((company.interiorTypes ?? []).length > 0);
      setSelectedRealEstate(company.realEstateTypes ?? []);
      setRealEstateEnabled((company.realEstateTypes ?? []).length > 0);
      // Load global location from first non-empty per-category location
      const existingLocs = company.constructionLocations ?? company.renovationLocations ?? company.architectureLocations ?? company.interiorLocations ?? company.realEstateLocations ?? [];
      setSelectedLocations(existingLocs);
      setLocationEnabled(existingLocs.length > 0);
      setLogoId(company.logoId ?? undefined);
      setProjectImageIds(company.projectImageIds ?? []);
      setProjectImageUrls(company.projectImageUrls ?? []);
      setFoundedYear(company.since?.toString() ?? "");
      const nextBudgetMinIndex = findBudgetTierIndex((company as any).projectBudgetMin ?? company.averageProjectMin, 9);
      const nextBudgetMaxIndex = findBudgetTierIndex((company as any).projectBudgetMax ?? company.averageProjectMax, 10);
      setBudgetMinIndex(Math.min(nextBudgetMinIndex, nextBudgetMaxIndex));
      setBudgetMaxIndex(Math.max(nextBudgetMinIndex, nextBudgetMaxIndex));
      const languages = Array.isArray(company.languagesSpoken) && company.languagesSpoken.length > 0
        ? company.languagesSpoken.filter((language: string) => languageOptions.includes(language))
        : ["Bahasa", "English"];
      setSelectedLanguages(languages.length > 0 ? languages : ["Bahasa", "English"]);
      setIsDirty(false);
    }
  }, [company, projectBudgetTiers]);

  useEffect(() => {
    if (visibleCategoryIds.length === 0 || visibleCategoryIds.includes(primaryCategory)) return;
    setPrimaryCategory(visibleCategoryIds[0]);
  }, [primaryCategory, visibleCategoryIds]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const requestNavigation = (href: string) => {
    if (isDirty) {
      setPendingNavigationHref(href);
      return;
    }

    router.push(href);
  };

  const confirmPendingNavigation = () => {
    if (!pendingNavigationHref) return;
    setIsDirty(false);
    const href = pendingNavigationHref;
    setPendingNavigationHref(null);
    router.push(href);
  };

  const cancelPendingNavigation = () => {
    setPendingNavigationHref(null);
  };

  useEffect(() => {
    if (!hasSetupAccountQuery) {
      return;
    }
    if (!setupLoginEmail) {
      setSetupLoginEmail(storedCompanyEmail);
    }
  }, [hasSetupAccountQuery, setupLoginEmail, storedCompanyEmail]);

  const renderMatrixSwitch = (active: boolean) => (
    <span className={`sf-switch ${active ? "on" : ""}`} aria-hidden="true">
      <span className="sf-switch-knob" />
    </span>
  );

  const toggleProjectSizeMatrix = (id: string) => {
    setIsDirty(true);
    if (id === "any") {
      setSelectedProjectSizes(selectedProjectSizes.includes("any") ? [] : ["any"]);
      return;
    }

    const next = selectedProjectSizes.includes(id)
      ? selectedProjectSizes.filter((size) => size !== id)
      : [...selectedProjectSizes.filter((size) => size !== "any"), id];
    const hasAllConcreteSizes = concreteProjectSizeIds.every((sizeId) => next.includes(sizeId));
    setSelectedProjectSizes(hasAllConcreteSizes ? ["any"] : next);
  };

  const toggleLocationMatrix = (id: string) => {
    setIsDirty(true);
    if (id === "bali") {
      setSelectedLocations(selectedLocations.includes("bali") ? [] : ["bali"]);
      return;
    }

    let next = selectedLocations.includes(id)
      ? selectedLocations.filter((location) => location !== id)
      : [...selectedLocations.filter((location) => location !== "bali"), id];
    const allIndividual = locationOptions.filter((location) => location.id !== "bali").map((location) => location.id);
    if (allIndividual.every((locationId) => next.includes(locationId))) {
      next = ["bali"];
    }
    setSelectedLocations(next);
  };

  const setCategoryEnabledById = (categoryId: CompanyCategoryId, enabled: boolean) => {
    if (categoryId === "construction") setConstructionEnabled(enabled);
    if (categoryId === "renovation") setRenovationEnabled(enabled);
    if (categoryId === "architecture") setArchitectureEnabled(enabled);
    if (categoryId === "interior") setInteriorEnabled(enabled);
    if (categoryId === "real-estate") setRealEstateEnabled(enabled);
  };

  const handlePrimaryCategoryChange = (categoryId: CompanyCategoryId) => {
    setPrimaryCategory(categoryId);
    setCategoryEnabledById(categoryId, true);
    setIsDirty(true);
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((current) => {
      if (current.includes(language)) {
        return current.length <= 1 ? current : current.filter((item) => item !== language);
      }
      return [...current, language];
    });
    setIsDirty(true);
  };

  const updateBudgetMin = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), budgetMaxIndex);
    setBudgetMinIndex(nextIndex);
    setIsDirty(true);
  };

  const updateBudgetMax = (index: number) => {
    const nextIndex = Math.max(Math.min(index, projectBudgetTiers.length - 1), budgetMinIndex);
    setBudgetMaxIndex(nextIndex);
    setIsDirty(true);
  };

  const toggleCategoryServiceMatrix = (
    options: ServiceOption[],
    selected: string[],
    setSelected: (next: string[]) => void,
    id: string
  ) => {
    const allId = getAllOptionId(options);
    const normalizedSelected = normalizeAllSelection(selected, options);
    setIsDirty(true);

    if (id === allId && allId) {
      setSelected(normalizedSelected.includes(allId) ? normalizedSelected.filter((item) => item !== allId) : [allId]);
      return;
    }

    if (id === "complete") {
      setSelected(normalizedSelected.includes("complete") ? [] : ["complete"]);
      return;
    }

    let next = normalizedSelected.includes(id)
      ? normalizedSelected.filter((item) => item !== id)
      : [...normalizedSelected.filter((item) => item !== allId), id];
    const allIndividual = options.filter((option) => option.id !== allId).map((option) => option.id);
    if (allId && allIndividual.every((optionId) => next.includes(optionId))) {
      next = [allId];
    }
    setSelected(next);
  };

  const renderMatrixRow = ({
    id,
    label,
    active,
    disabled = false,
    master = false,
    onClick,
  }: {
    id: string;
    label: string;
    active: boolean;
    disabled?: boolean;
    master?: boolean;
    onClick: () => void;
  }) => (
    <button
      key={id}
      type="button"
      className={`sf-mx-row ${master ? "master" : ""} ${active ? "on" : ""} ${disabled ? "is-disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="sf-mx-row-label">{label}</span>
      {renderMatrixSwitch(active)}
    </button>
  );

  const renderCategoryMatrix = ({
    id,
    title,
    enabled,
    setEnabled,
    selected,
    setSelected,
    options,
  }: {
    id: string;
    title: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    selected: string[];
    setSelected: (next: string[]) => void;
    options: ServiceOption[];
  }) => {
    const normalizedSelected = normalizeAllSelection(selected, options);
    const allId = getAllOptionId(options);
    const allActive = Boolean(allId && normalizedSelected.includes(allId));
    const completeActive = normalizedSelected.includes("complete");

    return (
      <article className={`sf-mx-block sf-mx-cat ${enabled ? "on" : ""}`} key={id}>
        <button
          type="button"
          className="sf-mx-cathead"
          onClick={() => {
            setIsDirty(true);
            setEnabled(!enabled);
            if (enabled) setSelected([]);
          }}
        >
          <h4>{title}</h4>
          {renderMatrixSwitch(enabled)}
        </button>
        <div className={`sf-mx-catbody ${enabled ? "" : "is-off"}`}>
          {options.map((service) => {
            const isAll = service.id === allId;
            const isCompleteChild = id === "renovation" && completeHouseChildren.includes(service.id);
            const disabled = !enabled || (allActive && !isAll) || (completeActive && isCompleteChild);
            return renderMatrixRow({
              id: service.id,
              label: service.label,
              active: normalizedSelected.includes(service.id),
              disabled,
              master: isAll,
              onClick: () => toggleCategoryServiceMatrix(options, selected, setSelected, service.id),
            });
          })}
        </div>
      </article>
    );
  };

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const uploadUrl = await generateUploadUrl();
    const storageId = await uploadFileToStorage(file, uploadUrl);
    return storageId as Id<"_storage">;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Logo file must be under 2MB");
      return;
    }
    setUploadError(null);
    setLogoUploading(true);
    try {
      const id = await uploadFile(file);
      setLogoId(id);
      setIsDirty(true);
    } catch {
      setUploadError("Failed to upload logo. Please try again.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image file must be under 2MB");
      return;
    }
    const max = company?.isPro ? 12 : 4;
    if (totalProjectImages >= max) return;
    setUploadError(null);
    const slotIndex = totalProjectImages;
    setUploadingSlot(slotIndex);
    try {
      const id = await uploadFile(file);
      const newIds = [...projectImageIds, id];
      setProjectImageIds(newIds);
      setIsDirty(true);
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploadingSlot(null);
      if (projectInputRef.current) projectInputRef.current.value = "";
    }
  };

  const handleRemoveProjectImage = async (index: number) => {
    if (index < projectImageUrls.length) {
      const nextExternalUrls = projectImageUrls.filter((_, i) => i !== index);
      setProjectImageUrls(nextExternalUrls);
      setIsDirty(true);
      return;
    }

    const storageIndex = index - projectImageUrls.length;
    const nextStorageIds = projectImageIds.filter((_, i) => i !== storageIndex);
    setProjectImageIds(nextStorageIds);
    setIsDirty(true);
  };

  const createCompany = useMutation(api.companies.create);

  const handleSave = async () => {
    if (!currentUser || saving) return;
    setSaveError("");

    // Validate all mandatory fields
    if (!canSave) {
      setSaveError(bottomHintText);
      return;
    }

    setSaving(true);
    try {
      const savedConstruction = resolveCategorySelection(constructionEnabled, selectedConstruction, constructionServiceOptions);
      const savedRenovation = resolveCategorySelection(renovationEnabled, selectedRenovation, renovationServiceOptions);
      const savedArchitecture = resolveCategorySelection(architectureEnabled, selectedArchitecture, architectureServiceOptions);
      const savedInterior = resolveCategorySelection(interiorEnabled, selectedInterior, interiorServiceOptions);
      const savedRealEstate = resolveCategorySelection(realEstateEnabled, selectedRealEstate, realEstateServiceOptions);
      const inferredPrimaryCategory = getPrimaryActiveCategory({
        construction: savedConstruction,
        renovation: savedRenovation,
        architecture: savedArchitecture,
        interior: savedInterior,
        "real-estate": savedRealEstate,
      });
      const savedPrimaryCategory = visibleCategoryIds.includes(primaryCategory) ? primaryCategory : inferredPrimaryCategory;
      if (company) {
        await updateCompany({
          id: company._id,
          name: companyName || undefined,
          roleDiscipline: roleDiscipline || undefined,
          category: savedPrimaryCategory,
          description: description || undefined,
          location: selectedLocations.join(",") || undefined,
          address: normalizedAddress || undefined,
          projects: projectsNumber ? parseInt(projectsNumber) : undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          projectBudgetMin: projectBudgetTiers[budgetMinIndex]?.value,
          projectBudgetMax: projectBudgetTiers[budgetMaxIndex]?.value,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          whatsapp: whatsapp || undefined,
          facebook: facebook || undefined,
          linkedin: linkedin || undefined,
          instagram: instagram || undefined,
          languagesSpoken: selectedLanguages,
          projectSizes: selectedProjectSizes,
          constructionTypes: savedConstruction,
          constructionLocations: selectedLocations,
          renovationTypes: savedRenovation,
          renovationLocations: selectedLocations,
          architectureTypes: savedArchitecture,
          architectureLocations: selectedLocations,
          interiorTypes: savedInterior,
          interiorLocations: selectedLocations,
          realEstateTypes: savedRealEstate,
          realEstateLocations: selectedLocations,
          logoId: logoId ?? undefined,
          projectImageIds,
          projectImageUrls,
          isReviewed: true,
          since: foundedYear ? parseInt(foundedYear) : undefined,
        });
      } else {
        await createCompany({
          ownerId: currentUser._id,
          name: companyName || currentUser.companyName || "My Company",
          roleDiscipline: roleDiscipline || undefined,
          description: description || undefined,
          category: savedPrimaryCategory,
          location: selectedLocations[0] || "bali",
          address: normalizedAddress || undefined,
          isPro: false,
          projects: projectsNumber ? parseInt(projectsNumber) : undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          projectBudgetMin: projectBudgetTiers[budgetMinIndex]?.value,
          projectBudgetMax: projectBudgetTiers[budgetMaxIndex]?.value,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          whatsapp: whatsapp || undefined,
          facebook: facebook || undefined,
          linkedin: linkedin || undefined,
          instagram: instagram || undefined,
          languagesSpoken: selectedLanguages,
          projectSizes: selectedProjectSizes,
          constructionTypes: savedConstruction,
          constructionLocations: selectedLocations,
          renovationTypes: savedRenovation,
          renovationLocations: selectedLocations,
          architectureTypes: savedArchitecture,
          architectureLocations: selectedLocations,
          interiorTypes: savedInterior,
          interiorLocations: selectedLocations,
          realEstateTypes: savedRealEstate,
          realEstateLocations: selectedLocations,
          logoId: logoId ?? undefined,
          projectImageIds,
          projectImageUrls,
          isReviewed: true,
          since: foundedYear ? parseInt(foundedYear) : undefined,
        });
      }
      setIsDirty(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save your company profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const maxImages = company?.isPro ? 12 : 4;
  const totalSlots = proEnabled ? 12 : 4;

  const clearSetupFlow = () => {
    setSetupStage("method");
    setSetupSelectedSocial(null);
    setSetupLoginEmail("");
    setSetupPassword("");
    setSetupPasswordConfirm("");
    setSetupAccountSaving(false);
    setSetupAccountError("");
    setSetupSocialLoading(null);
    setSetupVerificationCode("");
    setSetupVerificationRequestSubmitted(false);
    setSetupVerificationSent(false);
    setSetupVerificationSending(false);
    setSetupVerificationSubmitting(false);
    setupEmailResourceRef.current = null;
  };

  const handleSetupSocialAuth = async (strategy: SetupOAuthStrategy) => {
    setSetupSelectedSocial(strategy);
    setSetupLoginEmail(storedCompanyEmail);
    setSetupStage("emailChoice");
    setSetupAccountError("");
  };

  const handleSetupEmailChoice = async () => {
    if (!clerkUser) return;

    const enteredEmail = setupLoginEmail.trim().toLowerCase();

    if (!enteredEmail) {
      setSetupAccountError("Please enter the login email before continuing.");
      return;
    }

    setSetupVerificationSending(true);
    setSetupVerificationSubmitting(false);
    setSetupVerificationCode("");
    setSetupVerificationRequestSubmitted(false);
    setSetupVerificationSent(false);
    setSetupAccountError("");

    try {
      const prepareResponse = await fetch("/api/company/prepare-login-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: enteredEmail }),
      });

      if (!prepareResponse.ok) {
        const payload = await prepareResponse.json().catch(() => null);
        throw new Error(payload?.error || "Unable to prepare this login email.");
      }

      await clerkUser.reload();

      const emailResource = clerkUser.emailAddresses.find(
        (item) => item.emailAddress.trim().toLowerCase() === enteredEmail
      );

      if (!emailResource) {
        throw new Error("Unable to find this email on your company account yet. Please try again.");
      }

      if (emailResource.verification?.status !== "verified") {
        await emailResource.prepareVerification({ strategy: "email_code" });
      }

      setupEmailResourceRef.current = emailResource;
      setSetupVerificationRequestSubmitted(true);
      setSetupVerificationSent(true);
      setSetupStage("verify");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send the verification email.";
      setSetupAccountError(message);
    } finally {
      setSetupVerificationSending(false);
    }
  };

  const syncSetupLoginEmail = async (nextPassword?: string) => {
    const response = await fetch("/api/company/setup-login-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: setupLoginEmail.trim().toLowerCase(),
        ...(nextPassword ? { password: nextPassword } : {}),
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || "Unable to finish setting up this company account.");
    }

    if (clerkUser) {
      await clerkUser.reload();
    }

    return response.json();
  };

  const handleSetupAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clerkUser || setupAccountSaving) return;

    if (!setupPassword.trim()) {
      setSetupAccountError("Please enter a password.");
      return;
    }

    if (setupPassword.length < 8) {
      setSetupAccountError("Password must be at least 8 characters.");
      return;
    }

    if (setupPassword !== setupPasswordConfirm) {
      setSetupAccountError("Passwords do not match.");
      return;
    }

    setSetupAccountSaving(true);
    setSetupAccountError("");

    try {
      await syncSetupLoginEmail(setupPassword);

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("setupAccount");
      const nextQuery = nextParams.toString();
      const redirectTarget = nextQuery ? `/company-dashboard/edit?${nextQuery}` : "/company-dashboard/edit";
      clearSetupFlow();
      router.replace(redirectTarget);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to register your password. Please try again.";
      setSetupAccountError(message);
    } finally {
      setSetupAccountSaving(false);
    }
  };

  const handleSetupVerification = async () => {
    if (!setupEmailResourceRef.current || setupVerificationSubmitting) {
      return;
    }

    if (!setupVerificationCode.trim()) {
      setSetupAccountError("Please enter the verification code sent to your email.");
      return;
    }

    setSetupVerificationSubmitting(true);
    setSetupAccountError("");

    try {
      const result = await setupEmailResourceRef.current.attemptVerification({
        code: setupVerificationCode.trim(),
      });

      if (result.verification?.status !== "verified") {
        throw new Error("Invalid verification code.");
      }

      await syncSetupLoginEmail();

      if (setupSelectedSocial) {
        setSetupStage("socialFinish");
      } else {
        setSetupStage("password");
      }
    } catch (error) {
      setSetupSocialLoading(null);
      const message = error instanceof Error ? error.message : "Failed to verify your email code.";

      if (message.includes("already been verified")) {
        try {
          await clerkUser?.reload();
          const refreshedEmail = clerkUser?.emailAddresses.find(
            (item) => item.emailAddress.trim().toLowerCase() === setupLoginEmail.trim().toLowerCase()
          );

          if (refreshedEmail?.verification?.status === "verified") {
            await syncSetupLoginEmail();

            if (setupSelectedSocial) {
              setSetupStage("socialFinish");
            } else {
              setSetupStage("password");
            }
            return;
          }
        } catch {
          // Fall through to the original error if Clerk does not reflect a verified email yet.
        }
      }

      setSetupAccountError(message);
    } finally {
      setSetupVerificationSubmitting(false);
    }
  };

  if (isResolvingSetupAccount) {
    return <MagicLinkLoadingPage />;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      {/* Hidden file inputs */}
      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
      <input ref={projectInputRef} type="file" accept="image/*" className="hidden" onChange={handleProjectImageUpload} />

      {/* Upload error toast */}
      {uploadError && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 text-[12px] px-4 py-3 rounded-[6px] shadow-lg flex items-center gap-2">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="sf-edit flex-grow w-full" data-screen-label="Edit profile">
        <div className="sf-edit-bar">
          <div>
            <span className="sf-tag-mono">Editing profile · {company?.isPro && proEnabled ? "Pro Account" : "Free account"}</span>
            {company ? (
              <button
                type="button"
                onClick={() => requestNavigation(buildCompanyProfilePath(company))}
                className="sf-edit-title text-left hover:text-[#f14110] transition-colors"
              >
                {companyName || company.name || "Company profile"}
              </button>
            ) : (
              <h1 className="sf-edit-title">{companyName || "Company profile"}</h1>
            )}
            <p className="sf-edit-topnote">{company?.email || email || clerkUser?.primaryEmailAddress?.emailAddress || ""}</p>
          </div>
          <div className="sf-edit-actions">
            {company && !isFirstCompanyConnection && (
              <button
                type="button"
                onClick={() => requestNavigation("/company-dashboard")}
                className="sf-btn sf-btn-lg sf-btn-ghost"
              >
                ← Dashboard
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              className="sf-btn sf-btn-lg sf-btn-pri"
            >
              {saving ? "Saving..." : "Save changes →"}
            </button>
          </div>
        </div>

        <section className="sf-edit-cover-strip" onChangeCapture={() => setIsDirty(true)}>
          <div className="sf-edit-cover">
            {projectImageUrls[0] ? (
              <ExternalImagePreview src={projectImageUrls[0]} alt="Company cover photo" />
            ) : projectImageIds[0] ? (
              <ProjectImage storageId={projectImageIds[0]} />
            ) : null}
            <button
              type="button"
              className="sf-btn sf-btn-ghost sf-edit-cover-btn"
              onClick={() => projectInputRef.current?.click()}
              disabled={totalProjectImages >= maxImages || uploadingSlot !== null}
            >
              <Upload className="h-4 w-4" />
              {uploadingSlot !== null ? "Uploading..." : "Replace cover photo"}
            </button>
          </div>
          <div className="sf-edit-logo-strip">
            <span className="sf-tag-mono">Company logo</span>
            <div className="sf-edit-logo-row">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="sf-edit-logo"
                aria-label="Upload company logo"
              >
                {logoPreviewUrl ? (
                  logoId ? (
                    <Image src={logoPreviewUrl} alt="Company logo" fill className="object-cover" />
                  ) : (
                    <ExternalImagePreview src={logoPreviewUrl} alt="Company logo" />
                  )
                ) : (
                  (companyName || company?.name || "?").trim().charAt(0).toUpperCase()
                )}
                {logoUploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
              <div className="sf-edit-logo-copy">
                <p className="sf-edit-logo-hint">Optional — we'll use your initial if you don't upload one. Square image, min 240x240px. Shown on your profile and listing card.</p>
                <div className="sf-edit-logo-btns">
                  <button type="button" className="sf-btn sf-btn-ghost" onClick={() => logoInputRef.current?.click()}>Upload logo</button>
                  {logoPreviewUrl && (
                    <button type="button" className="sf-edit-logo-remove" onClick={() => { setLogoId(undefined); setIsDirty(true); }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sf-edit-section sf-edit-panel sf-edit-completion-panel">
          <div className="sf-edit-2col">
            <div>
              <div>
                <p className="text-[10px] font-semibold text-[#333] tracking-[0.2px]">Profile completion / Penyelesaian profil</p>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-[32px] font-bold text-[#f14110] leading-none tracking-[0.64px]">{profileCompletionScore}</span>
                  <span className="pb-1 text-[14px] text-[#f14110]">%</span>
                  <span className="pb-1.5 text-[11px] font-medium text-[#333]">{profileCompletionStatus.label}</span>
                </div>
                <div className="mt-2 h-1.5 w-full max-w-[320px] overflow-hidden rounded-full bg-[#333]/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${profileCompletionScore}%`,
                      background: "linear-gradient(to right, #e9a28e, #f14110)",
                    }}
                  />
                </div>
                <p className="mt-2 max-w-[560px] text-[9px] leading-[14px] text-[#333]/50 tracking-[0.18px]">
                  {profileCompletionStatus.legend}
                </p>
              </div>
            </div>

            <div>
              <div>
                <ProfileAccordion
                  title="What appears on your public profile:"
                  open={openProfileExplainer === "english"}
                  onToggle={() => setOpenProfileExplainer(openProfileExplainer === "english" ? null : "english")}
                >
                  <ul className="space-y-2 text-[10px] leading-[18px] text-[#333]/70 tracking-[0.2px]">
                    <CompletionLine complete={profileCompletionItems.identity}>Company name, location, and a brief description of your work<RequiredStar /></CompletionLine>
                    <CompletionLine complete={profileCompletionItems.contact}>Phone or WhatsApp contact<RequiredStar /></CompletionLine>
                    <CompletionLine complete={profileCompletionItems.projectScope}>Project size and areas you operate in<RequiredStar /></CompletionLine>
                    <CompletionLine complete={profileCompletionItems.onlinePresence}>Website, Instagram, or other online presence</CompletionLine>
                    <CompletionLine complete={profileCompletionItems.profileDetails}>Year founded and team size</CompletionLine>
                    <CompletionLine complete={profileCompletionItems.projectMedia}>Project photos or videos</CompletionLine>
                  </ul>
                  <p className="mt-3 text-[9px] leading-[15px] text-[#333]/50 tracking-[0.18px]">
                    <RequiredStar /> Required fields. Only edited fields are shown on your public profile. The more complete your profile, the more visible it is in search. Also, SolidFind welcomes specialists, dig into the specifics of what you do best.
                  </p>
                </ProfileAccordion>

                <ProfileAccordion
                  title="Yang ditampilkan di profil publik Anda:"
                  open={openProfileExplainer === "indonesian"}
                  onToggle={() => setOpenProfileExplainer(openProfileExplainer === "indonesian" ? null : "indonesian")}
                >
                  <ul className="space-y-2 text-[10px] leading-[18px] text-[#333]/70 tracking-[0.2px]">
                    <CompletionLine complete={profileCompletionItems.identity}>Nama perusahaan, lokasi, dan deskripsi singkat pekerjaan Anda<RequiredStar /></CompletionLine>
                    <CompletionLine complete={profileCompletionItems.contact}>Nomor telepon atau WhatsApp<RequiredStar /></CompletionLine>
                    <CompletionLine complete={profileCompletionItems.projectScope}>Ukuran proyek dan area operasional<RequiredStar /></CompletionLine>
                    <CompletionLine complete={profileCompletionItems.onlinePresence}>Website, Instagram, atau kehadiran online lainnya</CompletionLine>
                    <CompletionLine complete={profileCompletionItems.profileDetails}>Tahun berdiri dan ukuran tim</CompletionLine>
                    <CompletionLine complete={profileCompletionItems.projectMedia}>Foto atau video proyek</CompletionLine>
                  </ul>
                  <p className="mt-3 text-[9px] leading-[15px] text-[#333]/50 tracking-[0.18px]">
                    <RequiredStar /> Bidang yang wajib diisi. Hanya bidang yang diedit yang ditampilkan di profil publik Anda. Semakin lengkap profil Anda, semakin terlihat dalam pencarian. Selain itu, SolidFind menyambut para spesialis, gali secara spesifik hal terbaik yang Anda lakukan.
                  </p>
                </ProfileAccordion>
              </div>
            </div>
          </div>
        </section>

        <section className="sf-edit-section" onChangeCapture={() => setIsDirty(true)}>
          <span className="sf-tag-mono">Basics</span>
          <div className="sf-edit-grid3 sf-edit-basics-grid">
            <label className="sf-field">
              <span>Company name <RequiredStar /></span>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={50} />
            </label>
            <label className="sf-field">
              <span>Role / discipline</span>
              <input type="text" value={roleDiscipline} onChange={(e) => setRoleDiscipline(e.target.value)} placeholder="Kontraktor" />
            </label>
            <label className="sf-field">
              <span>Primary category <RequiredStar /></span>
              <select value={primaryCategory} onChange={(e) => handlePrimaryCategoryChange(e.target.value as CompanyCategoryId)}>
                {visibleCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="sf-edit-2col sf-edit-details-grid">
            <div>
              <span className="sf-edit-sublabel sf-tag-mono">Contact channels</span>
              <div className="sf-edit-socials">
                <label className={`sf-social-field ${invalidEmail ? "is-invalid" : ""}`}>
                  <span className="sf-social-field-ico"><EmailGlyph /></span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
                  <span className="req sf-social-req">*</span>
                </label>
                <label className={`sf-social-field ${invalidPhone ? "is-invalid" : ""}`}>
                  <span className="sf-social-field-ico"><Phone size={18} /></span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone" />
                  <span className="req sf-social-req">*</span>
                </label>
                <label className={`sf-social-field ${invalidWhatsapp ? "is-invalid" : ""}`}>
                  <span className="sf-social-field-ico"><WhatsappGlyph /></span>
                  <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} aria-label="WhatsApp" />
                  <span className="req sf-social-req">*</span>
                </label>
                <label className={`sf-social-field ${invalidWebsite ? "is-invalid" : ""}`}>
                  <span className="sf-social-field-ico"><Globe size={18} /></span>
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="website URL" aria-label="Website" />
                </label>
                <label className={`sf-social-field ${invalidFacebook ? "is-invalid" : ""}`}>
                  <span className="sf-social-field-ico sf-social-letter">f</span>
                  <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/handle" aria-label="Facebook" />
                </label>
                <label className={`sf-social-field ${invalidInstagram ? "is-invalid" : ""}`}>
                  <span className="sf-social-field-ico"><Instagram size={18} /></span>
                  <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="instagram.com/handle" aria-label="Instagram" />
                </label>
                <label className={`sf-social-field ${invalidLinkedin ? "is-invalid" : ""}`}>
                  <span className="sf-social-field-ico"><LinkedinGlyph /></span>
                  <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="company name" aria-label="LinkedIn" />
                </label>
              </div>
            </div>

            <div>
              <span className="sf-edit-sublabel sf-tag-mono">Company details</span>
              <div className="sf-edit-details">
                <div className="sf-edit-grid2">
                  <label className="sf-field">
                    <span>Head-office region</span>
                    <select value={selectedLocations[0] ?? "bali"} onChange={(e) => setSelectedLocations([e.target.value])}>
                      {locationOptions.map((location) => (
                        <option key={location.id} value={location.id}>{location.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="sf-field">
                    <span>Address <RequiredStar /></span>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} aria-invalid={invalidAddress} />
                  </label>
                </div>
                <div className="sf-edit-grid3">
                  <label className="sf-field">
                    <span>Projects <RequiredStar /></span>
                    <input type="number" value={projectsNumber} onChange={(e) => setProjectsNumber(e.target.value)} min={0} />
                  </label>
                  <label className="sf-field">
                    <span>Team size <RequiredStar /></span>
                    <input type="number" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} min={0} />
                  </label>
                  <label className="sf-field">
                    <span>Founded</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={foundedYear}
                      onChange={(e) => setFoundedYear(normalizeCompanySinceYearInput(e.target.value))}
                      minLength={4}
                      maxLength={4}
                      aria-invalid={invalidFoundedYear}
                    />
                  </label>
                </div>
              </div>

              <span className="sf-edit-sublabel sf-tag-mono sf-budget-label">Typical project scale</span>
              <div className="sf-edit-budget">
                <div className="sf-range">
                  <div className="sf-range-vals">
                    <div><span className="sf-range-cap">Entry</span><b>{projectBudgetTiers[budgetMinIndex]?.label}</b></div>
                    <div className="r"><span className="sf-range-cap">Exit</span><b>{projectBudgetTiers[budgetMaxIndex]?.label}</b></div>
                  </div>
                  <div className="sf-range-track">
                    <div className="sf-range-rail" />
                    <div className="sf-range-fill" style={{ left: `${(budgetMinIndex / (projectBudgetTiers.length - 1)) * 100}%`, right: `${100 - (budgetMaxIndex / (projectBudgetTiers.length - 1)) * 100}%` }} />
                    <input type="range" min="0" max={projectBudgetTiers.length - 1} step="1" value={budgetMinIndex} onChange={(e) => updateBudgetMin(Number(e.target.value))} aria-label="Minimum budget" />
                    <input type="range" min="0" max={projectBudgetTiers.length - 1} step="1" value={budgetMaxIndex} onChange={(e) => updateBudgetMax(Number(e.target.value))} aria-label="Maximum budget" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sf-edit-section">
          <div className="sf-edit-2col sf-edit-desc">
            <div>
              <span className="sf-tag-mono">Description <RequiredStar /></span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={7} className="sf-edit-textarea" />
              <div className="sf-edit-hint">{description.length} characters · appears on your public profile</div>
            </div>
            <div>
              <span className="sf-tag-mono">Languages spoken</span>
              <div className="sf-langchips">
                {languageOptions.map((language) => {
                  const active = selectedLanguages.includes(language);
                  return (
                    <button type="button" key={language} className={`sf-langchip ${active ? "on" : ""}`} onClick={() => toggleLanguage(language)}>
                      {active && <span className="sf-langchip-tick">✓</span>}{language}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="sf-edit-section">
            <div className="sf-edit-panel">
              <div className="flex items-baseline justify-between gap-4">
                <span className="sf-tag-mono">Photos & videos</span>
                <span className="sf-tag-mono">{totalProjectImages} / {maxImages} used</span>
              </div>
              <div className="sf-edit-gallery">
                {Array(totalSlots).fill(null).map((_, index) => {
                  const imgUrl = projectImageUrls[index];
                  const storageIndex = index - projectImageUrls.length;
                  const imgId = storageIndex >= 0 ? projectImageIds[storageIndex] : undefined;
                  const hasImage = Boolean(imgUrl || imgId);
                  const isLocked = index >= maxImages;
                  const isNextEmpty = !hasImage && index === totalProjectImages && !isLocked;
                  const isUploading = uploadingSlot === index;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (isNextEmpty && uploadingSlot === null) projectInputRef.current?.click();
                      }}
                      className={`aspect-square rounded-[4px] overflow-hidden relative group ${isNextEmpty ? 'cursor-pointer border-2 border-dashed border-[#ccc] flex items-center justify-center bg-white hover:border-[#f14110] transition-colors' : ''} ${isLocked && !hasImage ? '' : ''}`}
                      style={!hasImage && !isNextEmpty ? {
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23e4e4e4'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e4e4e4'/%3E%3C/svg%3E")`,
                        backgroundSize: '10px 10px'
                      } : undefined}
                    >
                      {imgUrl && <ExternalImagePreview src={imgUrl} alt="Project" />}
                      {imgId && <ProjectImage storageId={imgId} />}
                      {hasImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProjectImage(index);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                      {isNextEmpty && !isUploading && (
                        <Upload className="w-4 h-4 text-[#ccc]" />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-[#f14110] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {isLocked && !hasImage && (
                        <div className="absolute inset-0 bg-[#f8f8f8]/80 flex flex-col items-center justify-center">
                          <Lock className="w-3 h-3 text-[#333]/30 mb-0.5" />
                          <span className="text-[7px] text-[#333]/40 font-medium">PRO</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
        </section>


        <section className="sf-edit-section sf-edit-panel sf-matrix">
          <div className="sf-matrix-head">
            <div>
              <span className="sf-tag-mono">Services & coverage <RequiredStar /></span>
              <p className="sf-edit-lead">Activate every category you work in and switch on the exact services you offer — at least one main category is required. These are the same filters visitors use to find you.</p>
            </div>
            <div className="sf-matrix-top">
              <article className="sf-mx-block sf-mx-block-static">
                <div className="sf-mx-blockhead">
                  <h4>Project size <RequiredStar /></h4>
                </div>
                {projectSizeOptions.map((size) => {
                  const anyActive = selectedProjectSizes.includes("any");
                  const isAny = size.id === "any";
                  return renderMatrixRow({
                    id: size.id,
                    label: size.label,
                    active: selectedProjectSizes.includes(size.id),
                    disabled: anyActive && !isAny,
                    master: isAny,
                    onClick: () => toggleProjectSizeMatrix(size.id),
                  });
                })}
              </article>

              <article className="sf-mx-block sf-mx-block-static">
                <div className="sf-mx-blockhead">
                  <h4>Location <RequiredStar /></h4>
                </div>
                {locationOptions.map((location) => {
                  const baliActive = selectedLocations.includes("bali");
                  const isBali = location.id === "bali";
                  return renderMatrixRow({
                    id: location.id,
                    label: location.label,
                    active: selectedLocations.includes(location.id),
                    disabled: baliActive && !isBali,
                    master: isBali,
                    onClick: () => toggleLocationMatrix(location.id),
                  });
                })}
              </article>
            </div>
          </div>

          <div className="sf-matrix-cats">
            {isCategoryVisible("construction") && renderCategoryMatrix({
              id: "construction",
              title: "Construction",
              enabled: constructionEnabled,
              setEnabled: setConstructionEnabled,
              selected: selectedConstruction,
              setSelected: setSelectedConstruction,
              options: constructionServiceOptions,
            })}
            {isCategoryVisible("renovation") && renderCategoryMatrix({
              id: "renovation",
              title: "Renovation",
              enabled: renovationEnabled,
              setEnabled: setRenovationEnabled,
              selected: selectedRenovation,
              setSelected: setSelectedRenovation,
              options: renovationServiceOptions,
            })}
            {isCategoryVisible("architecture") && renderCategoryMatrix({
              id: "architecture",
              title: "Architecture",
              enabled: architectureEnabled,
              setEnabled: setArchitectureEnabled,
              selected: selectedArchitecture,
              setSelected: setSelectedArchitecture,
              options: architectureServiceOptions,
            })}
            {isCategoryVisible("interior") && renderCategoryMatrix({
              id: "interior",
              title: "Interior",
              enabled: interiorEnabled,
              setEnabled: setInteriorEnabled,
              selected: selectedInterior,
              setSelected: setSelectedInterior,
              options: interiorServiceOptions,
            })}
            {isCategoryVisible("real-estate") && renderCategoryMatrix({
              id: "real-estate",
              title: "Real Estate",
              enabled: realEstateEnabled,
              setEnabled: setRealEstateEnabled,
              selected: selectedRealEstate,
              setSelected: setSelectedRealEstate,
              options: realEstateServiceOptions,
            })}
          </div>
        </section>

        {/* Bottom Save */}
        <div className="sf-edit-foot">
          <div>
            <p className={`sf-edit-missing whitespace-pre-line ${bottomHintIsWarning ? '' : 'text-[#333]/50'}`}>
              {bottomHintText}
            </p>
          </div>
          <div className="sf-edit-foot-save">
            {saveError && (
              <p className="text-[10px] text-[#F14110] font-medium tracking-[0.2px] text-right">{saveError}</p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              className="sf-btn sf-btn-lg sf-btn-pri"
            >
              {saving ? "Saving..." : "Save changes →"}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {shouldPromptSetupAccount && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#333]/85 px-4">
          <div className="relative w-full max-w-[440px] rounded-[6px] bg-[#f8f8f8] px-6 py-7 sm:px-8">
            <h2 className="text-center text-[18px] font-semibold tracking-[0.36px] text-[#333]">
              Setup your Account
            </h2>
            <p className="mt-2 text-center text-[9px] leading-[14px] text-[#999]">
              {setupStage === "verify" ? (
                <>
                  Enter the verification code sent to your email before accessing your company profile.
                  <br />
                  Masukkan kode verifikasi yang dikirim ke email Anda sebelum mengakses profil perusahaan Anda.
                </>
              ) : setupStage === "emailChoice" ? (
                <>
                  Choose the login email for your company account before continuing.
                  <br />
                  Pilih email login untuk akun perusahaan Anda sebelum melanjutkan.
                </>
              ) : (
                <>
                  Register your password before accessing your company profile.
                  <br />
                  Daftarkan kata sandi Anda sebelum mengakses profil perusahaan Anda.
                </>
              )}
            </p>

            {setupStage === "method" && (
              <>
                <div className="mt-5 flex flex-col gap-2">
                  <SetupSocialButton
                    label="Continue with Google"
                    icon={<GoogleIcon />}
                    onClick={() => handleSetupSocialAuth("oauth_google")}
                    disabled={Boolean(setupSocialLoading)}
                  />
                </div>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#E4E4E4]" />
                  <span className="text-[10px] font-medium tracking-[0.5px] text-[#999]">OR</span>
                  <div className="h-px flex-1 bg-[#E4E4E4]" />
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSetupSelectedSocial(null);
                      setSetupLoginEmail(storedCompanyEmail);
                      setSetupStage("emailChoice");
                      setSetupAccountError("");
                    }}
                    className="flex min-h-10 w-full items-center justify-center rounded-full border border-[#333] px-4 py-2 text-center text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110]"
                  >
                    Continue with Email
                  </button>
                </div>

                {setupAccountError && (
                  <p className="mt-3 text-center text-[11px] font-medium text-[#F14110]">
                    *{setupAccountError}
                  </p>
                )}
              </>
            )}

            {setupStage === "emailChoice" && (
              <div className="mt-5">
                <SetupBackButton
                  onClick={() => {
                    setSetupStage("method");
                    setSetupAccountError("");
                  }}
                />
                <p className="text-center text-[11px] font-medium tracking-[0.22px] text-[#333]">
                  {setupSelectedSocial ? getSocialProviderLabel(setupSelectedSocial) : "Email"}
                </p>
                <div className="mt-2 mb-4 flex justify-center text-[#333]">
                  {getSocialProviderIcon(setupSelectedSocial)}
                </div>
                <div className="mb-4">
                  <label className="mb-[5px] block text-[11px] font-medium tracking-[0.22px] text-[#333]">
                    Email <span className="text-[#f14110]">(*)</span>
                  </label>
                  <input
                    type="email"
                    value={setupLoginEmail}
                    onChange={(event) => setSetupLoginEmail(event.target.value)}
                    className="h-[38px] w-full rounded-[6px] border border-[#E4E4E4] bg-white px-[10px] text-[12px] text-[#333] outline-none"
                    autoComplete="email"
                    required
                  />
                  {isDifferentSocialEmail ? (
                    <p className="mt-2 text-[9px] leading-[14px] font-medium text-[#f14110]">
                      Using a different email than {storedCompanyEmail} will set this new email as your login for your company.
                      <br />
                      Menggunakan email yang berbeda dari {storedCompanyEmail} akan menetapkan email baru ini sebagai login Anda untuk perusahaan Anda.
                    </p>
                  ) : (
                    <p className="mt-2 text-[9px] leading-[14px] text-[#333]/60">
                      {setupSelectedSocial
                        ? `Use the email you want to keep as the login for this company before continuing with ${getSocialProviderLabel(setupSelectedSocial)}.`
                        : "Use the email you want to keep as the login for this company before continuing."}
                    </p>
                  )}
                </div>

                {setupAccountError && (
                  <p className="mb-3 text-center text-[11px] font-medium text-[#F14110]">
                    *{setupAccountError}
                  </p>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleSetupEmailChoice}
                    className="flex h-10 w-[140px] items-center justify-center rounded-full border border-[#333] text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {setupStage === "password" && (
              <form onSubmit={handleSetupAccount} className="mt-5">
                <SetupBackButton
                  onClick={() => {
                    setSetupStage("verify");
                    setSetupAccountError("");
                  }}
                />
                <p className="mb-4 text-center text-[11px] font-medium tracking-[0.22px] text-[#333]">
                  {setupDisplayEmail}
                </p>
                <div className="mb-3">
                  <label className="mb-[5px] block text-[11px] font-medium tracking-[0.22px] text-[#333]">
                    Password <span className="text-[#f14110]">(*)</span>
                  </label>
                  <input
                    type="password"
                    value={setupPassword}
                    onChange={(event) => setSetupPassword(event.target.value)}
                    className="h-[38px] w-full rounded-[6px] border border-[#E4E4E4] bg-white px-[10px] text-[12px] text-[#333] outline-none"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-[5px] block text-[11px] font-medium tracking-[0.22px] text-[#333]">
                    Confirm Password <span className="text-[#f14110]">(*)</span>
                  </label>
                  <input
                    type="password"
                    value={setupPasswordConfirm}
                    onChange={(event) => setSetupPasswordConfirm(event.target.value)}
                    className="h-[38px] w-full rounded-[6px] border border-[#E4E4E4] bg-white px-[10px] text-[12px] text-[#333] outline-none"
                    autoComplete="new-password"
                    required
                  />
                </div>

                {setupAccountError && (
                  <p className="mb-3 text-center text-[11px] font-medium text-[#F14110]">
                    *{setupAccountError}
                  </p>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={setupAccountSaving}
                    className="flex h-10 w-[140px] items-center justify-center rounded-full border border-[#333] text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {setupAccountSaving ? "Sending..." : "Register"}
                  </button>
                </div>
              </form>
            )}

            {setupStage === "socialFinish" && (
              <div className="mt-5">
                <SetupBackButton
                  onClick={() => {
                    setSetupStage("verify");
                    setSetupAccountError("");
                  }}
                />
                <p className="text-center text-[11px] font-medium tracking-[0.22px] text-[#333]">
                  {getSocialProviderLabel(setupSelectedSocial)}
                </p>
                <div className="mt-2 mb-4 flex justify-center text-[#333]">
                  {getSocialProviderIcon(setupSelectedSocial)}
                </div>
                <p className="mb-4 text-center text-[11px] font-medium tracking-[0.22px] text-[#333]">
                  {setupDisplayEmail}
                </p>
                {setupAccountError && (
                  <p className="mb-3 text-center text-[11px] font-medium text-[#F14110]">
                    *{setupAccountError}
                  </p>
                )}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!clerkUser || !setupSelectedSocial) return;
                      setSetupSocialLoading(setupSelectedSocial);
                      setSetupAccountError("");
                      try {
                        const nextParams = new URLSearchParams(searchParams.toString());
                        nextParams.delete("setupAccount");
                        const nextQuery = nextParams.toString();
                        const redirectTarget = nextQuery ? `/company-dashboard/edit?${nextQuery}` : "/company-dashboard/edit";
                        const externalAccount = await createExternalAccount({
                          strategy: setupSelectedSocial,
                          redirectUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectTarget)}`,
                          oidcLoginHint: setupLoginEmail || undefined,
                        });

                        if (externalAccount?.verification?.externalVerificationRedirectURL?.href) {
                          router.push(externalAccount.verification.externalVerificationRedirectURL.href);
                          return;
                        }

                        throw new Error("Unable to continue with this social account right now.");
                      } catch (error) {
                        const message = error instanceof Error ? error.message : "Unable to continue with this social account right now.";
                        setSetupAccountError(message);
                        setSetupSocialLoading(null);
                      }
                    }}
                    disabled={Boolean(setupSocialLoading)}
                    className="flex h-10 w-[140px] items-center justify-center rounded-full border border-[#333] text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {setupSocialLoading ? "Continuing..." : `Finish with ${getSocialProviderLabel(setupSelectedSocial)}`}
                  </button>
                </div>
              </div>
            )}

            {setupStage === "verify" && (
              <div className="mt-5">
                <SetupBackButton
                  onClick={() => {
                    setSetupStage("emailChoice");
                    setSetupAccountError("");
                    setSetupVerificationCode("");
                    setSetupVerificationSubmitting(false);
                  }}
                />
                <p className="mb-4 text-center text-[11px] font-medium tracking-[0.22px] text-[#333]">
                  {setupDisplayEmail}
                </p>
                <div className="mb-4">
                  <label className="mb-[5px] block text-[11px] font-medium tracking-[0.22px] text-[#333]">
                    Email Code <span className="text-[#f14110]">(*)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={setupVerificationCode}
                    onChange={(event) => setSetupVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-[38px] w-full rounded-[6px] border border-[#E4E4E4] bg-white px-[10px] text-center text-[12px] tracking-[4px] text-[#333] outline-none"
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="mt-2 text-[9px] leading-[14px] text-[#333]/60">
                    {setupVerificationRequestSubmitted
                      ? "A verification code has been sent to your email."
                      : "Enter the verification code sent to your email before registering your password."}
                  </p>
                </div>

                {setupAccountError && (
                  <p className="mb-3 text-center text-[11px] font-medium text-[#F14110]">
                    *{setupAccountError}
                  </p>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleSetupVerification}
                    disabled={setupAccountSaving || setupVerificationSubmitting || !hasCompleteVerificationCode}
                    className="flex h-10 w-[140px] items-center justify-center rounded-full border border-[#333] text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {setupVerificationSubmitting
                      ? "Verifying..."
                      : setupAccountSaving
                        ? "Registering..."
                        : "Verify Email"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white w-full max-w-[440px] rounded-[6px] p-8 text-center">
            <h3 className="text-[20px] font-bold text-[#333] mb-4">Delete Profile</h3>
            <p className="text-[12px] text-[#333]/70 mb-6">
              Are you sure you want to delete your profile? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="h-10 px-6 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="h-10 px-6 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingNavigationHref && (
        <div className="sf-modal-scrim open" onClick={cancelPendingNavigation}>
          <div className="sf-modal sf-modal-confirm sf-modal-unsaved" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="sf-modal-x" onClick={cancelPendingNavigation} aria-label="Close">×</button>
            <div className="sf-modal-head">
              <span className="sf-tag-mono">Unsaved changes</span>
              <h2>Leave this page?</h2>
              <p>You have unsaved changes on this profile. Leave without saving?</p>
            </div>
            <div className="sf-modal-actions">
              <button type="button" onClick={cancelPendingNavigation} className="sf-btn sf-btn-lg sf-btn-ghost">Stay</button>
              <button type="button" onClick={confirmPendingNavigation} className="sf-btn sf-btn-lg sf-btn-pri">Leave →</button>
            </div>
          </div>
        </div>
      )}

      {/* PRO Features Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProModal(false)} />
          <div className="relative bg-white w-full max-w-[500px] rounded-[6px] p-8">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-[#333]/50 hover:text-[#333]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <h3 className="text-[18px] font-bold text-[#333] mb-4">PRO Account Features</h3>
            <p className="text-[11px] text-[#333]/70 mb-6">
              Services included with PRO account / Layanan dengan akun PRO
            </p>

            <div className="space-y-4">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[#f8f8f8] rounded-[6px]">
                  <div className="w-6 h-6 flex items-center justify-center text-[#f14110]">
                    {feature.icon === "star" && <Star className="w-5 h-5" />}
                    {feature.icon === "ai" && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z"/>
                      </svg>
                    )}
                    {feature.icon === "stats" && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="8" width="3" height="7"/>
                        <rect x="6" y="4" width="3" height="11"/>
                        <rect x="11" y="1" width="3" height="14"/>
                      </svg>
                    )}
                    {feature.icon === "photos" && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="3" width="14" height="10" rx="1"/>
                      </svg>
                    )}
                    {feature.icon === "ad" && (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="1" y="1" width="14" height="14" rx="1"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#333]">{feature.title}</p>
                    <p className="text-[10px] text-[#333]/50">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowProModal(false)}
              className="mt-6 w-full h-10 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#e03000] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
