"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const categories = [
  { id: "construction", label: "Construction" },
  { id: "renovation", label: "Renovation" },
  { id: "architecture", label: "Architecture" },
  { id: "interior", label: "Interior" },
  { id: "real-estate", label: "Real Estate" },
];

const locationOptions = [
  "Seminyak",
  "Canggu",
  "Ubud",
  "Denpasar",
  "Kuta",
  "Sanur",
  "Nusa Dua",
  "Other",
];

const steps = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Contact & Location" },
  { number: 3, label: "Review & Submit" },
];

export default function RegisterBusinessPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const existingCompany = useQuery(
    api.companies.getByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );

  const createCompany = useMutation(api.companies.create);
  const updateAccountType = useMutation(api.users.updateAccountType);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 fields
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [foundingYear, setFoundingYear] = useState("");

  // Step 2 fields
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");

  const canProceedStep1 = companyName.trim() && category && description.trim();
  const canProceedStep2 = phone.trim() && whatsapp.trim() && address.trim();
  const canSubmit = canProceedStep1 && canProceedStep2;

  const handleSubmit = async () => {
    if (!currentUser?._id || !clerkUser?.id) return;

    setIsSubmitting(true);
    try {
      await createCompany({
        ownerId: currentUser._id,
        name: companyName.trim(),
        category,
        description: description.trim(),
        isPro: false,
        location: location || undefined,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        instagram: instagram.trim() || undefined,
        since: foundingYear ? parseInt(foundingYear) : undefined,
      });

      await updateAccountType({
        clerkId: clerkUser.id,
        accountType: "company",
      });

      router.push("/company-dashboard");
    } catch (error) {
      console.error("Failed to create company:", error);
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isClerkLoaded || (clerkUser && currentUser === undefined)) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <Header />
        <main className="max-w-[600px] mx-auto px-6 py-16">
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#f14110] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not signed in
  if (!clerkUser) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <Header />
        <main className="max-w-[600px] mx-auto px-6 py-16">
          <div className="text-center py-20">
            <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px] mb-4">
              Sign in to register your business
            </h1>
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px] mb-8">
              You need an account to list your business on SolidFind.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center h-10 px-8 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
            >
              Sign up
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Already has a company
  if (existingCompany) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <Header />
        <main className="max-w-[600px] mx-auto px-6 py-16">
          <div className="text-center py-20">
            <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px] mb-4">
              You already have a business listed
            </h1>
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px] mb-8">
              Manage your company profile from the dashboard.
            </p>
            <Link
              href="/company-dashboard"
              className="inline-flex items-center h-10 px-8 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[600px] mx-auto px-6 py-8 sm:py-16">
        {/* Page Title */}
        <h1 className="text-[24px] sm:text-[32px] font-bold text-[#333] tracking-[0.64px] mb-2">
          List your business
        </h1>
        <p className="text-[11px] text-[#333]/70 tracking-[0.22px] mb-8">
          Register your company on SolidFind to reach clients in Bali.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s.number < step) setStep(s.number);
                }}
                className={`flex items-center gap-2 h-8 px-4 rounded-full text-[11px] font-medium tracking-[0.22px] transition-colors ${
                  step === s.number
                    ? "bg-[#f14110] text-white"
                    : step > s.number
                      ? "bg-[#333] text-white cursor-pointer"
                      : "bg-[#e4e4e4] text-[#333]/50"
                }`}
                disabled={s.number > step}
              >
                <span>{s.number}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`w-6 sm:w-10 h-[2px] ${step > s.number ? "bg-[#333]" : "bg-[#e4e4e4]"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Company name <span className="text-[#f14110]">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                Category <span className="text-[#f14110]">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`h-10 px-4 sm:px-5 rounded-full text-[11px] font-medium tracking-[0.22px] transition-all ${
                      category === cat.id
                        ? "bg-[#f14110] text-white"
                        : "bg-white border border-[#e4e4e4] text-[#333] hover:border-[#f14110]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Description <span className="text-[#f14110]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your business, services, and expertise..."
                rows={5}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Founding year <span className="text-[#333]/40">(optional)</span>
              </label>
              <input
                type="number"
                value={foundingYear}
                onChange={(e) => setFoundingYear(e.target.value)}
                placeholder="e.g. 2015"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className={`h-10 px-8 rounded-full text-[11px] font-medium tracking-[0.22px] transition-colors ${
                  canProceedStep1
                    ? "bg-[#f14110] text-white hover:bg-[#d93a0e]"
                    : "bg-[#e4e4e4] text-[#333]/40 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contact & Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Phone <span className="text-[#f14110]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 xxx xxxx xxxx"
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  WhatsApp <span className="text-[#f14110]">*</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+62 xxx xxxx xxxx"
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Email <span className="text-[#333]/40">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Website <span className="text-[#333]/40">(optional)</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.company.com"
                  className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Location in Bali <span className="text-[#333]/40">(optional)</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors appearance-none"
              >
                <option value="">Select a location</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc.toLowerCase()}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Full address <span className="text-[#f14110]">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Raya Seminyak No. 123, Bali"
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                Instagram <span className="text-[#333]/40">(optional)</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username or https://instagram.com/username"
                className="w-full h-10 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none focus:border-[#f14110] transition-colors"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="h-10 px-6 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className={`h-10 px-8 rounded-full text-[11px] font-medium tracking-[0.22px] transition-colors ${
                  canProceedStep2
                    ? "bg-[#f14110] text-white hover:bg-[#d93a0e]"
                    : "bg-[#e4e4e4] text-[#333]/40 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-[6px] p-6 space-y-4">
              <h2 className="text-[14px] font-semibold text-[#333] tracking-[0.28px] mb-4">
                Review your information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Company name</p>
                  <p className="text-[11px] text-[#333] font-medium">{companyName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Category</p>
                  <p className="text-[11px] text-[#333] font-medium capitalize">
                    {categories.find((c) => c.id === category)?.label ?? category}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Description</p>
                <p className="text-[11px] text-[#333] leading-[18px]">{description}</p>
              </div>

              {foundingYear && (
                <div>
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Founding year</p>
                  <p className="text-[11px] text-[#333] font-medium">{foundingYear}</p>
                </div>
              )}

              {/* Contact info */}
              {(phone || whatsapp || email || website) && (
                <>
                  <div className="border-t border-[#e4e4e4] pt-4 mt-4">
                    <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-3">Contact Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {phone && (
                        <div>
                          <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Phone</p>
                          <p className="text-[11px] text-[#333]">{phone}</p>
                        </div>
                      )}
                      {whatsapp && (
                        <div>
                          <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">WhatsApp</p>
                          <p className="text-[11px] text-[#333]">{whatsapp}</p>
                        </div>
                      )}
                      {email && (
                        <div>
                          <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Email</p>
                          <p className="text-[11px] text-[#333]">{email}</p>
                        </div>
                      )}
                      {website && (
                        <div>
                          <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Website</p>
                          <p className="text-[11px] text-[#333]">{website}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Location info */}
              {(location || address) && (
                <div className="border-t border-[#e4e4e4] pt-4">
                  <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-3">Location</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {location && (
                      <div>
                        <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Area</p>
                        <p className="text-[11px] text-[#333] capitalize">{location}</p>
                      </div>
                    )}
                    {address && (
                      <div>
                        <p className="text-[9px] text-[#333]/50 tracking-[0.18px] mb-1">Address</p>
                        <p className="text-[11px] text-[#333]">{address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="h-10 px-6 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`h-10 px-8 rounded-full text-[11px] font-medium tracking-[0.22px] transition-colors flex items-center gap-2 ${
                  canSubmit && !isSubmitting
                    ? "bg-[#f14110] text-white hover:bg-[#d93a0e]"
                    : "bg-[#e4e4e4] text-[#333]/40 cursor-not-allowed"
                }`}
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
