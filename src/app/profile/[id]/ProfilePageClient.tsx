"use client";

import { useState, useEffect, useMemo, useRef, type TouchEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { AdBanner } from "@/components/AdBanner";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { ThankYouModal } from "@/components/ThankYouModal";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { starFillColor, starColor } from "@/lib/starColors";
import { buildCompanyAddressHref } from '@/lib/company-address-link.mjs';
import { buildCompanyProfilePath, buildCompanyReviewsPath } from '@/lib/company-profile-url.mjs';
import { buildCategoryOptionLabelMap, expandProfileProjectSizes, formatProfileCategoryValues } from "@/lib/category-display.mjs";

/** Profile service values use the same full-caps treatment as category values. */
function uppercaseJoin(arr: string[]): string {
  return arr
    .map((s) => s.replace(/-/g, " ").trim().toUpperCase())
    .join(", ");
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function getCompanyInitials(companyName: string): string {
  return companyName
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isWeakExternalLogoUrl(url?: string) {
  return Boolean(url && /\/\/lh3\.googleusercontent\.com\/sitesv\//i.test(url));
}

function useStorageUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(api.files.getUrl, storageId ? { storageId } : "skip");
}

function StorageImage({ storageId, alt, className, width, height, fill, sizes }: { storageId: Id<"_storage">; alt: string; className?: string; width?: number; height?: number; fill?: boolean; sizes?: string }) {
  const url = useStorageUrl(storageId);
  if (!url) return <div className={className} style={{ width, height, background: '#d8d8d8' }} />;
  return fill ? <Image src={url} alt={alt} fill sizes={sizes ?? "210px"} className={className} unoptimized /> : <Image src={url} alt={alt} width={width ?? 210} height={height ?? 210} className={className} unoptimized />;
}

function StorageModalImage({ storageId, alt }: { storageId: Id<"_storage">; alt: string }) {
  const url = useStorageUrl(storageId);
  if (!url) return <div className="h-[240px] w-[320px] max-w-full rounded-[6px] bg-[#d8d8d8]" />;
  return (
    <img
      src={url}
      alt={alt}
      className="block h-auto max-h-[58vh] max-w-full rounded-[6px] object-contain sm:max-h-[72vh]"
    />
  );
}

function ExternalImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={className}
        aria-label={`${alt} unavailable`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%23ccc'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23ccc'/%3E%3C/svg%3E")`,
          backgroundSize: '10px 10px',
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function formatWhatsApp(num: string): string {
  return num.replace(/^[+0]+/, "");
}

type ProjectImageItem =
  | { kind: "external"; src: string; alt: string }
  | { kind: "storage"; storageId: Id<"_storage">; alt: string };

const PROFILE_ADDRESS_MAX_CHARS = 150;

function formatProfileAddress(address: string | undefined): string {
  const trimmed = address?.trim();
  if (!trimmed) return "-";
  if (trimmed.length <= PROFILE_ADDRESS_MAX_CHARS) return trimmed;

  const clipped = trimmed.slice(0, PROFILE_ADDRESS_MAX_CHARS).trimEnd();
  const clippedAtWord = clipped.replace(/\s+\S*$/, "").trimEnd();
  return `${clippedAtWord || clipped}[...]`;
}

function ProjectStorageImageTile({
  image,
  index,
  onImageClick,
}: {
  image: Extract<ProjectImageItem, { kind: "storage" }>;
  index: number;
  onImageClick: (index: number) => void;
}) {
  const url = useStorageUrl(image.storageId);

  return (
    <div
      className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => url && onImageClick(index)}
    >
      {url ? (
        <Image
          src={url}
          alt={image.alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 23vw, 105px"
          className="object-cover"
        />
      ) : null}
    </div>
  );
}

function ProjectImagesGrid({
  items,
  onImageClick,
}: {
  items: ProjectImageItem[];
  onImageClick: (index: number) => void;
}) {
  if (items.length === 0) return <div />;

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {items.map((image, index) =>
        image.kind === "external" ? (
          <div
            key={`img-url-${image.src}-${index}`}
            className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(index)}
          >
            <ExternalImage
              src={image.src}
              alt={image.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : (
          <ProjectStorageImageTile
            key={`img-storage-${image.storageId}`}
            image={image}
            index={index}
            onImageClick={onImageClick}
          />
        )
      )}
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
              className="w-[140px] h-[40px] border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] rounded-full hover:border-[#f14110] hover:text-[#f14110] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

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

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

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
  const pageConfigs = useQuery(api.pageConfigs.listVisible);
  const categoryLabelMap = useMemo(() => buildCategoryOptionLabelMap(pageConfigs ?? []), [pageConfigs]);

  const toggleSave = useMutation(api.savedListings.toggle);
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

  const externalProjectImages = (company?.projectImageUrls ?? []).filter(Boolean);
  const allProjectImages: ProjectImageItem[] = [
    ...externalProjectImages.map((src, index) => ({
      kind: "external" as const,
      src,
      alt: `Project ${index + 1}`,
    })),
    ...(company?.projectImageIds ?? []).map((storageId, index) => ({
      kind: "storage" as const,
      storageId,
      alt: `Project ${externalProjectImages.length + index + 1}`,
    })),
  ];
  const projectImages = company?.isPro && proEnabled ? allProjectImages : allProjectImages.slice(0, 4);
  const currentImage = currentImageIndex !== null ? projectImages[currentImageIndex] ?? null : null;
  const isFirstImage = currentImageIndex === 0;
  const isLastImage = currentImageIndex === projectImages.length - 1;
  const profileAddress = formatProfileAddress(company?.address);
  const hasReviewedThisCompany = Boolean(
    currentUser && reviews?.some((review) => review.userId === currentUser._id)
  );
  const canWriteReview = reviews !== undefined && currentUser?.accountType === "individual" && !hasReviewedThisCompany;
  const closeImageViewer = () => {
    setShowImageViewer(false);
    setCurrentImageIndex(null);
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((index) => (index === null || index <= 0 ? index : index - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((index) => (index === null || index >= projectImages.length - 1 ? index : index + 1));
  };

  const handleViewerTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleViewerTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      goToNextImage();
      return;
    }

    goToPreviousImage();
  };

  useEffect(() => {
    if (!showImageViewer) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImageViewer();
      }

      if (event.key === "ArrowLeft") {
        goToPreviousImage();
      }

      if (event.key === "ArrowRight") {
        goToNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageViewer, projectImages.length]);

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
      <>
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
      </>
    );
  }

  if (company === null) {
    return (
      <>
        <main className="max-w-[900px] mx-auto px-6 py-8 flex-grow w-full">
          <p className="text-[#333]">Company not found.</p>
        </main>
      </>
    );
  }

  const profileLocations = uniqueValues([
    ...(company.constructionLocations ?? []),
    ...(company.renovationLocations ?? []),
    ...(company.architectureLocations ?? []),
    ...(company.interiorLocations ?? []),
    ...(company.realEstateLocations ?? []),
  ]);
  const profileLocationValue = profileLocations.length > 0
    ? uppercaseJoin(profileLocations)
    : uppercaseJoin([company.location ?? "bali"]);
  const profileMetaServices = [
    (company.projectSizes?.length ?? 0) > 0
      ? { label: "PROJECT SIZE", value: uppercaseJoin(expandProfileProjectSizes(company.projectSizes!)) }
      : null,
    { label: "LOCATION", value: profileLocationValue },
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const workCategoryServices = [
    (company.constructionTypes?.length ?? 0) > 0
      ? { label: "CONSTRUCTION", value: formatProfileCategoryValues(company.constructionTypes!, categoryLabelMap, "construction") }
      : null,
    (company.renovationTypes?.length ?? 0) > 0
      ? { label: "RENOVATION", value: formatProfileCategoryValues(company.renovationTypes!, categoryLabelMap, "renovation") }
      : null,
    (company.architectureTypes?.length ?? 0) > 0
      ? { label: "ARCHITECTURE", value: formatProfileCategoryValues(company.architectureTypes!, categoryLabelMap, "architecture") }
      : null,
    (company.interiorTypes?.length ?? 0) > 0
      ? { label: "INTERIOR", value: formatProfileCategoryValues(company.interiorTypes!, categoryLabelMap, "interior") }
      : null,
    (company.realEstateTypes?.length ?? 0) > 0
      ? { label: "REAL ESTATE", value: formatProfileCategoryValues(company.realEstateTypes!, categoryLabelMap, "real-estate") }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const reviewsList = (reviews ?? []).map((r) => ({
    name: r.userName,
    rating: r.rating,
    text: r.content,
    date: new Date(r.createdAt).toLocaleDateString("en-CA").replace(/-/g, "/"),
  }));

  return (
    <>
      <main className="max-w-[900px] mx-auto px-4 sm:px-0 sm:pb-8 flex-grow w-full">
        {/* Company Name + Desktop Actions */}
        <div className="mb-4 flex items-start justify-between gap-4 sm:mb-6">
          <h1 className="text-[20px] sm:text-[26px] font-semibold text-[#333] leading-tight sm:leading-[30px]">
            {company.name}
          </h1>
          <div className="hidden lg:flex items-center justify-end gap-6 pt-1">
            <button
              onClick={handleToggleSave}
              aria-label="Bookmark company"
              className="group flex items-center gap-2 text-[#333]/35 transition-colors"
            >
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
            <button
              onClick={handleShare}
              aria-label="Share company"
              className="group relative flex items-center text-[#333]/35 transition-colors"
            >
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
            <button
              onClick={() => setShowReportModal(true)}
              aria-label="Report company"
              className="group flex items-center text-[#333]/35 transition-colors"
            >
              <svg width="15" height="17" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"
                className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
              >
                <path d="M1 16.4545V10.1759M1 10.1759C5.90894 6.26941 9.59106 14.0823 14.5 10.1759V2.1277C9.59106 6.03416 5.90894 -1.77876 1 2.1277V10.1759Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[440px_1fr] lg:gap-5 mb-8">
          <div className="space-y-3 lg:self-start">
            <div className="grid grid-cols-[160px_1fr] gap-4 lg:grid-cols-2 lg:gap-5">
              {/* Logo */}
              <div className="w-full lg:self-start">
                <div className="w-full aspect-square rounded-[6px] bg-[#d8d8d8] overflow-hidden relative">
                  {company.logoId ? (
                    <StorageImage storageId={company.logoId} alt={company.name} fill className="object-cover w-full h-full" />
                  ) : company.imageUrl && !isWeakExternalLogoUrl(company.imageUrl) ? (
                    <ExternalImage
                      src={company.imageUrl}
                      alt={company.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#d8d8d8]">
                      <span className="text-[38px] font-bold text-[#333]">{getCompanyInitials(company.name)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="w-full flex flex-col h-[160px] lg:h-[210px] lg:self-start">
                <div className="h-[32px] flex items-center border-b border-[#333]/10">
                  <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                    Tel. {company.phone || "-"}
                  </p>
                </div>

                <div className="h-[32px] flex items-center border-b border-[#333]/10 mb-4">
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
                <div className="flex items-center gap-5 mb-2 lg:mb-6" style={{ height: 20 }}>
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
                <div className="flex flex-col lg:mt-auto">
                  <a
                    href={buildCompanyAddressHref(company)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full cursor-pointer flex-col items-start gap-1.5"
                  >
                    <svg width="14" height="17" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#333] group-hover:text-[#f14110] transition-colors flex-shrink-0">
                      <path d="M8 1C4.13 1 1 4.13 1 8C1 13.5 8 19 8 19C8 19 15 13.5 15 8C15 4.13 11.87 1 8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span
                      className="font-bam w-full break-words text-[9px] leading-[14px] text-[#333]/50 transition-colors group-hover:text-[#f14110]"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                        overflow: "hidden",
                      }}
                    >
                      {profileAddress}
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile only: Save/Share/Report directly above the project thumbnails */}
            <div className="mt-3 flex lg:hidden items-center gap-4">
              <button onClick={handleToggleSave} aria-label="Bookmark company" className="group flex items-center gap-1.5 text-[#333]/35 transition-colors">
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
              <button onClick={handleShare} aria-label="Share company" className="group flex items-center text-[#333]/35 transition-colors relative">
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
              <button onClick={() => setShowReportModal(true)} aria-label="Report company" className="group flex items-center text-[#333]/35 transition-colors">
                <svg width="15" height="17" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="stroke-[#D8D8D8] group-hover:stroke-[#f14110] transition-colors"
                  style={{ strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}
                >
                  <path d="M1 16.4545V10.1759M1 10.1759C5.90894 6.26941 9.59106 14.0823 14.5 10.1759V2.1277C9.59106 6.03416 5.90894 -1.77876 1 2.1277V10.1759Z" />
                </svg>
              </button>
            </div>

            {projectImages.length > 0 && (
              <ProjectImagesGrid
                items={projectImages}
                onImageClick={handleImageClick}
              />
            )}
          </div>

          {/* Profile stats and description */}
          <div className="lg:self-start">

            <div className="mb-4">
              <div className="w-full">
                <div className="h-[32px] flex items-center justify-between border-b border-[#333]/10">
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Projects</span>
                  <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{company.projects ?? 0}</span>
                </div>
                <div className="h-[32px] flex items-center justify-between border-b border-[#333]/10">
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Team</span>
                  <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">+{company.teamSize ?? 0}</span>
                </div>
                <div className="h-[32px] flex items-center justify-between border-b border-[#333]/10">
                  <span className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Since</span>
                  <span className="text-[18px] font-semibold text-[#333] tracking-[0.36px]">{company.since ?? new Date(company.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[10px] text-[#333] leading-[18px] tracking-[0.2px] whitespace-pre-line mb-4" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
              {company.description ?? ""}
            </p>
            <div className="space-y-1 font-bam text-[9px] leading-[13px] text-[#333]/35 tracking-[0.18px]">
              <p>*SolidFind lists this company based on publicly available information and has not independently verified their work quality or operating status.</p>
              {company.isReviewed === false && (
                <p>**This listing has not been confirmed by the company.</p>
              )}
            </div>

          </div>
        </div>

        {/* Services */}
        <div className="mb-8">
          {proEnabled && (
            <div className="space-y-6">
              {profileMetaServices.length > 0 && (
                <div className="grid grid-cols-2 gap-x-5 gap-y-5 lg:grid-cols-4">
                  {profileMetaServices.map((service) => (
                    <div key={service.label}>
                      <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">{service.label}</p>
                      <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{service.value}</p>
                    </div>
                  ))}
                </div>
              )}
              {workCategoryServices.length > 0 && (
                <div className="grid grid-cols-2 gap-x-5 gap-y-6 lg:grid-cols-4">
                  {workCategoryServices.map((service) => (
                    <div key={service.label}>
                      <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">{service.label}</p>
                      <p className="text-[10px] text-[#333]/50 leading-[18px] tracking-[0.2px]">{service.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        {reviewsEnabled && <div className="mb-8 border-t border-[#333]/10 pt-4">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={(company.reviewCount ?? 0) > 0 ? "" : "opacity-50"}>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Latest testimonials /</p>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">Ulasan terbaru</p>
              </div>
              {(company.reviewCount ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <svg width="16" height="15" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.93511 0.71955C8.31202 -0.239851 9.68798 -0.23985 10.0649 0.719551L11.6204 4.67914C11.7825 5.09161 12.1742 5.37238 12.6219 5.39695L16.9196 5.63291C17.9609 5.69008 18.3861 6.98113 17.5777 7.63124L14.2414 10.3144C13.8938 10.5939 13.7442 11.0481 13.8589 11.4758L14.9595 15.5812C15.2262 16.576 14.113 17.3739 13.2364 16.8163L9.61892 14.5149C9.24208 14.2752 8.75792 14.2752 8.38108 14.5149L4.76355 16.8163C3.88703 17.3739 2.77385 16.576 3.04053 15.5812L4.14114 11.4758C4.25579 11.0481 4.10618 10.5939 3.75863 10.3144L0.422255 7.63124C-0.386142 6.98113 0.0390565 5.69008 1.08039 5.63291L5.37814 5.39695C5.82584 5.37238 6.21753 5.09161 6.37957 4.67914L7.93511 0.71955Z" fill={starColor(company.rating ?? 0)}/>
                  </svg>
                  <span className="font-bam text-[18px] font-bold tracking-[-0.2em]" style={{ color: starColor(company.rating ?? 0) }}>{company.rating ?? 0}</span>
                  <span className="text-[10px] tracking-[0.2px]" style={{ color: starColor(company.rating ?? 0) + 'B3' }}>({company.reviewCount ?? 0})</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {clerkUser && canWriteReview && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="hidden sm:flex rounded-full bg-[#f14110] text-[11px] font-medium text-white tracking-[0.22px] hover:bg-[#d93a0e] transition-colors items-center justify-center"
                  style={{ width: '140px', height: '40px' }}
                >
                  Write a Testimonial
                </button>
              )}
              {(company.reviewCount ?? 0) > 0 && (
                <Link
                  href={company ? buildCompanyReviewsPath(company) : "/"}
                  className="rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors flex items-center justify-center"
                  style={{ width: '140px', height: '40px' }}
                >
                  See all
                </Link>
              )}
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
          {clerkUser && canWriteReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="sm:hidden mt-4 rounded-full bg-[#f14110] text-[11px] font-medium text-white tracking-[0.22px] hover:bg-[#d93a0e] transition-colors inline-flex items-center justify-center"
              style={{ width: '140px', height: '40px' }}
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

      {/* Testimonial Modals */}
      {reviewsEnabled && validId && currentUser && canWriteReview && (
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
          <div className="absolute inset-0" onClick={closeImageViewer} />
          <div className="relative z-10 flex h-full w-full items-center justify-center px-4 py-6">
            <div
              className="relative inline-flex max-h-[58vh] max-w-[90vw] items-center justify-center rounded-[6px] sm:max-h-[72vh] sm:max-w-[92vw]"
              onTouchStart={handleViewerTouchStart}
              onTouchEnd={handleViewerTouchEnd}
            >
              {currentImage.kind === "external" ? (
                <img
                  src={currentImage.src}
                  alt={currentImage.alt}
                  className="block h-auto max-h-[58vh] max-w-full object-contain rounded-[6px] sm:max-h-[72vh]"
                />
              ) : (
                <StorageModalImage
                  storageId={currentImage.storageId}
                  alt={currentImage.alt}
                />
              )}

              <div className="absolute left-0 right-0 bottom-[calc(100%+10px)] flex items-center justify-between gap-3">
                <span className="font-bam text-[9px] uppercase tracking-[0.18px] text-white/65">
                  {currentImageIndex !== null ? `${currentImageIndex + 1} / ${projectImages.length}` : ""}
                </span>
                <button
                  type="button"
                  onClick={closeImageViewer}
                  aria-label="Close image viewer"
                  className="inline-flex h-6 w-6 items-center justify-center text-white transition-colors hover:text-[#f14110]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2L14 14M2 14L14 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="absolute left-0 right-0 top-[calc(100%+10px)] flex items-center justify-between gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={goToPreviousImage}
                  disabled={isFirstImage}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22px] text-white transition-colors hover:text-[#f14110] disabled:text-white/25 disabled:hover:text-white/25"
                >
                  <svg width="8" height="5" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M1 5H15M1 5L5 1M1 5L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={goToNextImage}
                  disabled={isLastImage}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22px] text-white transition-colors hover:text-[#f14110] disabled:text-white/25 disabled:hover:text-white/25"
                >
                  <span>Next</span>
                  <svg width="8" height="5" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                    <path d="M15 5H1M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="absolute bottom-6 font-bam text-[9px] uppercase tracking-[0.18px] text-white/45 sm:hidden">
              Swipe to navigate
            </p>
          </div>
        </div>
      )}
    </>
  );
}
