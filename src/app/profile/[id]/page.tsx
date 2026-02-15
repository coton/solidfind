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
import { Star } from "lucide-react";

function useStorageUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(api.files.getUrl, storageId ? { storageId } : "skip");
}

function StorageImage({ storageId, alt, className, width, height, fill }: { storageId: Id<"_storage">; alt: string; className?: string; width?: number; height?: number; fill?: boolean }) {
  const url = useStorageUrl(storageId);
  if (!url) return <div className={className} style={{ width, height, background: '#d8d8d8' }} />;
  return fill ? <Image src={url} alt={alt} fill className={className} /> : <Image src={url} alt={alt} width={width ?? 210} height={height ?? 210} className={className} />;
}

function formatWhatsApp(num: string): string {
  return num.replace(/^[+0]+/, "");
}

function ReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => { onClose(); setSubmitted(false); setText(""); }} />
      <div className="relative bg-white w-full max-w-[440px] rounded-[6px] p-8">
        <button
          onClick={() => { onClose(); setSubmitted(false); setText(""); }}
          className="absolute top-4 right-4 text-[#333]/50 hover:text-[#333]"
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
              className="w-full px-3 py-2 bg-white border border-[#e4e4e4] rounded-[6px] text-[11px] text-[#333] outline-none focus:border-[#f14110] transition-colors resize-none mb-4"
            />
            <button
              onClick={() => setSubmitted(true)}
              disabled={!text.trim()}
              className="w-full h-10 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#d93a0e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ name, rating = 5, text, date }: { name: string; rating?: number; text: string; date: string }) {
  return (
    <div className="w-[210px]">
      <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-2">{name}</p>
      <div className="flex items-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-[14px] h-[14px] ${i <= rating ? 'fill-[#f14110] text-[#f14110]' : 'fill-[#e4e4e4] text-[#e4e4e4]'}`} />
        ))}
      </div>
      <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] mb-2 line-clamp-4">{text}</p>
      <p className="text-[9px] text-[#333]/35 font-mono">{date}</p>
    </div>
  );
}

export default function ProfilePage() {
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
      <div className="min-h-screen bg-[#e4e4e4]">
        <Header />
        <main className="max-w-[900px] mx-auto px-6 py-8">
          <p className="text-[#333]/50">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="min-h-screen bg-[#e4e4e4]">
        <Header />
        <main className="max-w-[900px] mx-auto px-6 py-8">
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
    <div className="min-h-screen bg-[#e4e4e4]">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button Row */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-[#333]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            <span>←</span> BACK
          </Link>

          {company.isPro && (
            <div className="flex items-center gap-1">
              <Image src="/images/icon-sponsored.svg" alt="" width={20} height={20} />
              <div className="bg-[#e4e4e4] rounded-[10px] px-3 py-1">
                <span className="text-[9px] text-[#333]/35 font-medium">Pro Account</span>
              </div>
            </div>
          )}
        </div>

        {/* Company Name */}
        <h1 className="text-[20px] sm:text-[26px] font-semibold text-[#333] leading-tight sm:leading-[30px] mb-4 sm:mb-6">
          {company.name}
        </h1>

        {/* Main Content Grid - Mobile: stack, Desktop: 4 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_210px_1fr_70px] gap-5 mb-8">
          {/* Column 1: Logo */}
          <div className="w-full max-w-[210px] mx-auto lg:mx-0">
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
          <div className="w-full max-w-[210px] mx-auto lg:mx-0">
            {company.phone && (
              <div className="border-b border-[#333]/20 pb-2 mb-3">
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                  Tel. {company.phone}
                </p>
              </div>
            )}

            {company.website && (
              <div className="border-b border-[#333]/20 pb-2 mb-4">
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
                >
                  WEBSITE
                </a>
              </div>
            )}

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
            <div className="flex items-start gap-2">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 flex-shrink-0 text-[#333]">
                <path d="M8 0C3.58 0 0 3.58 0 8C0 14 8 20 8 20C8 20 16 14 16 8C16 3.58 12.42 0 8 0ZM8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5C9.66 5 11 6.34 11 8C11 9.66 9.66 11 8 11Z" fill="currentColor"/>
              </svg>
              <p className="text-[9px] text-[#333]/50 leading-[12px] font-mono">
                {company.address ?? ""}
              </p>
            </div>
          </div>

          {/* Column 3: Stats + About */}
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between border-b border-[#333]/20 py-1">
                <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Projects</span>
                <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{company.projects ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#333]/20 py-1">
                <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Team</span>
                <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{company.teamSize ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#333]/20 py-1">
                <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Since</span>
                <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">2021</span>
              </div>
            </div>

            <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] whitespace-pre-line">
              {company.description ?? ""}
            </p>
          </div>

          {/* Column 4: Save/Share/Report - Mobile: horizontal row, Desktop: vertical */}
          <div className="flex lg:flex-col items-center lg:items-end gap-4 justify-center lg:justify-start">
            <button
              onClick={handleToggleSave}
              className="flex items-center gap-2 text-[#333]/35 hover:text-[#f14110] transition-colors"
            >
              <span className="text-[9px] font-mono">{company.bookmarkCount ?? 0} Saves</span>
              <Image
                src="/images/icon-bookmark.svg"
                alt="Save"
                width={15}
                height={20}
                className={isBookmarked ? 'opacity-100' : 'opacity-60'}
              />
            </button>

            <button onClick={handleShare} className="flex items-center gap-2 text-[#333]/35 hover:text-[#f14110] transition-colors relative">
              <span className="text-[9px] font-mono">Share</span>
              <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 0V12M7.5 0L3 4.5M7.5 0L12 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 9V17C1 17.5523 1.44772 18 2 18H13C13.5523 18 14 17.5523 14 17V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {showCopiedToast && (
                <span className="absolute -top-6 right-0 text-[9px] text-[#f14110] font-medium whitespace-nowrap bg-white px-2 py-1 rounded shadow">
                  Link copied!
                </span>
              )}
            </button>

            <button onClick={() => setShowReportModal(true)} className="flex items-center gap-2 text-[#333]/35 hover:text-[#f14110] transition-colors">
              <span className="text-[9px] font-mono">Report</span>
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1V17M1 1H11L15 5V13L11 17H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V10M8 13V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Photos Grid + Services - Mobile: stack, Desktop: side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 lg:gap-5 mb-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-5">
            {Array(12).fill(null).map((_, index) => {
              const imgId = company.projectImageIds?.[index];
              return (
                <div
                  key={index}
                  className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative"
                  style={!imgId ? {
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23ccc'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23ccc'/%3E%3C/svg%3E")`,
                    backgroundSize: '10px 10px'
                  } : undefined}
                >
                  {imgId && <StorageImage storageId={imgId} alt={`Project ${index + 1}`} fill className="object-cover" />}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <p className="text-[9px] text-[#333] font-mono">Services provided:</p>
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

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Latest reviews /</p>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Ulasan terbaru</p>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/images/icon-star.svg" alt="" width={18} height={18} />
                <span className="text-[22px] sm:text-[26px] font-semibold text-[#f14110] tracking-[0.52px]">{company.rating ?? 0}</span>
                <span className="text-[10px] text-[#f14110]/70 tracking-[0.2px]">({company.reviewCount ?? 0})</span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {clerkUser && currentUser && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex-1 sm:flex-none h-[40px] px-4 sm:px-6 rounded-full bg-[#f14110] text-[11px] font-medium text-white tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
                >
                  Write a Review
                </button>
              )}
              <Link
                href={`/profile/${companyId}/reviews`}
                className="flex-1 sm:flex-none h-[40px] px-4 sm:px-6 rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors flex items-center justify-center"
              >
                See all
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center lg:justify-items-start">
            {reviewsList.slice(0, 4).map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
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
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
