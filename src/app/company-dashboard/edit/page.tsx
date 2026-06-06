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
import { Star, X, Upload, Lock, Check, ChevronDown } from "lucide-react";
import { uploadFile as uploadFileToStorage } from "@/lib/uploadFile";
import { useProEnabled } from "@/hooks/useProEnabled";
import { calculateProfileCompletionScore, getProfileCompletionStatus } from "@/lib/profile-completion.mjs";

type SetupOAuthStrategy = Extract<OAuthStrategy, "oauth_google">;
type ServiceOption = { id: string; label: string };
const completeHouseChildren = ["living", "kitchen", "bathroom", "bedroom", "electricity", "plumbing"];
const categoryPriority = ["construction", "renovation", "architecture", "interior", "real-estate"] as const;

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-gradient-to-r from-[#e9a28e] to-[#f14110]' : 'bg-[#d1d1d1]'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

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
  const isCategoryVisible = (catId: string) => pageConfigs?.some(p => p.categoryId === catId) ?? false;
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

  // Toggles
  const [selectedProjectSizes, setSelectedProjectSizes] = useState<string[]>([]);
  const [projectSizeEnabled, setProjectSizeEnabled] = useState(true);
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
  const [locationEnabled, setLocationEnabled] = useState(true);

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
  const hasCategory = (constructionEnabled && selectedConstruction.length > 0)
    || (renovationEnabled && selectedRenovation.length > 0)
    || (architectureEnabled && selectedArchitecture.length > 0)
    || (interiorEnabled && selectedInterior.length > 0)
    || (realEstateEnabled && selectedRealEstate.length > 0);
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
    constructionEnabled && selectedConstruction.length > 0 ? "construction" : null,
    renovationEnabled && selectedRenovation.length > 0 ? "renovation" : null,
    architectureEnabled && selectedArchitecture.length > 0 ? "architecture" : null,
    interiorEnabled && selectedInterior.length > 0 ? "interior" : null,
    realEstateEnabled && selectedRealEstate.length > 0 ? "real-estate" : null,
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
      setIsDirty(false);
    }
  }, [company]);

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

  const toggleService = (list: string[], setList: (val: string[]) => void, id: string) => {
    setIsDirty(true);
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
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
      const savedConstruction = constructionEnabled ? normalizeAllSelection(selectedConstruction, constructionServiceOptions) : [];
      const savedRenovation = renovationEnabled ? normalizeAllSelection(selectedRenovation, renovationServiceOptions) : [];
      const savedArchitecture = architectureEnabled ? normalizeAllSelection(selectedArchitecture, architectureServiceOptions) : [];
      const savedInterior = interiorEnabled ? normalizeAllSelection(selectedInterior, interiorServiceOptions) : [];
      const savedRealEstate = realEstateEnabled ? normalizeAllSelection(selectedRealEstate, realEstateServiceOptions) : [];
      const primaryCategory = getPrimaryActiveCategory({
        construction: savedConstruction,
        renovation: savedRenovation,
        architecture: savedArchitecture,
        interior: savedInterior,
        "real-estate": savedRealEstate,
      });
      if (company) {
        await updateCompany({
          id: company._id,
          name: companyName || undefined,
          category: primaryCategory,
          description: description || undefined,
          location: selectedLocations.join(",") || undefined,
          address: normalizedAddress || undefined,
          projects: projectsNumber ? parseInt(projectsNumber) : undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          whatsapp: whatsapp || undefined,
          facebook: facebook || undefined,
          linkedin: linkedin || undefined,
          instagram: instagram || undefined,
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
          description: description || undefined,
          category: primaryCategory,
          location: selectedLocations[0] || "bali",
          address: normalizedAddress || undefined,
          isPro: false,
          projects: projectsNumber ? parseInt(projectsNumber) : undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          whatsapp: whatsapp || undefined,
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

        {/* Action Buttons */}
        <div className="sf-edit-section sf-edit-inline-actions space-y-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowDeleteModal(true)} className="sf-edit-delete" type="button">
              Delete profile
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              className="sf-btn sf-btn-lg sf-btn-pri ml-auto"
            >
              {saving ? "Saving..." : "Save changes →"}
            </button>
          </div>
          {!canSave && (
            <div className="ml-auto w-full text-right">
              <p className="text-[9px] text-[#f14110] font-medium tracking-[0.18px] whitespace-pre-line text-right">
                {bottomHintText}
              </p>
            </div>
          )}
          {saveError && canSave && (
            <p className="text-[10px] text-[#F14110] font-medium tracking-[0.2px] text-right">
              {saveError}
            </p>
          )}
        </div>

        {/* Form Grid */}
        <section className="sf-edit-section sf-edit-2col" onChangeCapture={() => setIsDirty(true)}>
          {/* Left Column */}
          <div className="space-y-4">
            {/* Logo Upload */}
            <div className="sf-edit-panel sf-edit-logo-panel">
              <span className="sf-tag-mono">Company logo</span>
              <div className="sf-edit-logo-row mt-4">
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
                  </div>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="sf-edit-panel">
              <span className="sf-tag-mono">Basics</span>
              <div className="mt-4 space-y-4">
            <div className="sf-edit-field">
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Company Name / Nama Perusahaan <span className="text-[#f14110]">(*)</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="(50 Letters max / Maksimal 50 huruf)"
                maxLength={50}
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
              />
            </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Address / Alamat <span className="text-[#f14110]">(*)</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Jl. Raya Seminyak No.17, Badung, Bali"
                aria-invalid={invalidAddress}
                className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidAddress ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
              />
              {invalidAddress && (
                <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">
                  {COMPANY_ADDRESS_VALIDATION_MESSAGE}
                </p>
              )}
            </div>

            {/* Phone & Email */}
            <div className="sf-edit-grid2">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Phone / Telepon <span className="text-[#f14110]">(*)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812 0000 0000"
                  aria-invalid={invalidPhone}
                  className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidPhone ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
                />
                {invalidPhone && <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">Use a regular phone number, with or without country code.</p>}
              </div>
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  E-mail <span className="text-[#f14110]">(*)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={invalidEmail}
                  className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidEmail ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
                />
                {invalidEmail && <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">Use a regular email address.</p>}
              </div>
            </div>

            {/* Website & WhatsApp */}
            <div className="sf-edit-grid2">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  aria-invalid={invalidWebsite}
                  className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidWebsite ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
                />
                {invalidWebsite && <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">Use a regular website URL.</p>}
              </div>
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Whatsapp <span className="text-[#f14110]">(*)</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="6281200000000"
                  aria-invalid={invalidWhatsapp}
                  className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidWhatsapp ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
                />
                {invalidWhatsapp && <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">Use country code without +, followed by the phone number.</p>}
              </div>
            </div>

            {/* Facebook & LinkedIn */}
            <div className="sf-edit-grid2">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  aria-invalid={invalidFacebook}
                  className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidFacebook ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
                />
                {invalidFacebook && <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">Use a regular Facebook URL or handle.</p>}
              </div>
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  aria-invalid={invalidLinkedin}
                  className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidLinkedin ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
                />
                {invalidLinkedin && <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">Use a regular LinkedIn URL or handle.</p>}
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username or https://instagram.com/username"
                aria-invalid={invalidInstagram}
                className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors ${invalidInstagram ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
              />
              {invalidInstagram && <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">Use a regular Instagram URL or handle.</p>}
            </div>
              </div>

          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Description */}
            <div className="sf-edit-panel">
              <span className="sf-tag-mono">Description</span>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Company introduction as well as description of your project range / Pengenalan perusahaan serta deskripsi jangkauan proyek Anda <span className="text-[#f14110]">(*)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="sf-edit-textarea"
              />
              <div className="sf-edit-hint">{description.length} characters · appears on your public profile</div>
            </div>

            {/* Projects & Team */}
            <div className="sf-edit-panel">
              <span className="sf-tag-mono">Company details</span>
            <div className="sf-edit-grid3 mt-4">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Project number / Nomor proyek <span className="text-[#f14110]">(*)</span>
                </label>
                <input
                  type="number"
                  value={projectsNumber}
                  onChange={(e) => setProjectsNumber(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Team size / Ukuran tim <span className="text-[#f14110]">(*)</span>
                </label>
                <input
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Founded year / Tahun berdiri
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                value={foundedYear}
                onChange={(e) => {
                  setFoundedYear(normalizeCompanySinceYearInput(e.target.value));
                  setIsDirty(true);
                }}
                placeholder="e.g. 2015"
                minLength={4}
                maxLength={4}
                aria-invalid={invalidFoundedYear}
                className={`w-full h-10 px-3 bg-white border rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors ${invalidFoundedYear ? 'border-[#f14110]' : 'border-[#e4e4e4]'}`}
              />
              {invalidFoundedYear && (
                <p className="mt-1 text-[9px] leading-[13px] text-[#f14110]">
                  Enter 4 digits from {MIN_COMPANY_SINCE_YEAR} to {maxCompanySinceYear}.
                </p>
              )}
            </div>
            </div>
            </div>

            {/* Project Pictures Upload */}
            <div className="sf-edit-panel">
              <div className="flex items-baseline justify-between gap-4">
                <span className="sf-tag-mono">Photos & videos</span>
                <span className="sf-tag-mono">{totalProjectImages} / {maxImages} used</span>
              </div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                {company?.isPro && proEnabled ? (
                  <>Upload project pictures or videos<br />Unggah gambar proyek atau Video</>
                ) : (
                  <>Upload project pictures /<br />Unggah gambar proyek <span className="text-[#f14110]">(*)</span></>
                )}
              </label>
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
              {!company?.isPro && proEnabled && (
                <p className="text-[8px] text-[#333]/50 mt-2 tracking-[0.16px]">
                  *4 pictures for Free account / 12 pictures or video with PRO
                  <br />
                  *4 gambar untuk akun gratis / 12 gambar atau video dengan akun PRO
                </p>
              )}
            </div>
          </div>
        </section>


        <section className="sf-edit-section sf-edit-panel">
          <span className="sf-tag-mono">Services & coverage</span>
          <p className="sf-edit-lead">Activate every category you work in and switch on the exact services you offer. These are the same filters visitors use to find you.</p>

        {/* Project Size & Location - Top Row */}
        <div className="sf-edit-grid2 mb-8">
          {/* Project Size */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[18px] font-bold text-[#333] tracking-[0.4px]">Project Size <span className="text-[#f14110]">(*)</span></h2>
            </div>
              <div className="space-y-1">
                {projectSizeOptions.map((size) => {
                  const anyActive = selectedProjectSizes.includes("any");
                  const isAny = size.id === "any";
                  const isDisabled = anyActive && !isAny;
                  return (
                    <div key={size.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${selectedProjectSizes.includes(size.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {size.label}
                      </span>
                      <Toggle
                        checked={selectedProjectSizes.includes(size.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAny) {
                            if (selectedProjectSizes.includes("any")) {
                              setSelectedProjectSizes(selectedProjectSizes.filter(s => s !== "any"));
                            } else {
                              setSelectedProjectSizes(["any"]);
                            }
                          } else {
                            const next = selectedProjectSizes.includes(size.id)
                              ? selectedProjectSizes.filter(s => s !== size.id)
                              : [...selectedProjectSizes.filter(s => s !== "any"), size.id];
                            const hasAllConcreteSizes = concreteProjectSizeIds.every((id) => next.includes(id));
                            setSelectedProjectSizes(hasAllConcreteSizes ? ["any"] : next);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
          </div>

          {/* Location (single global) */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[18px] font-bold text-[#333] tracking-[0.4px]">Location <span className="text-[#f14110]">(*)</span></h2>
            </div>
              <div className="space-y-1">
                {locationOptions.map((loc) => {
                  const baliActive = selectedLocations.includes("bali");
                  const isBali = loc.id === "bali";
                  const isDisabled = baliActive && !isBali;
                  return (
                    <div key={loc.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${selectedLocations.includes(loc.id) ? 'text-[#f14110] font-medium' : 'text-[#333]/50'}`}>
                        {loc.label}
                      </span>
                      <Toggle
                        checked={selectedLocations.includes(loc.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isBali) {
                            if (selectedLocations.includes("bali")) {
                              setSelectedLocations(selectedLocations.filter(s => s !== "bali"));
                            } else {
                              setSelectedLocations(["bali"]);
                            }
                          } else {
                            let next = selectedLocations.includes(loc.id)
                              ? selectedLocations.filter(s => s !== loc.id)
                              : [...selectedLocations.filter(s => s !== "bali"), loc.id];
                            const allIndividual = locationOptions.filter(s => s.id !== "bali").map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = ["bali"];
                            }
                            setSelectedLocations(next);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
          </div>
        </div>

        {/* Construction / Renovation / Architecture / Interior - 4 Categories */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Construction */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#333] tracking-[0.4px]">Construction</h2>
              <Toggle
                checked={constructionEnabled}
                onChange={(val) => {
                  setConstructionEnabled(val);
                  if (!val) setSelectedConstruction([]);
                }}
              />
            </div>
            {constructionEnabled && (
              <div>
                <div className="mb-2">
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px]">
                    Services Provided /
                    <br />
                    Layanan yang Disediakan
                  </p>
                </div>
                {constructionServiceOptions.map((service) => {
                  const allId = getAllOptionId(constructionServiceOptions);
                  const normalizedSelected = normalizeAllSelection(selectedConstruction, constructionServiceOptions);
                  const allActive = !!allId && normalizedSelected.includes(allId);
                  const isAll = service.id === allId;
                  const isDisabled = allActive && !isAll;
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${normalizedSelected.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={normalizedSelected.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAll && allId) {
                            if (normalizedSelected.includes(allId)) {
                              setSelectedConstruction(normalizedSelected.filter(s => s !== allId));
                            } else {
                              setSelectedConstruction([allId]);
                            }
                          } else {
                            let next = normalizedSelected.includes(service.id)
                              ? normalizedSelected.filter(s => s !== service.id)
                              : [...normalizedSelected.filter(s => s !== allId), service.id];
                            const allIndividual = constructionServiceOptions.filter(s => s.id !== allId).map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = allId ? [allId] : next;
                            }
                            setSelectedConstruction(next);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Renovation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#333] tracking-[0.4px]">Renovation</h2>
              <Toggle
                checked={renovationEnabled}
                onChange={(val) => {
                  setRenovationEnabled(val);
                  if (!val) setSelectedRenovation([]);
                }}
              />
            </div>
            {renovationEnabled && (
              <div>
                <div className="mb-2">
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px]">
                    Services Provided /
                    <br />
                    Layanan yang Disediakan
                  </p>
                </div>
                {renovationServiceOptions.map((service) => {
                  const allId = getAllOptionId(renovationServiceOptions);
                  const normalizedSelected = normalizeAllSelection(selectedRenovation, renovationServiceOptions);
                  const allActive = !!allId && normalizedSelected.includes(allId);
                  const completeActive = normalizedSelected.includes("complete");
                  const isCompleteChild = completeHouseChildren.includes(service.id);
                  const isAll = service.id === allId;
                  const isDisabled = (allActive && !isAll) || (completeActive && isCompleteChild);
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${normalizedSelected.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={normalizedSelected.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAll && allId) {
                            if (normalizedSelected.includes(allId)) {
                              setSelectedRenovation(normalizedSelected.filter(s => s !== allId));
                            } else {
                              setSelectedRenovation([allId]);
                            }
                          } else if (service.id === "complete") {
                            setSelectedRenovation(normalizedSelected.includes("complete") ? [] : ["complete"]);
                          } else {
                            let next = normalizedSelected.includes(service.id)
                              ? normalizedSelected.filter(s => s !== service.id)
                              : [...normalizedSelected.filter(s => s !== allId), service.id];
                            const allIndividual = renovationServiceOptions.filter(s => s.id !== allId).map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = allId ? [allId] : next;
                            }
                            setSelectedRenovation(next);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Architecture */}
          {isCategoryVisible("architecture") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#333] tracking-[0.4px]">Architecture</h2>
              <Toggle
                checked={architectureEnabled}
                onChange={(val) => {
                  setArchitectureEnabled(val);
                  if (!val) setSelectedArchitecture([]);
                }}
              />
            </div>
            {architectureEnabled && (
              <div>
                <div className="mb-2">
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px]">
                    Services Provided /
                    <br />
                    Layanan yang Disediakan
                  </p>
                </div>
                {architectureServiceOptions.map((service) => {
                  const allId = getAllOptionId(architectureServiceOptions);
                  const normalizedSelected = normalizeAllSelection(selectedArchitecture, architectureServiceOptions);
                  const allActive = !!allId && normalizedSelected.includes(allId);
                  const isAll = service.id === allId;
                  const isDisabled = allActive && !isAll;
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${normalizedSelected.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={normalizedSelected.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAll && allId) {
                            if (normalizedSelected.includes(allId)) {
                              setSelectedArchitecture(normalizedSelected.filter(s => s !== allId));
                            } else {
                              setSelectedArchitecture([allId]);
                            }
                          } else {
                            let next = normalizedSelected.includes(service.id)
                              ? normalizedSelected.filter(s => s !== service.id)
                              : [...normalizedSelected.filter(s => s !== allId), service.id];
                            const allIndividual = architectureServiceOptions.filter(s => s.id !== allId).map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = allId ? [allId] : next;
                            }
                            setSelectedArchitecture(next);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* Interior Design */}
          {isCategoryVisible("interior") && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#333] tracking-[0.4px]">Interior</h2>
              <Toggle
                checked={interiorEnabled}
                onChange={(val) => {
                  setInteriorEnabled(val);
                  if (!val) setSelectedInterior([]);
                }}
              />
            </div>
            {interiorEnabled && (
              <div>
                <div className="mb-2">
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px]">
                    Services Provided /
                    <br />
                    Layanan yang Disediakan
                  </p>
                </div>
                {interiorServiceOptions.map((service) => {
                  const allId = getAllOptionId(interiorServiceOptions);
                  const normalizedSelected = normalizeAllSelection(selectedInterior, interiorServiceOptions);
                  const allActive = !!allId && normalizedSelected.includes(allId);
                  const isAll = service.id === allId;
                  const isDisabled = allActive && !isAll;
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${normalizedSelected.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={normalizedSelected.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAll && allId) {
                            if (normalizedSelected.includes(allId)) {
                              setSelectedInterior(normalizedSelected.filter(s => s !== allId));
                            } else {
                              setSelectedInterior([allId]);
                            }
                          } else {
                            let next = normalizedSelected.includes(service.id)
                              ? normalizedSelected.filter(s => s !== service.id)
                              : [...normalizedSelected.filter(s => s !== allId), service.id];
                            const allIndividual = interiorServiceOptions.filter(s => s.id !== allId).map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = allId ? [allId] : next;
                            }
                            setSelectedInterior(next);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </div>

        {/* Real Estate - Bottom Row */}
        {isCategoryVisible("real-estate") && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-[#333] tracking-[0.4px]">Real Estate</h2>
            <Toggle
              checked={realEstateEnabled}
              onChange={(val) => {
                setRealEstateEnabled(val);
                if (!val) setSelectedRealEstate([]);
              }}
            />
          </div>
          {realEstateEnabled && (
            <div>
              <div className="mb-2">
                <p className="text-[9px] text-[#333]/50 tracking-[0.18px]">
                  Services Provided /
                  <br />
                  Layanan yang Disediakan
                </p>
              </div>
              {realEstateServiceOptions.map((service) => {
                const allId = getAllOptionId(realEstateServiceOptions);
                const normalizedSelected = normalizeAllSelection(selectedRealEstate, realEstateServiceOptions);
                const allActive = !!allId && normalizedSelected.includes(allId);
                const isAll = service.id === allId;
                const isDisabled = allActive && !isAll;
                return (
                  <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className={`text-[10px] tracking-[0.2px] ${normalizedSelected.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                      {service.label}
                    </span>
                    <Toggle
                      checked={normalizedSelected.includes(service.id)}
                      onChange={() => {
                        setIsDirty(true);
                        if (isAll && allId) {
                          if (normalizedSelected.includes(allId)) {
                            setSelectedRealEstate(normalizedSelected.filter(s => s !== allId));
                          } else {
                            setSelectedRealEstate([allId]);
                          }
                        } else {
                          let next = normalizedSelected.includes(service.id)
                            ? normalizedSelected.filter(s => s !== service.id)
                            : [...normalizedSelected.filter(s => s !== allId), service.id];
                          const allIndividual = realEstateServiceOptions.filter(s => s.id !== allId).map(s => s.id);
                          if (allIndividual.every(id => next.includes(id))) {
                            next = allId ? [allId] : next;
                          }
                          setSelectedRealEstate(next);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={cancelPendingNavigation} />
          <div className="relative w-full max-w-[360px] rounded-[6px] bg-white p-6 text-center shadow-lg">
            <h3 className="mb-3 text-[18px] font-bold tracking-[0.36px] text-[#333]">Unsaved changes</h3>
            <p className="mb-6 text-[12px] leading-[19px] tracking-[0.24px] text-[#333]/60">
              You have unsaved changes on this profile. Leave without saving?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={cancelPendingNavigation}
                className="flex h-10 min-w-[130px] items-center justify-center rounded-full border border-[#333] px-6 text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110]"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={confirmPendingNavigation}
                className="flex h-10 min-w-[130px] items-center justify-center rounded-full bg-[#f14110] px-6 text-[11px] font-medium tracking-[0.22px] text-white transition-colors hover:bg-[#d93a0e]"
              >
                Leave
              </button>
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
