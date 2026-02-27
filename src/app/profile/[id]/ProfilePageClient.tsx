"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { ThankYouModal } from "@/components/ThankYouModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { starFillColor, starColor } from "@/lib/starColors";

function useStorageUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(api.files.getUrl, storageId ? { storageId } : "skip");
}

function StorageImage({ storageId, alt, className, width, height, fill, sizes }: { storageId: Id<"_storage">; alt: string; className?: string; width?: number; height?: number; fill?: boolean; sizes?: string }) {
  const url = useStorageUrl(storageId);
  if (!url) return <div className={className} style={{ width, height, background: '#d8d8d8' }} />;
  return fill ? <Image src={url} alt={alt} fill sizes={sizes ?? "210px"} className={className} unoptimized /> : <Image src={url} alt={alt} width={width ?? 210} height={height ?? 210} className={className} unoptimized />;
}

function formatWhatsApp(num: string): string {
  return num.replace(/^[+0]+/, "");
}

function ProjectImagesGrid({
  imageUrls,
  imageIds,
}: {
  imageUrls: string[];
  imageIds: Id<"_storage">[];
}) {
  const urlImages = imageUrls.filter(Boolean);
  const idImages = imageIds.filter(Boolean);
  const totalCount = urlImages.length + idImages.length;

  if (totalCount === 0) return <div />;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-5">
      {urlImages.map((src, i) => (
        <div key={`url-${i}`} className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Project ${i + 1}`} className="object-cover w-full h-full absolute inset-0" />
        </div>
      ))}
      {idImages.map((id, i) => (
        <div key={`id-${i}`} className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative">
          <StorageImage storageId={id} alt={`Project ${urlImages.length + i + 1}`} fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}

function ReportModal({ isOpen, onClose, companyId, userId }: { isOpen: boolean; onClose: () => void; companyId: Id<"companies">; userId?: Id<"users"> }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createReport = useMutation(api.reports.create);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await createReport({
        companyId,
        reporterUserId: userId,
        text: text.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit report:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => { onClose(); setSubmitted(false); setText(""); }} />
      <div className="relative bg-white w-full max-w-[440px] rounded-[6px] p-8">
        <button
          onClick={() => { onClose(); setSubmitted(false); setText(""); }}
          className="absolute top-4 right-4 text-[#333]/50 hover:text-[#f14110] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <h3 className="text-[20px] font-bold text-[#333] mb-2">Thank you!</h3>
            <p className="text-[12px] text-[#333]/70">Your report has been submitted. We will review it shortly.</p>
          </div>
        ) : (
          <>
            <h3 className="text-[20px] font-bold text-[#333] mb-4">Report this company</h3>
            <p className="text-[11px] text-[#333]/70 mb-4">Please describe the issue you&apos;d like to report.</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Describe the issue..."
              className="w-full px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#e4e4e4] resize-none mb-4"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="w-[140px] h-[40px] border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] rounded-[4px] hover:bg-[#f14110] hover:text-white hover:border-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ name, rating = 5, text, date, mobile }: { name: string; rating?: number; text: string; date: string; mobile?: boolean }) {
  return (
    <div className={mobile ? "w-full" : "w-[210px]"}>
      <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-2">{name}</p>
      <div className="flex items-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-[14px] h-[14px]" style={{ fill: starFillColor(i - 1, rating), color: starFillColor(i - 1, rating) }} />
        ))}
      </div>
      <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] mb-2 line-clamp-4">{text}</p>
      <p className="font-bam text-[9px] text-[#333]/35">{date}</p>
    </div>
  );
}

export default function ProfilePageClient() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { user: clerkUser } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: company?.name ?? "SolidFind", url: window.location.href });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    }
  };

  // Try to parse as Convex ID; if invalid format just pass it
  let validId: Id<"companies"> | undefined;
  try {
    validId = companyId as Id<"companies">;
  } catch {
    validId = undefined;
  }

  const company = useQuery(
    api.companies.getById,
    validId ? { id: validId } : "skip"
  );

  const reviews = useQuery(
    api.reviews.listByCompany,
    validId ? { companyId: validId } : "skip"
  );

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const savedStatus = useQuery(
    api.savedListings.isSaved,
    currentUser && validId
      ? { userId: currentUser._id, companyId: validId }
      : "skip"
  );

  const adjacentIds = useQuery(
    api.companies.getAdjacentIds,
    validId ? { id: validId } : "skip"
  );

  const toggleSave = useMutation(api.savedListings.toggle);
  const createReview = useMutation(api.reviews.create);

  // Use saved status from server
  const isBookmarked = savedStatus ?? isSaved;

  const handleToggleSave = async () => {
    if (!currentUser || !validId || !company) {
      if (!currentUser) {
        // Redirect to sign-in if not logged in
        router.push("/sign-in");
      }
      return;
    }
    setIsSaved(!isBookmarked);
    await toggleSave({
      userId: currentUser._id,
      companyId: validId,
      category: company.category,
    });
  };

  if (company === undefined) {
    return (
      <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
        <Header />
        <main className="max-w-[900px] mx-auto px-4 sm:px-0 pt-6 pb-6 sm:pt-0 sm:pb-8 flex-grow w-full">
          {/* Back row */}
          <div className="h-[36px] mb-6 border-b border-[#333]/10" />
          {/* Title */}
          <Skeleton className="h-[28px] w-[200px] mb-6" />
          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[210px_210px_1fr_70px] gap-5 mb-8">
            <Skeleton className="w-full aspect-square rounded-[6px]" />
            <div className="space-y-3">
              <Skeleton className="h-[14px] w-[120px]" />
              <Skeleton className="h-[14px] w-[80px]" />
              <Skeleton className="h-[60px] w-full" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[36px] w-full" />
              ))}
              <Skeleton className="h-[60px] w-full mt-4" />
            </div>
          </div>
          {/* Image grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-[6px]" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
        <Header />
        <main className="max-w-[900px] mx-auto px-6 py-8 flex-grow w-full">
          <p className="text-[#333]">Company not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const reviewsList = (reviews ?? []).map((r) => ({
    name: r.userName,
    rating: r.rating,
    text: r.content,
    date: new Date(r.createdAt).toLocaleDateString("en-CA").replace(/-/g, "/"),
  }));

  return (
    <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 pt-6 pb-6 sm:pt-0 sm:pb-8 flex-grow w-full">
        {/* Back Button Row */}
        <div className="flex items-center justify-between mb-3 py-2 border-b border-[#333]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            <span>←</span> BACK
          </Link>

          {company.isPro && (
            <div className="flex items-center justify-center rounded-[10px] border border-[#333]/20" style={{ width: '90px', height: '16px' }}>
              <span className="font-bam text-[9px] text-[#333]/50 tracking-[0.18px]">Pro Account</span>
            </div>
          )}
        </div>

        {/* Company Name */}
        <h1 className="text-[20px] sm:text-[26px] font-semibold text-[#333] leading-tight sm:leading-[30px] mb-4 sm:mb-6">
          {company.name}
        </h1>

        {/* Main Content Grid - Mobile: 2-col (logo+contact), Desktop: 4 columns */}
        <div className="grid grid-cols-[160px_1fr] lg:grid-cols-[210px_210px_1fr_70px] gap-4 lg:gap-5 mb-8">
          {/* Column 1: Logo */}
          <div className="w-full lg:self-start">
            <div className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative">
              {company.logoId ? (
                <StorageImage storageId={company.logoId} alt={company.name} fill className="object-cover w-full h-full" />
              ) : company.imageUrl ? (
                <Image
                  src={company.imageUrl}
                  alt={company.name}
                  width={210}
                  height={210}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23ccc'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23ccc'/%3E%3C/svg%3E")`,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}
            </div>
          </div>

          {/* Column 2: Contact Info */}
          <div className="w-full lg:max-w-[210px] flex flex-col lg:self-start lg:h-[210px]">
            <div className="h-[32px] flex items-center border-b border-[#333]/20">
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                Tel. {company.phone || "-"}
              </p>
            </div>

            <div className="h-[32px] flex items-center border-b border-[#333]/20 mb-4">
              {company.website ? (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
                >
                  WEBSITE
                </a>
              ) : (
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">WEBSITE -</p>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-5 mb-6">
              {company.email && (
                <a href={`mailto:${company.email}`} className="text-[#333] hover:text-[#f14110] transition-colors">
                  <svg width="24" height="19" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H22C23.1 18 24 17.1 24 16V2C24 0.9 23.1 0 22 0ZM22 4L12 10L2 4V2L12 8L22 2V4Z" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {company.whatsapp && (
                <a href={`https://wa.me/${formatWhatsApp(company.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 3.05C15.15 1.15 12.65 0 10 0C4.5 0 0 4.5 0 10C0 11.75 0.5 13.45 1.35 14.9L0 20L5.25 18.7C6.65 19.45 8.3 19.9 10 19.9C15.5 19.9 20 15.4 20 9.9C20 7.35 18.95 4.95 17.05 3.05ZM10 18.25C8.45 18.25 6.95 17.85 5.65 17.1L5.35 16.9L2.3 17.7L3.15 14.75L2.9 14.4C2.05 13.05 1.6 11.5 1.6 9.95C1.6 5.35 5.35 1.6 9.95 1.6C12.15 1.6 14.25 2.45 15.8 4.05C17.4 5.6 18.3 7.75 18.25 9.95C18.35 14.6 14.6 18.25 10 18.25Z" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {company.instagram && (
                <a href={company.instagram.startsWith("http") ? company.instagram : `https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="16.5" cy="5.5" r="1" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {company.facebook && (
                <a href={company.facebook.startsWith("http") ? company.facebook : `https://${company.facebook}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 11H14L15 7H11V5C11 3.97 11 3 13 3H15V0.14C14.69 0.1 13.39 0 12.01 0C9.12 0 7 1.66 7 4.7V7H4V11H7V20H11V11Z" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {company.linkedin && (
                <a href={company.linkedin.startsWith("http") ? company.linkedin : `https://${company.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.9 20 2 20H18C19.1 20 20 19.1 20 18V2C20 0.9 19.1 0 18 0ZM6 17H3V8H6V17ZM4.5 6.3C3.5 6.3 2.7 5.5 2.7 4.5C2.7 3.5 3.5 2.7 4.5 2.7C5.5 2.7 6.3 3.5 6.3 4.5C6.3 5.5 5.5 6.3 4.5 6.3ZM17 17H14V12.5C14 11.4 13.1 10.5 12 10.5C10.9 10.5 10 11.4 10 12.5V17H7V8H10V9.2C10.5 8.4 11.6 7.8 12.8 7.8C15.1 7.8 17 9.7 17 12V17Z" fill="currentColor"/>
                  </svg>
                </a>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col mt-auto">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1 text-[#333]">
                <path d="M8 1C4.13 1 1 4.13 1 8C1 13.5 8 19 8 19C8 19 15 13.5 15 8C15 4.13 11.87 1 8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              <p className="font-bam text-[9px] text-[#333]/50 leading-[12px] w-full">
                {company.address || "-"}
              </p>
            </div>
          </div>

          {/* Column 3+4 merged: stats+save side-by-side on top, description full-width below */}
          <div className="col-span-2 lg:col-span-2">

            {/* Desktop: stats (left) + save/share/report (right) in a flex row */}
            {/* Mobile: stats only here, save buttons appear below description */}
            <div className="flex items-start justify-between mb-4">
              <div className="max-w-[300px] flex-1 mr-4">
                <div className="h-[32px] flex items-center justify-between border-b border-[#333]/20">
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Projects</span>
                  <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{company.projects ?? 0}</span>
                </div>
                <div className="h-[32px] flex items-center justify-between border-b border-[#333]/20">
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Team</span>
                  <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{company.teamSize ?? 0}</span>
                </div>
                <div className="h-[32px] flex items-center justify-between border-b border-[#333]/20">
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Since</span>
                  <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">{company.since ?? new Date(company.createdAt).getFullYear()}</span>
                </div>
              </div>

              {/* Desktop: Save/Share/Report beside stats */}
              <div className="hidden lg:flex flex-col items-end gap-4 flex-shrink-0">
                {/* Bookmark: ON=orange fill, OFF=grey outline; hover swaps state preview */}
                <button onClick={handleToggleSave} className="group flex items-center gap-2 text-[#333]/35 transition-colors">
                  <span className="font-bam text-[9px]">{company.bookmarkCount ?? 0} Saves</span>
                  <svg width="15" height="20" viewBox="0 0 15.2353 20.1985" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className={`transition-colors ${isBookmarked
                      ? 'fill-[#f14110] stroke-[#f14110] group-hover:fill-transparent group-hover:stroke-[#D8D8D8]'
                      : 'fill-transparent stroke-[#D8D8D8] group-hover:fill-[#f14110] group-hover:stroke-[#f14110]'
                    }`}
                    style={{ strokeWidth: 2, strokeLinejoin: 'round' as const }}
                  >
                    <path d="M1 1H14.2353V19.1985L7.61765 14.2353L1 19.1985V1Z" />
                  </svg>
                </button>
                {/* Share: grey outline → orange on hover, text stays grey */}
                <button onClick={handleShare} className="group flex items-center gap-2 text-[#333]/35 transition-colors relative">
                  <span className="font-bam text-[9px]">Share</span>
                  <svg width="15" height="20" viewBox="0 0 15.2353 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                    style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
                  >
                    <path d="M11.3071 8H12.7712C13.1595 8 13.5319 8.15444 13.8065 8.42936C14.081 8.70427 14.2353 9.07713 14.2353 9.46592V17.5341C14.2353 17.9229 14.081 18.2957 13.8065 18.5706C13.5319 18.8456 13.1595 19 12.7712 19H2.46408C2.07578 19 1.70339 18.8456 1.42882 18.5706C1.15425 18.2957 1 17.9229 1 17.5341V9.46592C1 9.07713 1.15425 8.70427 1.42882 8.42936C1.70339 8.15444 2.07578 8 2.46408 8H3.92816M10.5458 3.93183L7.61765 1M7.61765 1L4.68948 3.93183M7.61765 1V13.4682" />
                  </svg>
                  {showCopiedToast && (
                    <span className="absolute -top-6 right-0 text-[9px] text-[#f14110] font-medium whitespace-nowrap bg-white px-2 py-1 rounded shadow">Link copied!</span>
                  )}
                </button>
                {/* Report: grey outline → orange on hover, text stays grey */}
                <button onClick={() => setShowReportModal(true)} className="group flex items-center gap-2 text-[#333]/35 transition-colors">
                  <span className="font-bam text-[9px]">Report</span>
                  <svg width="20" height="22" viewBox="0 0 20 21.9999" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                    style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
                  >
                    <path d="M1 20.9999V12.8746M1 12.8746C7.54525 7.81917 12.4548 17.93 19 12.8746V2.45931C12.4548 7.51473 7.54525 -2.59611 1 2.45931V12.8746Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Description — full width of col3+col4 */}
            <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] whitespace-pre-line mb-4">
              {company.description ?? ""}
            </p>

            {/* Mobile only: Save/Share/Report below description, left-aligned */}
            <div className="flex lg:hidden items-center gap-4">
              <button onClick={handleToggleSave} className="group flex items-center gap-2 text-[#333]/35 transition-colors">
                <span className="font-bam text-[9px]">{company.bookmarkCount ?? 0} Saves</span>
                <svg width="15" height="20" viewBox="0 0 15.2353 20.1985" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className={`transition-colors ${isBookmarked
                    ? 'fill-[#f14110] stroke-[#f14110] group-hover:fill-transparent group-hover:stroke-[#D8D8D8]'
                    : 'fill-transparent stroke-[#D8D8D8] group-hover:fill-[#f14110] group-hover:stroke-[#f14110]'
                  }`}
                  style={{ strokeWidth: 2, strokeLinejoin: 'round' as const }}
                >
                  <path d="M1 1H14.2353V19.1985L7.61765 14.2353L1 19.1985V1Z" />
                </svg>
              </button>
              <button onClick={handleShare} className="group flex items-center gap-2 text-[#333]/35 transition-colors relative">
                <span className="font-bam text-[9px]">Share</span>
                <svg width="15" height="20" viewBox="0 0 15.2353 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                  style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
                >
                  <path d="M11.3071 8H12.7712C13.1595 8 13.5319 8.15444 13.8065 8.42936C14.081 8.70427 14.2353 9.07713 14.2353 9.46592V17.5341C14.2353 17.9229 14.081 18.2957 13.8065 18.5706C13.5319 18.8456 13.1595 19 12.7712 19H2.46408C2.07578 19 1.70339 18.8456 1.42882 18.5706C1.15425 18.2957 1 17.9229 1 17.5341V9.46592C1 9.07713 1.15425 8.70427 1.42882 8.42936C1.70339 8.15444 2.07578 8 2.46408 8H3.92816M10.5458 3.93183L7.61765 1M7.61765 1L4.68948 3.93183M7.61765 1V13.4682" />
                </svg>
                {showCopiedToast && (
                  <span className="absolute -top-6 right-0 text-[9px] text-[#f14110] font-medium whitespace-nowrap bg-white px-2 py-1 rounded shadow">Link copied!</span>
                )}
              </button>
              <button onClick={() => setShowReportModal(true)} className="group flex items-center gap-2 text-[#333]/35 transition-colors">
                <span className="font-bam text-[9px]">Report</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <svg width="20" height="22" viewBox="0 0 20 21.9999" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                  style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
                >
                  <path d="M1 20.9999V12.8746M1 12.8746C7.54525 7.81917 12.4548 17.93 19 12.8746V2.45931C12.4548 7.51473 7.54525 -2.59611 1 2.45931V12.8746Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Photos Grid + Services - Mobile: stack, Desktop: side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 lg:gap-5 mb-8">
          {/* Only render grid if there are actual images */}
          <ProjectImagesGrid
            imageUrls={company.projectImageUrls ?? []}
            imageIds={company.projectImageIds ?? []}
          />

          <div>
            <p className="font-bam text-[9px] text-[#333] mb-4">Services provided:</p>
            {/* Mobile: horizontal scroll cards */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {(company.projectSizes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">PROJECT SIZE</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.projectSizes!.join(", ")}</p>
                  </div>
                )}
                {(company.constructionTypes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">CONSTRUCTION</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.constructionTypes!.join(", ")}</p>
                    {(company.constructionLocations?.length ?? 0) > 0 && (
                      <p className="text-[9px] text-[#333]/40 mt-1">Location: {company.constructionLocations!.join(", ")}</p>
                    )}
                  </div>
                )}
                {(company.renovationTypes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">RENOVATION</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.renovationTypes!.join(", ")}</p>
                    {(company.renovationLocations?.length ?? 0) > 0 && (
                      <p className="text-[9px] text-[#333]/40 mt-1">Location: {company.renovationLocations!.join(", ")}</p>
                    )}
                  </div>
                )}
                <div className="min-w-[160px] flex-shrink-0">
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">LOCATION</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.location ?? "Bali"}</p>
                </div>
              </div>
              {/* Scroll indicator */}
              <div className="flex justify-center mt-2">
                <div className="w-[20px] h-[2px] rounded-full bg-[#f14110]" />
              </div>
            </div>
            {/* Desktop: vertical list */}
            <div className="hidden lg:block space-y-4">
              {(company.projectSizes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">PROJECT SIZE</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.projectSizes!.join(", ")}</p>
                </div>
              )}
              {(company.constructionTypes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">CONSTRUCTION</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.constructionTypes!.join(", ")}</p>
                  {(company.constructionLocations?.length ?? 0) > 0 && (
                    <p className="text-[9px] text-[#333]/40 mt-1">Location: {company.constructionLocations!.join(", ")}</p>
                  )}
                </div>
              )}
              {(company.renovationTypes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">RENOVATION</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.renovationTypes!.join(", ")}</p>
                  {(company.renovationLocations?.length ?? 0) > 0 && (
                    <p className="text-[9px] text-[#333]/40 mt-1">Location: {company.renovationLocations!.join(", ")}</p>
                  )}
                </div>
              )}
              <div>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">LOCATION</p>
                <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.location ?? "Bali"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Latest reviews /</p>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Ulasan terbaru</p>
              </div>
              <div className="flex items-center gap-1">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.438 3.067C7.578 1.022 8.148 0 9 0c.852 0 1.422 1.022 2.562 3.067l.295.53c.324.581.486.872.738 1.063.252.192.567.263 1.197.405l.572.13c2.214.5 3.32.75 3.584 1.598.263.846-.491 1.729-2 3.494l-.39.456c-.429.501-.644.752-.74 1.062-.096.31-.064.645.001 1.314l.06.609c.227 2.355.342 3.533-.348 4.055-.689.523-1.726.046-3.798-0.908l-.537-.247c-.589-.272-.883-.407-1.195-.407-.312 0-.607.135-1.195.407l-.537.247c-2.072.954-3.109 1.431-3.798.909-.69-.524-.576-1.701-.348-4.056l.06-.608c.064-.67.097-1.005 0-1.314-.096-.31-.311-.562-.739-1.062l-.39-.457c-1.51-1.764-2.264-2.647-2-3.494.262-.846 1.37-1.097 3.584-1.598l.573-.13c.63-.142.944-.213 1.196-.405.253-.192.414-.482.738-1.063l.296-.53z" fill={starColor(company.rating ?? 0)}/>
                </svg>
                <span className="text-[22px] sm:text-[26px] font-semibold tracking-[0.52px]" style={{ color: starColor(company.rating ?? 0) }}>{company.rating ?? 0}</span>
                <span className="text-[10px] tracking-[0.2px]" style={{ color: starColor(company.rating ?? 0) + 'B3' }}>({company.reviewCount ?? 0})</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {clerkUser && currentUser && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="hidden sm:flex h-[40px] px-6 rounded-full bg-[#f14110] text-[11px] font-medium text-white tracking-[0.22px] hover:bg-[#d93a0e] transition-colors items-center"
                >
                  Write a Review
                </button>
              )}
              <Link
                href={`/profile/${companyId}/reviews`}
                className="rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors flex items-center justify-center"
                style={{ width: '140px', height: '40px' }}
              >
                See all
              </Link>
            </div>
          </div>

          {/* Mobile: 3 reviews full width */}
          <div className="lg:hidden space-y-5">
            {reviewsList.slice(0, 3).map((review, index) => (
              <ReviewCard key={index} {...review} mobile />
            ))}
          </div>
          {/* Desktop: 4 reviews in grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5">
            {reviewsList.slice(0, 4).map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
          {/* Mobile: Write a Review button */}
          {clerkUser && currentUser && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="sm:hidden mt-4 h-[40px] px-6 rounded-full bg-[#f14110] text-[11px] font-medium text-white tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8 border-t border-[#333]/10 pt-4">
          {adjacentIds?.prevId ? (
            <Link
              href={`/profile/${adjacentIds.prevId}`}
              className="text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
            >
              ← PREVIOUS
            </Link>
          ) : (
            <span className="text-[11px] font-semibold text-[#333]/30 tracking-[0.22px]">← PREVIOUS</span>
          )}
          {adjacentIds?.nextId ? (
            <Link
              href={`/profile/${adjacentIds.nextId}`}
              className="text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
            >
              NEXT →
            </Link>
          ) : (
            <span className="text-[11px] font-semibold text-[#333]/30 tracking-[0.22px]">NEXT →</span>
          )}
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner imageSrc="/images/ad-kini-resort.png" alt="Kini Resort" />
        </div>
      </main>

      <Footer />

      {/* Review Modals */}
      {validId && currentUser && (
        <WriteReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            setShowThankYou(true);
          }}
          companyId={validId}
          userId={currentUser._id}
          userName={clerkUser?.fullName ?? clerkUser?.firstName ?? "Anonymous"}
        />
      )}
      <ThankYouModal
        isOpen={showThankYou}
        onClose={() => setShowThankYou(false)}
      />
      {validId && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          companyId={validId}
          userId={currentUser?._id}
        />
      )}
    </div>
  );
}
