"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star, X, Upload, Lock } from "lucide-react";
import { uploadFile as uploadFileToStorage } from "@/lib/uploadFile";

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
  const [showProModal, setShowProModal] = useState(false);
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

  const updateCompany = useMutation(api.companies.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

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
  const [projectSizeEnabled, setProjectSizeEnabled] = useState(false);
  const [selectedConstruction, setSelectedConstruction] = useState<string[]>([]);
  const [constructionEnabled, setConstructionEnabled] = useState(false);
  const [selectedConstructionLocations, setSelectedConstructionLocations] = useState<string[]>([]);
  const [selectedRenovation, setSelectedRenovation] = useState<string[]>([]);
  const [renovationEnabled, setRenovationEnabled] = useState(false);
  const [selectedRenovationLocations, setSelectedRenovationLocations] = useState<string[]>([]);

  // Image state
  const [logoId, setLogoId] = useState<Id<"_storage"> | undefined>();
  const [projectImageIds, setProjectImageIds] = useState<Id<"_storage">[]>([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      setSelectedConstructionLocations(company.constructionLocations ?? []);
      setSelectedRenovation(company.renovationTypes ?? []);
      setRenovationEnabled((company.renovationTypes ?? []).length > 0);
      setSelectedRenovationLocations(company.renovationLocations ?? []);
      setLogoId(company.logoId ?? undefined);
      setProjectImageIds(company.projectImageIds ?? []);
      setFoundedYear(company.since?.toString() ?? "");
    }
  }, [company]);

  const toggleService = (list: string[], setList: (val: string[]) => void, id: string) => {
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
          projectSizes: projectSizeEnabled ? selectedProjectSizes : [],
          constructionTypes: constructionEnabled ? selectedConstruction : [],
          constructionLocations: constructionEnabled ? selectedConstructionLocations : [],
          renovationTypes: renovationEnabled ? selectedRenovation : [],
          renovationLocations: renovationEnabled ? selectedRenovationLocations : [],
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
          location: selectedConstructionLocations[0] || selectedRenovationLocations[0] || "bali",
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
      router.push("/company-dashboard");
    } finally {
      setSaving(false);
    }
  };

  const maxImages = company?.isPro ? 12 : 4;
  const totalSlots = 12;

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
            <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-2">
              Company profile
            </h1>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] max-w-[400px]">
              (*) Only informations filled in here will be displayed on your profile page.
              <br />
              Hanya informasi yang diisi di sini yang akan ditampilan di halaman profil Anda. (*)
            </p>
          </div>

          <div className="text-right">
            {company?.isPro ? (
              <>
                <p className="text-[11px] text-[#f14110] font-medium tracking-[0.22px] mb-1">PRO ACCOUNT</p>
                <Link
                  href="/company-dashboard"
                  className="text-[11px] text-[#333] tracking-[0.22px] hover:text-[#f14110]"
                >
                  CANCEL
                </Link>
              </>
            ) : (
              <>
                <p className="text-[11px] text-[#333]/60 font-medium tracking-[0.22px] mb-1">FREE ACCOUNT</p>
                <Link
                  href="/upgrade"
                  className="text-[11px] text-[#f14110] font-medium tracking-[0.22px] hover:underline"
                >
                  UPGRADE FOR MORE
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          {company?.isPro && (
            <button className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors">
              Get AD space
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-8 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
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

            {/* PRO Features — only shown for PRO accounts */}
            {company?.isPro && (
              <div className="mt-6 pt-4 border-t border-[#e4e4e4]">
                <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-3">
                  Services included with PRO account
                  <br />
                  Layanan dengan akun PRO
                </p>
                <div className="space-y-2">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 flex items-center justify-center text-[#f14110]">
                        {feature.icon === "star" && <Star className="w-4 h-4" />}
                        {feature.icon === "ai" && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z"/>
                          </svg>
                        )}
                        {feature.icon === "stats" && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="1" y="8" width="3" height="7"/>
                            <rect x="6" y="4" width="3" height="11"/>
                            <rect x="11" y="1" width="3" height="14"/>
                          </svg>
                        )}
                        {feature.icon === "photos" && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="1" y="3" width="14" height="10" rx="1"/>
                          </svg>
                        )}
                        {feature.icon === "ad" && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] font-medium text-[#333] tracking-[0.18px]">{feature.title}</p>
                        <p className="text-[8px] text-[#333]/50 tracking-[0.16px]">{feature.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Description of your company and range of work / Deskripsi perusahaan
                <br />
                Anda dan lingkup pekerjaan
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
                Upload project pictures /
                <br />
                Unggah gambar proyek <span className="text-[#f14110]">(*)</span>
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
              <p className="text-[8px] text-[#333]/50 mt-2 tracking-[0.16px]">
                4 pictures for Free account / 12 pictures with PRO / 4 gambar untuk
                <br />
                akun gratis / 12 gambar dengan akun PRO
              </p>
            </div>
          </div>
        </div>

        {/* Project Size Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Project Size</h2>
            <Toggle
              checked={projectSizeEnabled}
              onChange={(val) => {
                setProjectSizeEnabled(val);
                if (!val) setSelectedProjectSizes([]);
              }}
            />
          </div>
          {projectSizeEnabled && (
            <div className="space-y-1">
              {projectSizeOptions.map((size) => (
                <div key={size.id} className="flex items-center justify-between py-1 max-w-[300px]">
                  <span className={`text-[10px] tracking-[0.2px] ${selectedProjectSizes.includes(size.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                    {size.label}
                  </span>
                  <Toggle
                    checked={selectedProjectSizes.includes(size.id)}
                    onChange={() => toggleService(selectedProjectSizes, setSelectedProjectSizes, size.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Construction & Renovation Sections */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Construction</h2>
              <Toggle
                checked={constructionEnabled}
                onChange={(val) => {
                  setConstructionEnabled(val);
                  if (!val) {
                    setSelectedConstruction([]);
                    setSelectedConstructionLocations([]);
                  }
                }}
              />
            </div>

            {constructionEnabled && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-2">
                    Services Provided /
                    <br />
                    Layanan yang Disediakan
                  </p>
                  {constructionServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between py-1">
                      <span className={`text-[10px] tracking-[0.2px] ${selectedConstruction.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={selectedConstruction.includes(service.id)}
                        onChange={() => toggleService(selectedConstruction, setSelectedConstruction, service.id)}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-2">
                    Services Location /
                    <br />
                    Lokasi Layanan
                  </p>
                  {locationOptions.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between py-1">
                      <span className={`text-[10px] tracking-[0.2px] ${selectedConstructionLocations.includes(loc.id) ? 'text-[#f14110] font-medium' : 'text-[#333]/50'}`}>
                        {loc.label}
                      </span>
                      <Toggle
                        checked={selectedConstructionLocations.includes(loc.id)}
                        onChange={() => toggleService(selectedConstructionLocations, setSelectedConstructionLocations, loc.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Renovation Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Renovation</h2>
              <Toggle
                checked={renovationEnabled}
                onChange={(val) => {
                  setRenovationEnabled(val);
                  if (!val) {
                    setSelectedRenovation([]);
                    setSelectedRenovationLocations([]);
                  }
                }}
              />
            </div>

            {renovationEnabled && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-2">
                    Services Provided /
                    <br />
                    Layanan yang Disediakan
                  </p>
                  {renovationServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between py-1">
                      <span className={`text-[10px] tracking-[0.2px] ${selectedRenovation.includes(service.id) ? 'text-[#f14110] font-medium' : 'text-[#333]'}`}>
                        {service.label}
                      </span>
                      <Toggle
                        checked={selectedRenovation.includes(service.id)}
                        onChange={() => toggleService(selectedRenovation, setSelectedRenovation, service.id)}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-2">
                    Services Location /
                    <br />
                    Lokasi Layanan
                  </p>
                  {locationOptions.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between py-1">
                      <span className={`text-[10px] tracking-[0.2px] ${selectedRenovationLocations.includes(loc.id) ? 'text-[#f14110] font-medium' : 'text-[#333]/50'}`}>
                        {loc.label}
                      </span>
                      <Toggle
                        checked={selectedRenovationLocations.includes(loc.id)}
                        onChange={() => toggleService(selectedRenovationLocations, setSelectedRenovationLocations, loc.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Save */}
        <div className="flex items-center justify-center gap-4 py-8 border-t border-[#e4e4e4]">
          <p className="text-[9px] text-[#333]/50 tracking-[0.18px]">
            *Select &apos;LOCATION&apos; for &apos;RENOVATION&apos; before submitting /
            <br />
            *Pilih &apos;LOKASI&apos; untuk &apos;RENOVASI&apos; sebelum mengirimkan
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-8 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </main>

      <Footer />

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
