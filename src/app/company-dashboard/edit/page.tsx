"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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

export default function EditProfilePage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const proEnabled = useProEnabled();
  const [showProModal, setShowProModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const pageConfigs = useQuery(api.pageConfigs.listVisible);
  const isCategoryVisible = (catId: string) => pageConfigs?.some(p => p.categoryId === catId) ?? false;

  const updateCompany = useMutation(api.companies.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteAccount = useMutation(api.users.deleteAccount);

  const handleDeleteAccount = async () => {
    if (!clerkUser?.id) return;
    await deleteAccount({ clerkId: clerkUser.id });
    await signOut();
    router.push("/");
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
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
    // Category missing — show default text, orange only if other fields are filled
    bottomHintText = "*Select at least 1 category before saving\n*Pilih setidaknya 1 kategori sebelum menyimpan";
    bottomHintIsWarning = !missingProjectSize && !missingLocation; // turn orange when user tried but no category
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

  const logoUrl = useStorageUrl(logoId);

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
      setFoundedYear(company.since?.toString() ?? "");
    }
  }, [company]);

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
    if (projectImageIds.length >= max) return;
    setUploadError(null);
    const slotIndex = projectImageIds.length;
    setUploadingSlot(slotIndex);
    try {
      const id = await uploadFile(file);
      const newIds = [...projectImageIds, id];
      setProjectImageIds(newIds);
      await updateCompany({ id: company._id, projectImageIds: newIds });
    } catch {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploadingSlot(null);
      if (projectInputRef.current) projectInputRef.current.value = "";
    }
  };

  const handleRemoveProjectImage = async (index: number) => {
    if (!company) return;
    const newIds = projectImageIds.filter((_, i) => i !== index);
    setProjectImageIds(newIds);
    await updateCompany({ id: company._id, projectImageIds: newIds });
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
        <div className="flex items-start justify-between mb-6">
          <div>
            {company ? (
              <Link href={`/profile/${company._id}`} className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-2 block hover:text-[#f14110] transition-colors">
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

          <div className="text-right">
            {company?.isPro && proEnabled ? (
              <p className="text-[11px] text-[#f14110] font-medium tracking-[0.22px] mb-1">PRO ACCOUNT</p>
            ) : proEnabled ? (
              <p className="text-[11px] text-[#333]/60 font-medium tracking-[0.22px] mb-1">FREE ACCOUNT</p>
            ) : null}
            {clerkUser?.emailAddresses?.[0]?.emailAddress && (
              <p className="text-[10px] text-[#333]/60 tracking-[0.2px] mb-2">
                {clerkUser.emailAddresses[0].emailAddress}
              </p>
            )}
            <div className="flex items-center gap-4 justify-end">
              <button onClick={() => setShowDeleteModal(true)} className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]">
                DELETE PROFILE
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-8 mb-8 items-center">
          <div className="flex gap-4">
            {company && (
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
              className={`h-10 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors disabled:cursor-not-allowed flex items-center justify-center ${(!isDirty || !canSave) ? 'opacity-50' : ''}`}
              style={{ minWidth: '140px' }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          <div>
            {!canSave && (
              <p className="text-[9px] text-[#f14110] font-medium tracking-[0.18px] whitespace-pre-line">{bottomHintText}</p>
            )}
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8" onChangeCapture={() => setIsDirty(true)}>
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
                className={`w-[100px] h-[100px] rounded-[6px] cursor-pointer hover:opacity-80 transition-opacity overflow-hidden relative ${!logoUrl ? 'border-2 border-dashed border-[#ccc] flex items-center justify-center bg-white' : ''}`}
              >
                {logoUrl ? (
                  <Image src={logoUrl} alt="Company logo" fill className="object-cover" />
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
                Description of your company and range of work / Deskripsi perusahaan
                <br />
                Anda dan lingkup pekerjaan <span className="text-[#f14110]">(*)</span>
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
                  Projects number / Nomor proyek <span className="text-[#f14110]">(*)</span>
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
              <div className="grid grid-cols-4 gap-2">
                {Array(totalSlots).fill(null).map((_, index) => {
                  const imgId = projectImageIds[index];
                  const isLocked = index >= maxImages;
                  const isNextEmpty = !imgId && index === projectImageIds.length && !isLocked;
                  const isUploading = uploadingSlot === index;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (isNextEmpty && uploadingSlot === null) projectInputRef.current?.click();
                      }}
                      className={`aspect-square rounded-[4px] overflow-hidden relative group ${isNextEmpty ? 'cursor-pointer border-2 border-dashed border-[#ccc] flex items-center justify-center bg-white hover:border-[#f14110] transition-colors' : ''} ${isLocked && !imgId ? '' : ''}`}
                      style={!imgId && !isNextEmpty ? {
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23e4e4e4'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e4e4e4'/%3E%3C/svg%3E")`,
                        backgroundSize: '10px 10px'
                      } : undefined}
                    >
                      {imgId && <ProjectImage storageId={imgId} />}
                      {imgId && (
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
                      {isLocked && !imgId && (
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
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Project Size */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Project Size <span className="text-[#f14110]">(*)</span></h2>
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
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Location <span className="text-[#f14110]">(*)</span></h2>
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
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Construction */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Construction</h2>
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
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Renovation</h2>
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
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Architecture</h2>
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
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Interior</h2>
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
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Real Estate</h2>
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
        <div className="flex items-center gap-4 py-8 border-t border-[#e4e4e4]">
          <p className={`text-[9px] tracking-[0.18px] whitespace-pre-line ${bottomHintIsWarning ? 'text-[#f14110] font-medium' : 'text-[#333]/50'}`}>
            {bottomHintText}
          </p>
          <div className="ml-auto flex items-center gap-3">
            {saveError && (
              <p className="text-[10px] text-[#F14110] font-medium tracking-[0.2px]">{saveError}</p>
            )}
            <button
              onClick={() => { setIsDirty(false); handleSave(); }}
              disabled={saving || !canSave}
              className={`h-10 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors disabled:cursor-not-allowed flex items-center justify-center ${(!isDirty || !canSave) ? 'opacity-50' : ''}`}
              style={{ minWidth: '140px' }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </main>

      <Footer />

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
