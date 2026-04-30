"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useClerk, useSession } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import type { OAuthStrategy } from "@clerk/types";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MagicLinkLoadingPage } from "@/components/MagicLinkLoadingPage";
import { buildCompanyProfilePath } from "@/lib/company-profile-url.mjs";
import { Star, X, Upload, Lock } from "lucide-react";
import { uploadFile as uploadFileToStorage } from "@/lib/uploadFile";
import { useProEnabled } from "@/hooks/useProEnabled";

const projectSizeOptions = [
  { id: "any", label: "ANY SIZE" },
  { id: "solo", label: "SOLO/COUPLE (1-2)" },
  { id: "family", label: "FAMILY/CO-HOSTING (3-6)" },
  { id: "shared", label: "SHARED/COMMUNITY (7+)" },
];

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

const proFeatures = [
  { icon: "star", title: "Top search ranking", subtitle: "Peringkat pencarian teratas" },
  { icon: "ai", title: "AI search optimisation", subtitle: "Optimasi pencarian AI" },
  { icon: "stats", title: "Statistics", subtitle: "Statistik" },
  { icon: "photos", title: "12 project pictures", subtitle: "12 gambar proyek" },
  { icon: "ad", title: "Possibility to buy ad space", subtitle: "Boleh untuk membeli iklan" },
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

function ExternalProjectImage({ src }: { src: string }) {
  return <Image src={src} alt="Project" fill className="object-cover" />;
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

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#333">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: clerkUser } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();
  const proEnabled = useProEnabled();
  const [showProModal, setShowProModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const [isDirty, setIsDirty] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

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
  const [setupStage, setSetupStage] = useState<"method" | "password" | "verify">("method");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState("");
  const [setupPendingPassword, setSetupPendingPassword] = useState("");
  const [setupAccountSaving, setSetupAccountSaving] = useState(false);
  const [setupAccountError, setSetupAccountError] = useState("");
  const [setupSocialLoading, setSetupSocialLoading] = useState<OAuthStrategy | null>(null);
  const [setupVerificationCode, setSetupVerificationCode] = useState("");
  const [setupVerificationSent, setSetupVerificationSent] = useState(false);
  const [setupVerificationPreparing, setSetupVerificationPreparing] = useState(false);
  const setupVerificationStartedRef = useRef(false);

  // Mandatory fields validation
  const hasCategory = (constructionEnabled && selectedConstruction.length > 0)
    || (renovationEnabled && selectedRenovation.length > 0)
    || (architectureEnabled && selectedArchitecture.length > 0)
    || (interiorEnabled && selectedInterior.length > 0)
    || (realEstateEnabled && selectedRealEstate.length > 0);
  const missingProjectSize = selectedProjectSizes.length === 0;
  const missingLocation = selectedLocations.length === 0;
  const missingDescription = !description.trim();

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
  }

  const canSave = hasCategory && !missingProjectSize && !missingLocation && !missingDescription;
  const isFirstCompanyConnection = searchParams.get("firstConnection") === "1";
  const hasSetupAccountQuery = searchParams.get("setupAccount") === "1";
  const setupStageQuery = searchParams.get("setupStage");
  const shouldPromptSetupAccount = hasSetupAccountQuery && !!clerkUser;
  const isResolvingSetupAccount = hasSetupAccountQuery && (!clerkUser || currentUser === undefined || company === undefined);

  const logoUrl = useStorageUrl(logoId);
  const logoPreviewUrl = logoUrl ?? company?.imageUrl;
  const totalProjectImages = projectImageUrls.length + projectImageIds.length;

  // Populate form when company data loads
  useEffect(() => {
    if (company) {
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
    }
  }, [company]);

  useEffect(() => {
    if (!hasSetupAccountQuery) {
      return;
    }

    if (setupStageQuery === "password") {
      setSetupStage("password");
      return;
    }

    if (setupStageQuery === "verify") {
      setSetupStage("verify");
      return;
    }

    setSetupStage("method");
  }, [hasSetupAccountQuery, setupStageQuery]);

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
    if (!file || !company) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Logo file must be under 2MB");
      return;
    }
    setUploadError(null);
    setLogoUploading(true);
    try {
      const id = await uploadFile(file);
      setLogoId(id);
      await updateCompany({ id: company._id, logoId: id });
    } catch {
      setUploadError("Failed to upload logo. Please try again.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image file must be under 2MB");
      return;
    }
    const max = company.isPro ? 12 : 4;
    if (totalProjectImages >= max) return;
    setUploadError(null);
    const slotIndex = totalProjectImages;
    setUploadingSlot(slotIndex);
    try {
      const id = await uploadFile(file);
      const newIds = [...projectImageIds, id];
      setProjectImageIds(newIds);
      await updateCompany({ id: company._id, projectImageIds: newIds, projectImageUrls });
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploadingSlot(null);
      if (projectInputRef.current) projectInputRef.current.value = "";
    }
  };

  const handleRemoveProjectImage = async (index: number) => {
    if (!company) return;

    if (index < projectImageUrls.length) {
      const nextExternalUrls = projectImageUrls.filter((_, i) => i !== index);
      setProjectImageUrls(nextExternalUrls);
      await updateCompany({ id: company._id, projectImageIds, projectImageUrls: nextExternalUrls });
      return;
    }

    const storageIndex = index - projectImageUrls.length;
    const nextStorageIds = projectImageIds.filter((_, i) => i !== storageIndex);
    setProjectImageIds(nextStorageIds);
    await updateCompany({ id: company._id, projectImageIds: nextStorageIds, projectImageUrls: projectImageUrls });
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
      if (company) {
        await updateCompany({
          id: company._id,
          name: companyName || undefined,
          description: description || undefined,
          address: address || undefined,
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
          constructionTypes: constructionEnabled ? selectedConstruction : [],
          constructionLocations: selectedLocations,
          renovationTypes: renovationEnabled ? selectedRenovation : [],
          renovationLocations: selectedLocations,
          architectureTypes: architectureEnabled ? selectedArchitecture : [],
          architectureLocations: selectedLocations,
          interiorTypes: interiorEnabled ? selectedInterior : [],
          interiorLocations: selectedLocations,
          realEstateTypes: realEstateEnabled ? selectedRealEstate : [],
          realEstateLocations: selectedLocations,
          logoId: logoId ?? undefined,
          projectImageIds,
          projectImageUrls,
          since: foundedYear ? parseInt(foundedYear) : undefined,
        });
      } else {
        await createCompany({
          ownerId: currentUser._id,
          name: companyName || currentUser.companyName || "My Company",
          description: description || undefined,
          category: selectedConstruction.length > 0 ? "construction" : "renovation",
          location: selectedLocations[0] || "bali",
          address: address || undefined,
          isPro: false,
          projects: projectsNumber ? parseInt(projectsNumber) : undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          whatsapp: whatsapp || undefined,
        });
      }
      setIsDirty(false);
      router.push("/company-dashboard");
    } finally {
      setSaving(false);
    }
  };

  const maxImages = company?.isPro ? 12 : 4;
  const totalSlots = proEnabled ? 12 : 4;

  const clearSetupFlow = () => {
    setSetupStage("method");
    setSetupPassword("");
    setSetupPasswordConfirm("");
    setSetupPendingPassword("");
    setSetupAccountSaving(false);
    setSetupAccountError("");
    setSetupSocialLoading(null);
    setSetupVerificationCode("");
    setSetupVerificationSent(false);
    setSetupVerificationPreparing(false);
    setupVerificationStartedRef.current = false;
  };

  const beginEmailVerification = async () => {
    if (!session) {
      throw new Error("Unable to start email verification right now.");
    }

    const verification = await session.startVerification({ level: "first_factor" });
    const emailFactor = verification.supportedFirstFactors?.find(
      (factor): factor is Extract<(typeof verification.supportedFirstFactors)[number], { strategy: "email_code" }> =>
        factor.strategy === "email_code" && "emailAddressId" in factor && Boolean(factor.emailAddressId)
    );

    if (!emailFactor?.emailAddressId) {
      throw new Error("This account cannot be verified by email code right now.");
    }

    await session.prepareFirstFactorVerification({
      strategy: "email_code",
      emailAddressId: emailFactor.emailAddressId,
    });
  };

  const handleSetupSocialAuth = async (strategy: OAuthStrategy) => {
    if (!clerkUser) return;

    setSetupSocialLoading(strategy);
    setSetupAccountError("");

    try {
      const redirectTarget = "/company-dashboard/edit?setupAccount=1&setupStage=password";
      await clerkUser.createExternalAccount({
        strategy,
        redirectUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectTarget)}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to continue with this social account right now.";
      setSetupAccountError(message);
      setSetupSocialLoading(null);
    }
  };

  useEffect(() => {
    if (setupStage !== "verify" || !session || setupVerificationStartedRef.current) {
      return;
    }

    let cancelled = false;

    const startEmailVerification = async () => {
      setSetupVerificationPreparing(true);
      setSetupAccountError("");

      try {
        setupVerificationStartedRef.current = true;
        await beginEmailVerification();

        if (cancelled) return;
        setSetupVerificationSent(true);
      } catch (error) {
        setupVerificationStartedRef.current = false;
        const message = error instanceof Error ? error.message : "Unable to send the verification email.";
        setSetupAccountError(message);
      } finally {
        if (!cancelled) {
          setSetupVerificationPreparing(false);
        }
      }
    };

    void startEmailVerification();

    return () => {
      cancelled = true;
    };
  }, [session, setupStage]);

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
      setSetupPendingPassword(setupPassword);
      setSetupStage("verify");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to register your password. Please try again.";
      setSetupAccountError(message);
    } finally {
      setSetupAccountSaving(false);
    }
  };

  const handleSetupVerification = async () => {
    if (!setupVerificationStartedRef.current || !session || setupVerificationPreparing || !clerkUser || !setupPendingPassword) {
      return;
    }

    if (!setupVerificationCode.trim()) {
      setSetupAccountError("Please enter the verification code sent to your email.");
      return;
    }

    setSetupVerificationPreparing(true);
    setSetupAccountError("");

    try {
      const result = await session.attemptFirstFactorVerification({
        strategy: "email_code",
        code: setupVerificationCode.trim(),
      });

      if (result.status !== "complete") {
        throw new Error("Invalid verification code.");
      }

      await clerkUser.updatePassword({ newPassword: setupPendingPassword });
      clearSetupFlow();

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("setupAccount");
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `/company-dashboard/edit?${nextQuery}` : "/company-dashboard/edit");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify your email code.";
      setSetupAccountError(message);
    } finally {
      setSetupVerificationPreparing(false);
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

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        {/* Header Row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            {company ? (
              <Link href={buildCompanyProfilePath(company)} className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-2 block hover:text-[#f14110] transition-colors">
                Company profile
              </Link>
            ) : (
              <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-2">
                Company profile
              </h1>
            )}
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] max-w-[600px]">
              Only informations filled in here will be displayed on your profile page. Keep in mind if you activate different categories you will only have a limited amount of pictures available. SolidFind encourages specialists : )
            </p>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] max-w-[600px] mt-2">
              Hanya informasi yang diisi di sini yang akan ditampilan di halaman profil Anda. Perlu diingat jika Anda mengaktifkan kategori yang berbeda, jumlah gambar yang tersedia hanya terbatas. SolidFind mendorong para spesialis : )
            </p>
          </div>

          <div className="text-left md:text-right">
            {company?.isPro && proEnabled ? (
              <p className="text-[11px] text-[#f14110] font-medium tracking-[0.22px] mb-1">PRO ACCOUNT</p>
            ) : proEnabled ? (
              <p className="text-[11px] text-[#333]/60 font-medium tracking-[0.22px] mb-1">FREE ACCOUNT</p>
            ) : null}

            <div className="flex items-center gap-4 justify-end">
              <button onClick={() => setShowDeleteModal(true)} className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]">
                DELETE PROFILE
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-4">
            {company && !isFirstCompanyConnection && (
              <Link
                href="/company-dashboard"
                className="h-10 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors flex items-center justify-center"
                style={{ minWidth: '140px' }}
              >
                ← Back
              </Link>
            )}
            <button
              onClick={() => { setIsDirty(false); handleSave(); }}
              disabled={saving || !canSave}
              className={`ml-auto h-10 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors disabled:cursor-not-allowed flex items-center justify-center ${(!isDirty || !canSave) ? 'opacity-50' : ''}`}
              style={{ width: '140px', maxWidth: '140px' }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {!canSave && (
            <div className="ml-auto w-full text-right">
              <p className="text-[9px] text-[#f14110] font-medium tracking-[0.18px] whitespace-pre-line text-right">
                {bottomHintText}
              </p>
            </div>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" onChangeCapture={() => setIsDirty(true)}>
          {/* Left Column */}
          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                Upload Company Logo /
                <br />
                Unggah Logo Perusahaan
              </label>
              <div
                onClick={() => logoInputRef.current?.click()}
                className={`w-[100px] h-[100px] rounded-[6px] cursor-pointer hover:opacity-80 transition-opacity overflow-hidden relative ${!logoPreviewUrl ? 'border-2 border-dashed border-[#ccc] flex items-center justify-center bg-white' : ''}`}
              >
                {logoPreviewUrl ? (
                  <Image src={logoPreviewUrl} alt="Company logo" fill className="object-cover" />
                ) : (
                  <Upload className="w-5 h-5 text-[#ccc]" />
                )}
                {logoUploading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-[8px] text-[#333]/50 mt-1 tracking-[0.16px]">
                Recommended: 400x400px, max 2MB
              </p>
            </div>

            {/* Company Name */}
            <div>
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

            {/* Address */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Address / Alamat <span className="text-[#f14110]">(*)</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Phone / Telepon <span className="text-[#f14110]">(*)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
            </div>

            {/* Website & WhatsApp */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Whatsapp <span className="text-[#f14110]">(*)</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
            </div>

            {/* Facebook & LinkedIn */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
                />
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
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
              />
            </div>


          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Company introduction as well as description of your project range / Pengenalan perusahaan serta deskripsi jangkauan proyek Anda <span className="text-[#f14110]">(*)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors resize-none"
              />
            </div>

            {/* Projects & Team */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Founded Year */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Founded year / Tahun berdiri
              </label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="e.g. 2015"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors"
              />
            </div>

            {/* Project Pictures Upload */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                {company?.isPro && proEnabled ? (
                  <>Upload project pictures or videos<br />Unggah gambar proyek atau Video</>
                ) : (
                  <>Upload project pictures /<br />Unggah gambar proyek <span className="text-[#f14110]">(*)</span></>
                )}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      {imgUrl && <ExternalProjectImage src={imgUrl} />}
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
        </div>


        {/* Project Size & Location - Top Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
                            setSelectedProjectSizes(next);
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
                {constructionServices.map((service) => {
                  const allActive = selectedConstruction.includes("all");
                  const isAll = service.id === "all";
                  const isDisabled = allActive && !isAll;
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${selectedConstruction.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={selectedConstruction.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAll) {
                            if (selectedConstruction.includes("all")) {
                              setSelectedConstruction(selectedConstruction.filter(s => s !== "all"));
                            } else {
                              setSelectedConstruction(["all"]);
                            }
                          } else {
                            let next = selectedConstruction.includes(service.id)
                              ? selectedConstruction.filter(s => s !== service.id)
                              : [...selectedConstruction.filter(s => s !== "all"), service.id];
                            const allIndividual = constructionServices.filter(s => s.id !== "all").map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = ["all"];
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
                {renovationServices.map((service) => {
                  const everyActive = selectedRenovation.includes("every");
                  const isEvery = service.id === "every";
                  const isDisabled = everyActive && !isEvery;
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${selectedRenovation.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={selectedRenovation.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isEvery) {
                            if (selectedRenovation.includes("every")) {
                              setSelectedRenovation(selectedRenovation.filter(s => s !== "every"));
                            } else {
                              setSelectedRenovation(["every"]);
                            }
                          } else {
                            let next = selectedRenovation.includes(service.id)
                              ? selectedRenovation.filter(s => s !== service.id)
                              : [...selectedRenovation.filter(s => s !== "every"), service.id];
                            const allIndividual = renovationServices.filter(s => s.id !== "every").map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = ["every"];
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
                {architectureServices.map((service) => {
                  const allActive = selectedArchitecture.includes("all");
                  const isAll = service.id === "all";
                  const isDisabled = allActive && !isAll;
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${selectedArchitecture.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={selectedArchitecture.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAll) {
                            if (selectedArchitecture.includes("all")) {
                              setSelectedArchitecture(selectedArchitecture.filter(s => s !== "all"));
                            } else {
                              setSelectedArchitecture(["all"]);
                            }
                          } else {
                            let next = selectedArchitecture.includes(service.id)
                              ? selectedArchitecture.filter(s => s !== service.id)
                              : [...selectedArchitecture.filter(s => s !== "all"), service.id];
                            const allIndividual = architectureServices.filter(s => s.id !== "all").map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = ["all"];
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
                {interiorServices.map((service) => {
                  const allActive = selectedInterior.includes("all");
                  const isAll = service.id === "all";
                  const isDisabled = allActive && !isAll;
                  return (
                    <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className={`text-[10px] tracking-[0.2px] ${selectedInterior.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={selectedInterior.includes(service.id)}
                        onChange={() => {
                          setIsDirty(true);
                          if (isAll) {
                            if (selectedInterior.includes("all")) {
                              setSelectedInterior(selectedInterior.filter(s => s !== "all"));
                            } else {
                              setSelectedInterior(["all"]);
                            }
                          } else {
                            let next = selectedInterior.includes(service.id)
                              ? selectedInterior.filter(s => s !== service.id)
                              : [...selectedInterior.filter(s => s !== "all"), service.id];
                            const allIndividual = interiorServices.filter(s => s.id !== "all").map(s => s.id);
                            if (allIndividual.every(id => next.includes(id))) {
                              next = ["all"];
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
              {realEstateServices.map((service) => {
                const allActive = selectedRealEstate.includes("all");
                const isAll = service.id === "all";
                const isDisabled = allActive && !isAll;
                return (
                  <div key={service.id} className={`flex items-center justify-between py-1 max-w-[300px] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className={`text-[10px] tracking-[0.2px] ${selectedRealEstate.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                      {service.label}
                    </span>
                    <Toggle
                      checked={selectedRealEstate.includes(service.id)}
                      onChange={() => {
                        setIsDirty(true);
                        if (isAll) {
                          if (selectedRealEstate.includes("all")) {
                            setSelectedRealEstate(selectedRealEstate.filter(s => s !== "all"));
                          } else {
                            setSelectedRealEstate(["all"]);
                          }
                        } else {
                          let next = selectedRealEstate.includes(service.id)
                            ? selectedRealEstate.filter(s => s !== service.id)
                            : [...selectedRealEstate.filter(s => s !== "all"), service.id];
                          const allIndividual = realEstateServices.filter(s => s.id !== "all").map(s => s.id);
                          if (allIndividual.every(id => next.includes(id))) {
                            next = ["all"];
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

        {/* Bottom Save */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 py-8 border-t border-[#e4e4e4] items-center">
          <div>
            <p className={`text-[9px] tracking-[0.18px] whitespace-pre-line ${bottomHintIsWarning ? 'text-[#f14110] font-medium' : 'text-[#333]/50'}`}>
              {bottomHintText}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            {saveError && (
              <p className="text-[10px] text-[#F14110] font-medium tracking-[0.2px] text-right">{saveError}</p>
            )}
            <button
              onClick={() => { setIsDirty(false); handleSave(); }}
              disabled={saving || !canSave}
              className={`h-10 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors disabled:cursor-not-allowed flex items-center justify-center ${(!isDirty || !canSave) ? 'opacity-50' : ''}`}
              style={{ width: '140px', maxWidth: '140px' }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {shouldPromptSetupAccount && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#333]/85 px-4">
          <div className="w-full max-w-[440px] rounded-[6px] bg-[#f8f8f8] px-6 py-7 sm:px-8">
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
                  <SetupSocialButton
                    label="Continue with Apple"
                    icon={<AppleIcon />}
                    onClick={() => handleSetupSocialAuth("oauth_apple")}
                    disabled={Boolean(setupSocialLoading)}
                  />
                  <SetupSocialButton
                    label="Continue with Microsoft"
                    icon={<MicrosoftIcon />}
                    onClick={() => handleSetupSocialAuth("oauth_microsoft")}
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
                      setSetupStage("password");
                      setSetupAccountError("");
                    }}
                    className="flex min-h-10 w-full items-center justify-center rounded-full border border-[#F14110] px-4 py-2 text-center text-[11px] font-medium tracking-[0.22px] text-[#F14110] transition hover:bg-[linear-gradient(to_right,#E9A28E,#F14110)] hover:text-white"
                  >
                    Continue with {clerkUser?.primaryEmailAddress?.emailAddress || "this email"}
                  </button>
                </div>

                {setupAccountError && (
                  <p className="mt-3 text-center text-[11px] font-medium text-[#F14110]">
                    *{setupAccountError}
                  </p>
                )}
              </>
            )}

            {setupStage === "password" && (
              <form onSubmit={handleSetupAccount} className="mt-5">
                <p className="mb-4 text-center text-[11px] font-medium tracking-[0.22px] text-[#333]">
                  {clerkUser?.primaryEmailAddress?.emailAddress || ""}
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

            {setupStage === "verify" && (
              <div className="mt-5">
                <p className="mb-4 text-center text-[11px] font-medium tracking-[0.22px] text-[#333]">
                  {clerkUser?.primaryEmailAddress?.emailAddress || ""}
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
                    {setupVerificationPreparing && !setupVerificationSent
                      ? "Sending a verification code to your email..."
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
                    disabled={setupAccountSaving || setupVerificationPreparing}
                    className="flex h-10 w-[140px] items-center justify-center rounded-full border border-[#333] text-[11px] font-medium tracking-[0.22px] text-[#333] transition-colors hover:border-[#f14110] hover:text-[#f14110] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {setupVerificationPreparing
                      ? (setupVerificationSent ? "Verifying..." : "Sending...")
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
