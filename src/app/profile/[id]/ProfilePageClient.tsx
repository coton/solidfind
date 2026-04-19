"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { starFillColor, starColor } from "@/lib/starColors";
import { buildCompanyProfilePath, buildCompanyReviewsPath } from "@/lib/company-profile-url.mjs";

/** Capitalize first letter of each word in every array element, then join */
function capitalizeJoin(arr: string[]): string {
  return arr
    .map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(", ");
}

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
  allProjectImageUrls,
  onImageClick,
}: {
  imageUrls: string[];
  allProjectImageUrls: string[];
  onImageClick: (src: string, alt: string) => void;
}) {
  const urlImages = imageUrls.filter(Boolean);
  const totalCount = allProjectImageUrls.length;

  if (totalCount === 0) return <div />;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-5">
      {allProjectImageUrls.map((src, i) => (
        <div 
          key={`img-${i}`} 
          className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick(src, `Project ${i + 1}`)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Project ${i + 1}`} className="object-cover w-full h-full absolute inset-0" loading="lazy" />
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
  const searchParams = useSearchParams();
  const companyIdentifier = (params.companySlug ?? params.id) as string;
  const fromCategory = searchParams.get("from");
  const { user: clerkUser } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const proEnabled = useProEnabled();
  const reviewsEnabled = useReviewsEnabled();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImage, setCurrentImage] = useState<{ src: string; alt: string } | null>(null);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: company?.name ?? "SolidFind", url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    }
  };

  const company = useQuery(api.companies.getByPublicIdentifier, {
    identifier: companyIdentifier,
  });
  const validId = company?._id;
  // Note: This should only be used inside the component body, not in useCallback/useMemo
  const getImageUrl = (storageId: Id<"_storage">) => {
    const result = useQuery(api.files.getUrl, storageId ? { storageId } : "skip");
    return result as string | undefined;
  };

  const handleImageClick = (src: string, alt: string) => {
    setCurrentImage({ src, alt });
    setShowImageViewer(true);
  };

  // Get all project image URLs (both external and Convex storage)
  const allProjectImageUrls = useMemo(() => {
    const urls = [...(company?.projectImageUrls ?? [])];
    for (const id of company?.projectImageIds ?? []) {
      const url = useQuery(api.files.getUrl, id ? { storageId: id } : "skip");
      if (url) urls.push(url);
    }
    return urls;
  }, [company]);

  const reviews = useQuery(
    api.reviews.listByCompany,
    validId ? { companyId: validId } : "skip"
  );

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const categoryContext = fromCategory || company?.category || "construction";

  const savedStatus = useQuery(
    api.savedListings.isSaved,
    currentUser && validId && categoryContext
      ? { userId: currentUser._id, companyId: validId, category: categoryContext }
      : "skip"
  );

  const adjacentIds = useQuery(
    api.companies.getAdjacentIds,
    validId ? { id: validId } : "skip"
  );

  const companyArticles = useQuery(
    api.featuredArticles.listByCompany,
    validId ? { companyId: validId } : "skip"
  );

  const toggleSave = useMutation(api.savedListings.toggle);
  const createReview = useMutation(api.reviews.create);
  const recordView = useMutation(api.profileViews.record);

  const viewRecorded = useRef(false);
  useEffect(() => {
    if (!validId || !company || viewRecorded.current) return;
    // Don't count the company owner viewing their own profile
    const isOwner = currentUser && currentUser._id === company.ownerId;
    if (!isOwner) {
      viewRecorded.current = true;
      recordView({ companyId: validId });
    }
  }, [validId, recordView, company, currentUser]);

  // Use saved status from server
  const isBookmarked = savedStatus ?? isSaved;

  const handleToggleSave = async () => {
    if (!currentUser || !validId || !company) {
      if (!currentUser) {
        router.push("/sign-in");
      }
      return;
    }
    setIsSaved(!isBookmarked);
    await toggleSave({
      userId: currentUser._id,
      companyId: validId,
      category: categoryContext,
    });
  };

  if (company === undefined) {
    return (
      <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
        <Header />
        <main className="max-w-[900px] mx-auto px-4 sm:px-0 sm:pb-8 flex-grow w-full">
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

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 sm:pb-8 flex-grow w-full">
        {/* Back Button Row */}
        <div className="flex items-center justify-between mb-3 py-2 border-b border-[#333]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
          >
            <svg width="8" height="5" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>BACK</span>
          </Link>

          {company.isPro && proEnabled && (
            <div className="flex items-center justify-center rounded-[10px] bg-[#E4E4E4]" style={{ width: '90px', height: '16px' }}>
              <span className="font-bam text-[9px] text-[#333]/35 tracking-[0.18px]">Pro Account</span>
            </div>
          )}
        </div>

        {/* Company Name */}
        <h1 className="text-[20px] sm:text-[26px] font-semibold text-[#333] leading-tight sm:leading-[30px] mb-4 sm:mb-6">
          {company.name}
        </h1>

        {/* Main Content Grid - Mobile: 2-col (logo+contact), Desktop: 4 columns */}
        <div className="grid grid-cols-[160px_1fr] lg:grid-cols-[210px_210px_1fr_70px] gap-4 lg:gap-5 mb-0 lg:mb-8">
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
          <div className="w-full lg:max-w-[210px] flex flex-col h-[210px] lg:self-start">
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
            <div className="flex items-center gap-5 mb-6" style={{ height: 20 }}>
              {company.email && (
                <a href={`mailto:${company.email}`} className="text-[#333] hover:text-[#f14110] transition-colors flex items-center h-[20px]">
                  <svg height="20" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M1 3L12 10L23 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
              {company.whatsapp && (
                <a href={`https://wa.me/${formatWhatsApp(company.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors flex items-center h-[20px]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.99023 1H9.99316C11.1636 0.996123 12.3233 1.2251 13.4043 1.67383C14.485 2.12248 15.4656 2.7819 16.2891 3.61328L16.293 3.61719C17.9749 5.29915 18.9004 7.53456 18.9004 9.91992C18.9004 14.8276 14.8978 18.83 9.99023 18.8301C8.49894 18.8301 7.03299 18.4529 5.72852 17.7422L5.37988 17.5518L4.99609 17.6533L1.41895 18.5928L2.36523 15.123L2.47363 14.7227L2.26758 14.3623C1.49363 13.0123 1.0801 11.4838 1.08008 9.91016C1.08008 5.00244 5.08252 1 9.99023 1Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12.82 11.1801C13.04 11.2701 14.26 11.8701 14.51 11.9901C14.76 12.1101 14.91 12.1601 14.98 12.2701C15.05 12.3801 15.05 12.8701 14.84 13.4501C14.64 14.0301 13.65 14.5601 13.17 14.6301C12.74 14.6901 12.2 14.7201 11.61 14.5301C11.25 14.4201 10.79 14.2701 10.2 14.0101C7.72002 12.9401 6.09002 10.4401 5.97002 10.2701L5.96808 10.2675C5.84074 10.0977 4.96002 8.9237 4.96002 7.71008C4.96002 6.49008 5.60002 5.89008 5.82002 5.64008C6.05002 5.39008 6.31002 5.33008 6.48002 5.33008H6.96002C7.11002 5.34008 7.32002 5.28008 7.52002 5.76008C7.72002 6.26008 8.22002 7.48008 8.28002 7.60008C8.34002 7.72008 8.38002 7.86008 8.30002 8.03008C8.22002 8.19008 8.17002 8.30008 8.05002 8.44008C7.93002 8.58008 7.79002 8.76008 7.68002 8.87008C7.55002 9.00008 7.43002 9.13008 7.57002 9.38008C7.72002 9.63008 8.21002 10.4401 8.95002 11.1001C9.89002 11.9401 10.69 12.2101 10.94 12.3301C11.19 12.4601 11.34 12.4401 11.48 12.2701C11.62 12.1101 12.09 11.5501 12.26 11.3001C12.43 11.0601 12.59 11.1001 12.82 11.1801Z" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {company.instagram && (
                <a href={company.instagram.startsWith("http") ? company.instagram : `https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors flex items-center h-[20px]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.7998 1H14.2002C16.8478 1.00011 18.9999 3.15224 19 5.7998V14.2002C18.9999 15.4732 17.4939 16.6936 16.5938 17.5938C15.6936 18.4939 14.4732 18.9999 13.2002 19H5.7998C3.15224 18.9999 1.00011 16.8478 1 14.2002V5.7998C1.00005 4.52684 1.50612 3.30638 2.40625 2.40625C3.30638 1.50612 4.52684 1.00005 5.7998 1Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="15.5" cy="4.5" r="1.5" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {company.facebook && (
                <a href={company.facebook.startsWith("http") ? company.facebook : `https://${company.facebook}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors flex items-center h-[20px]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 11.0793H10.2866V18H12.5731V11.0793L14.6465 11.0735L14.9733 8.71666H12.5745V7.70884C12.5731 7.553 12.5839 7.3973 12.6068 7.24325C12.7022 6.65186 13.0164 6.35833 13.6814 6.35833H15V4.10266L14.986 4.10122C14.7545 4.06796 14.2663 4 13.3587 4C11.42 4 10.2866 5.05554 10.2866 7.4558V8.72245H8V11.0793Z" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {company.linkedin && (
                <a href={company.linkedin.startsWith("http") ? company.linkedin : `https://${company.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#333] hover:text-[#f14110] transition-colors flex items-center h-[20px]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M4 11.1942H6.31836V19H4V11.1942ZM11.4785 13.1344C10.2734 13.1344 10.0879 14.1199 10.0879 15.138V19H7.77148V11.1942H9.99609V12.2614H10.0273C10.3379 11.6481 11.0938 11 12.2207 11C14.5664 11 15 12.6172 15 14.7189V19H12.6836V15.2034C12.6836 14.2977 12.666 13.1344 11.4785 13.1344Z" fill="currentColor"/>
                    <circle cx="5" cy="9" r="1" fill="currentColor" stroke="currentColor"/>
                  </svg>
                </a>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col mt-auto">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address || "")}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 group cursor-pointer"
              >
                <svg width="14" height="17" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#333] group-hover:text-[#f14110] transition-colors flex-shrink-0 mt-[1px]">
                  <path d="M8 1C4.13 1 1 4.13 1 8C1 13.5 8 19 8 19C8 19 15 13.5 15 8C15 4.13 11.87 1 8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="font-bam text-[9px] text-[#333]/50 group-hover:text-[#f14110] transition-colors leading-[14px] w-full break-words">
                  {company.address || "-"}
                </span>
              </a>
            </div>
          </div>

          {/* Column 3+4 merged: stats+save side-by-side on top, description full-width below */}
          <div className="col-span-2 lg:col-span-2">

            {/* Desktop: stats (left) + save/share/report (right) in a flex row */}
            {/* Mobile: stats only here, save buttons appear below description */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 lg:max-w-[300px] lg:mr-4">
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
                  <span className={`font-bam text-[9px] ${company.bookmarkCount ? 'text-[#F14110]' : '#666'}`}>{String(company.bookmarkCount ?? 0).padStart(2, '0')}</span>
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
                  <svg width="15" height="17" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                    style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
                  >
                    <path d="M1 16.4545V10.1759M1 10.1759C5.90894 6.26941 9.59106 14.0823 14.5 10.1759V2.1277C9.59106 6.03416 5.90894 -1.77876 1 2.1277V10.1759Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Description — full width of col3+col4 */}
            <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] whitespace-pre-line mb-4" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
              {company.description ?? ""}
            </p>

            {/* Mobile only: Save/Share/Report below description, left-aligned */}
            <div className="flex lg:hidden items-center gap-4">
              <button onClick={handleToggleSave} className="group flex items-center gap-2 text-[#333]/35 transition-colors">
                <span className={`font-bam text-[9px] ${company.bookmarkCount ? 'text-[#F14110]' : '#666'}`}>{String(company.bookmarkCount ?? 0).padStart(2, '0')}</span>
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
                <svg width="15" height="17" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                  style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
                >
                  <path d="M1 16.4545V10.1759M1 10.1759C5.90894 6.26941 9.59106 14.0823 14.5 10.1759V2.1277C9.59106 6.03416 5.90894 -1.77876 1 2.1277V10.1759Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Photos Grid + Services - Mobile: stack, Desktop: side by side */}
        <div className={`grid grid-cols-1 ${!reviewsEnabled ? 'lg:grid-cols-[440px_1fr]' : ''} gap-6 lg:gap-5 mb-8`}>
          {/* Only render grid if there are actual images and reviews are not enabled */}
          {!reviewsEnabled && (
            <ProjectImagesGrid
              imageUrls={company.projectImageUrls ?? []}
              allProjectImageUrls={allProjectImageUrls}
              onImageClick={handleImageClick}
            />
          )}

          {proEnabled && (
          <div>
            <p className="font-bam text-[9px] text-[#333] mb-4">Services provided:</p>
            {/* Mobile: horizontal scroll cards */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {(company.projectSizes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">PROJECT SIZE</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.projectSizes!)}</p>
                  </div>
                )}
                {(company.constructionTypes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">CONSTRUCTION</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.constructionTypes!)}</p>
                  </div>
                )}
                {(company.renovationTypes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">RENOVATION</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.renovationTypes!)}</p>
                  </div>
                )}
                {(company.architectureTypes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">ARCHITECTURE</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.architectureTypes!)}</p>
                  </div>
                )}
                {(company.interiorTypes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">INTERIOR</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.interiorTypes!)}</p>
                  </div>
                )}
                {(company.realEstateTypes?.length ?? 0) > 0 && (
                  <div className="min-w-[160px] flex-shrink-0">
                    <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">REAL ESTATE</p>
                    <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.realEstateTypes!)}</p>
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
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.projectSizes!)}</p>
                </div>
              )}
              {(company.constructionTypes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">CONSTRUCTION</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.constructionTypes!)}</p>
                </div>
              )}
              {(company.renovationTypes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">RENOVATION</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.renovationTypes!)}</p>
                </div>
              )}
              {(company.architectureTypes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">ARCHITECTURE</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.architectureTypes!)}</p>
                </div>
              )}
              {(company.interiorTypes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">INTERIOR</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.interiorTypes!)}</p>
                </div>
              )}
              {(company.realEstateTypes?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">REAL ESTATE</p>
                  <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{capitalizeJoin(company.realEstateTypes!)}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">LOCATION</p>
                <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{company.location ?? "Bali"}</p>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Testimonials Section */}
        {reviewsEnabled && <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Latest testimonials /</p>
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
                  Write a Testimonial
                </button>
              )}
              <Link
                href={company ? buildCompanyReviewsPath(company) : "/"}
                className="rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors flex items-center justify-center"
                style={{ width: '140px', height: '40px' }}
              >
                See all
              </Link>
            </div>
          </div>

          {/* Mobile: 3 testimonials full width */}
          <div className="lg:hidden space-y-5">
            {reviewsList.slice(0, 3).map((review, index) => (
              <ReviewCard key={index} {...review} mobile />
            ))}
          </div>
          {/* Desktop: 4 testimonials in grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5">
            {reviewsList.slice(0, 4).map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
          {/* Mobile: Write a Testimonial button */}
          {clerkUser && currentUser && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="sm:hidden mt-4 h-[40px] px-6 rounded-full bg-[#f14110] text-[11px] font-medium text-white tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
            >
              Write a Testimonial
            </button>
          )}
        </div>}

        {/* Featured Articles */}
        {companyArticles && companyArticles.length > 0 && (
          <div className="mb-8">
            <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-4">Featured Articles</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyArticles.map((article) => (
                <Link
                  key={article._id}
                  href={`/article/${article._id}`}
                  className="bg-white rounded-[8px] border border-[#e4e4e4] overflow-hidden hover:border-[#333] transition-colors"
                >
                  {article.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.coverImageUrl} alt={article.title} className="w-full aspect-video object-cover" />
                  ) : article.coverImageId ? (
                    <div className="w-full aspect-video bg-[#d8d8d8] relative">
                      <StorageImage storageId={article.coverImageId} alt={article.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-[#f5f5f5] flex items-center justify-center">
                      <span className="text-[10px] text-[#333]/30">No image</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-[12px] font-medium text-[#333] leading-tight mb-1">{article.title}</p>
                    {article.subtitle && (
                      <p className="text-[10px] text-[#333]/50 line-clamp-2">{article.subtitle}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8 border-t border-[#333]/10 pt-4">
          {adjacentIds?.prevCompany ? (
            <Link
              href={buildCompanyProfilePath(adjacentIds.prevCompany)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
            >
              <svg width="8" height="5" viewBox="0 0 16 10" fill="none" className="flex-shrink-0"><path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>PREVIOUS</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333]/30 tracking-[0.22px]">
              <svg width="8" height="5" viewBox="0 0 16 10" fill="none" className="flex-shrink-0"><path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>PREVIOUS</span>
            </span>
          )}
          {adjacentIds?.nextCompany ? (
            <Link
              href={buildCompanyProfilePath(adjacentIds.nextCompany)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors"
            >
              <span>NEXT</span>
              <svg width="8" height="5" viewBox="0 0 16 10" fill="none" className="flex-shrink-0"><path d="M15 5H1M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#333]/30 tracking-[0.22px]">
              <span>NEXT</span>
              <svg width="8" height="5" viewBox="0 0 16 10" fill="none" className="flex-shrink-0"><path d="M15 5H1M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner alt="Advertisement" />
        </div>
      </main>

      <Footer />

      {/* Testimonial Modals */}
      {reviewsEnabled && validId && currentUser && (
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

      {/* Image Viewer Modal */}
      {showImageViewer && currentImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
          <div className="absolute inset-0" onClick={() => { setShowImageViewer(false); setCurrentImage(null); }} />
          <div className="relative z-10 max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4">
            <button
              onClick={() => { setShowImageViewer(false); setCurrentImage(null); }}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
                <path d="M1 1L15 15M1 15L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <img 
              src={currentImage.src} 
              alt={currentImage.alt} 
              className="max-w-full max-h-[85vh] object-contain rounded-[6px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
