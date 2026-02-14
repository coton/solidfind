"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

const constructionServices = [
  { id: "all", label: "ALL TYPES" },
  { id: "residential", label: "RESIDENTIAL" },
  { id: "commercial", label: "COMMERCIAL" },
  { id: "hospitality", label: "HOSPITALITY" },
];

const renovationServices = [
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
      className={`w-8 h-4 rounded-full transition-colors ${checked ? 'bg-gradient-to-l from-[#f14110] to-[#e9a28e]' : 'bg-[#333]/20'}`}
    >
      <div className={`w-3 h-3 bg-white rounded-full transition-all ${checked ? 'ml-4' : 'ml-0.5'} mt-0.5`} />
    </button>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [showProModal, setShowProModal] = useState(false);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const company = useQuery(
    api.companies.getByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );

  const updateCompany = useMutation(api.companies.update);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [description, setDescription] = useState("");
  const [projectsNumber, setProjectsNumber] = useState("");
  const [teamSize, setTeamSize] = useState("");

  // Project size options
  const [selectedProjectSizes, setSelectedProjectSizes] = useState<string[]>([]);

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
      setDescription(company.description ?? "");
      setProjectsNumber(company.projects?.toString() ?? "");
      setTeamSize(company.teamSize?.toString() ?? "");
      setSelectedProjectSizes(company.projectSizes ?? []);
      setSelectedConstruction(company.constructionTypes ?? ["residential"]);
      setSelectedConstructionLocations(company.constructionLocations ?? ["bali"]);
      setSelectedRenovation(company.renovationTypes ?? []);
      setSelectedRenovationLocations(company.renovationLocations ?? ["bali"]);
    }
  }, [company]);

  // Service selections
  const [selectedConstruction, setSelectedConstruction] = useState<string[]>(["residential"]);
  const [selectedRenovation, setSelectedRenovation] = useState<string[]>([]);
  const [selectedConstructionLocations, setSelectedConstructionLocations] = useState<string[]>(["bali"]);
  const [selectedRenovationLocations, setSelectedRenovationLocations] = useState<string[]>(["bali"]);

  const toggleService = (list: string[], setList: (val: string[]) => void, id: string) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSave = async () => {
    if (!company) return;
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
      projectSizes: selectedProjectSizes,
      constructionTypes: selectedConstruction,
      constructionLocations: selectedConstructionLocations,
      renovationTypes: selectedRenovation,
      renovationLocations: selectedRenovationLocations,
    });
    router.push("/company-dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
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
            <p className="text-[11px] text-[#f14110] font-medium tracking-[0.22px] mb-1">
              PRO ACCOUNT
            </p>
            <Link
              href="/company-dashboard"
              className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]"
            >
              CANCEL
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors">
            Get AD space
          </button>
          <button
            onClick={handleSave}
            className="h-10 px-8 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors"
          >
            Save
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
                className="w-[100px] h-[100px] rounded-[6px] cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23e4e4e4'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e4e4e4'/%3E%3C/svg%3E")`,
                  backgroundSize: '10px 10px'
                }}
              />
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
                  Whatsapp
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

            {/* PRO Features */}
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
              <button
                onClick={() => setShowProModal(true)}
                className="mt-4 text-[10px] text-[#f14110] underline tracking-[0.2px]"
              >
                See all
              </button>
            </div>
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

            {/* Project Size */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                Project Size / Ukuran Proyek
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "any", label: "Any Size" },
                  { id: "solo", label: "Solo/Couple" },
                  { id: "family", label: "Family/Co-Hosting" },
                  { id: "shared", label: "Shared/Community" },
                ].map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => toggleService(selectedProjectSizes, setSelectedProjectSizes, size.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-medium tracking-[0.2px] border transition-colors ${
                      selectedProjectSizes.includes(size.id)
                        ? 'bg-[#f14110] text-white border-[#f14110]'
                        : 'bg-white text-[#333] border-[#e4e4e4] hover:border-[#f14110]'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Pictures Upload */}
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                Upload project pictures /
                <br />
                Unggah gambar proyek <span className="text-[#f14110]">(*)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Array(12).fill(null).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-[4px] cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23e4e4e4'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23e4e4e4'/%3E%3C/svg%3E")`,
                      backgroundSize: '10px 10px'
                    }}
                  />
                ))}
              </div>
              <p className="text-[8px] text-[#333]/50 mt-2 tracking-[0.16px]">
                10 pictures for Free account + 12 pictures with premium / 9 gambar untuk
                <br />
                akun gratis + 12 gambar dengan akun pro
              </p>
            </div>
          </div>
        </div>

        {/* Construction Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Construction</h2>
              <Toggle checked={selectedConstruction.length > 0} onChange={() => {}} />
            </div>

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
          </div>

          {/* Renovation Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[20px] font-bold text-[#333] tracking-[0.4px]">Renovation</h2>
              <Toggle checked={selectedRenovation.length > 0} onChange={() => {}} />
            </div>

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
            className="h-10 px-8 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors"
          >
            Save
          </button>
        </div>
      </main>

      <Footer />

      {/* PRO Features Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProModal(false)} />
          <div className="relative bg-white w-[500px] rounded-[6px] p-8">
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
