"use client";

import { useState, useEffect, useMemo, useRef, type TouchEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { ThankYouModal } from "@/components/ThankYouModal";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { Star } from "lucide-react";
import { starFillColor, starColor } from "@/lib/starColors";
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
  return num.replace(/[^0-9]/g, "");
}

function normalizeSocialHandle(value: string | undefined, prefix: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${prefix}${trimmed.replace(/^@/, "")}`;
}

const socialGlyphs = {
  email: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.05L2 22l5.07-1.33A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.93-.2-.31A8.2 8.2 0 1 1 12 20.2Zm4.5-6.13c-.25-.13-1.46-.72-1.69-.8-.23-.08-.39-.13-.56.13-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.11-.5.11-.12.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.6.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M14 8.5V7c0-.7.3-1 1-1h1.5V3H14c-2.2 0-3.5 1.4-3.5 3.7V8.5H8V11.5h2.5V21H14v-9.5h2.4l.4-3H14Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
      <rect x="1" y="1" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
      <path fillRule="evenodd" clipRule="evenodd" d="M4 11.1942H6.31836V19H4V11.1942ZM11.4785 13.1344C10.2734 13.1344 10.0879 14.1199 10.0879 15.138V19H7.77148V11.1942H9.99609V12.2614H10.0273C10.3379 11.6481 11.0938 11 12.2207 11C14.5664 11 15 12.6172 15 14.7189V19H12.6836V15.2034C12.6836 14.2977 12.666 13.1344 11.4785 13.1344Z" fill="currentColor" />
      <circle cx="5" cy="9" r="1" fill="currentColor" />
    </svg>
  ),
};

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

function DetailGalleryThumb({
  image,
  index,
  onImageClick,
}: {
  image: ProjectImageItem;
  index: number;
  onImageClick: (index: number) => void;
}) {
  const storageUrl = useStorageUrl(image.kind === "storage" ? image.storageId : undefined);
  const src = image.kind === "external" ? image.src : storageUrl;

  return (
    <button
      type="button"
      className="sf-thumb sf-thumb-clickable"
      style={src ? { backgroundImage: `url(${src})` } : undefined}
      onClick={() => src && onImageClick(index)}
      aria-label={`Open project image ${index + 1}`}
    />
  );
}

function DetailGallery({
  items,
  onImageClick,
}: {
  items: ProjectImageItem[];
  onImageClick: (index: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="sf-gallery">
      {items.map((image, index) => (
        <DetailGalleryThumb
          key={image.kind === "external" ? `detail-url-${image.src}-${index}` : `detail-storage-${image.storageId}`}
          image={image}
          index={index}
          onImageClick={onImageClick}
        />
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
      <main className="sf-detail">
        <div className="sf-skel sf-skel-back" />
        <section className="sf-detail-hero sf-skel" />
        <div className="sf-detail-body">
          <section className="sf-detail-main">
            <div className="sf-skel sf-skel-title" />
            <div className="sf-skel-lines">
              <span />
              <span />
              <span />
            </div>
            <div className="sf-work-head">
              <div className="sf-skel sf-skel-title" />
              <div className="sf-skel sf-skel-chip" />
            </div>
            <div className="sf-gallery">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="sf-thumb sf-skel" key={index} />
              ))}
            </div>
          </section>
          <aside className="sf-detail-side">
            <div className="sf-detail-card">
              <div className="sf-skel sf-skel-chip" />
              <div className="sf-skel-lines">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </aside>
        </div>
      </main>
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
  const heroImage = externalProjectImages[0] || company.imageUrl || "/assets/company-cover-fallback.jpg";
  const showProfileReviews = reviewsEnabled && (company.reviewCount ?? 0) > 0;
  const accountLabel = proEnabled ? (company.isPro ? "Pro Account" : "Free account") : null;
  const foundedYear = company.since ?? new Date(company.createdAt).getFullYear();
  const servicesForDetail = workCategoryServices.length > 0
    ? workCategoryServices
    : [{ label: company.category?.replace(/-/g, " ").toUpperCase() || "SERVICES", value: company.subcategory?.replace(/-/g, " ").toUpperCase() || "GENERAL" }];
  const projectSizeValue = profileMetaServices.find((item) => item.label === "PROJECT SIZE")?.value || "-";
  const socialLinks = [
    company.email ? { key: "email" as const, label: "Email", href: `mailto:${company.email}` } : null,
    company.whatsapp ? { key: "whatsapp" as const, label: "WhatsApp", href: `https://wa.me/${formatWhatsApp(company.whatsapp)}` } : null,
    company.facebook ? { key: "facebook" as const, label: "Facebook", href: normalizeSocialHandle(company.facebook, "https://facebook.com/") } : null,
    company.instagram ? { key: "instagram" as const, label: "Instagram", href: normalizeSocialHandle(company.instagram, "https://instagram.com/") } : null,
    company.linkedin ? { key: "linkedin" as const, label: "LinkedIn", href: normalizeSocialHandle(company.linkedin, "https://linkedin.com/company/") } : null,
  ].filter((item): item is { key: keyof typeof socialGlyphs; label: string; href: string } => Boolean(item?.href));

  return (
    <>
      <main className="sf-detail">
        <button className="sf-back" onClick={() => router.back()}>← Back to results</button>
        <section className="sf-detail-hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="sf-detail-hero-shade" />
          <div className="sf-detail-hero-copy">
            <div className="sf-detail-lockup">
              <span className="sf-detail-logo" aria-hidden="true">{getCompanyInitials(company.name)}</span>
              <div className="sf-detail-lockup-text">
                <h1>{company.name}<span className="dot" /></h1>
                <div className="sf-detail-meta">
                  <span>{profileLocationValue}</span>
                  {showProfileReviews && (
                    <>
                      <span className="dotsep" />
                      <span className="sf-meta-score">
                        <Star className="sf-star" size={13} fill={starColor(company.rating ?? 0)} color={starColor(company.rating ?? 0)} />
                        {company.rating ?? 0} · {company.reviewCount ?? 0} reviews
                      </span>
                    </>
                  )}
                  {accountLabel && (
                    <>
                      <span className="dotsep" />
                      <span>{accountLabel}</span>
                    </>
                  )}
                  <span className="sf-detail-title">{company.category?.replace(/-/g, " ") || "Company"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="sf-detail-body">
          <section className="sf-detail-main">
            <h2 className="sf-h2-static" style={{ marginTop: 0 }}>About</h2>
            <div className="sf-detail-p">
              <p>{company.description ?? `${company.name} is listed on SolidFind for construction, renovation and design projects in Bali.`}</p>
              <p>SolidFind keeps company profiles connected to public details, contact links, service coverage and review activity so visitors can compare professionals with more clarity.</p>
              {company.isReviewed === false && (
                <p>This listing has not yet been confirmed by the company.</p>
              )}
            </div>

            <h2 className="sf-h2-static">Services &amp; coverage</h2>
            <dl className="sf-svc">
              <div className="sf-svc-row">
                <dt className="sf-svc-term">Provided services</dt>
                <dd className="sf-svc-def">
                  {servicesForDetail.map((service) => (
                    <div className="sf-svc-service" key={service.label}>
                      <span className="sf-svc-name">{service.label}</span>
                      <p className="sf-svc-desc">{service.value}</p>
                    </div>
                  ))}
                </dd>
              </div>
              <div className="sf-svc-row">
                <dt className="sf-svc-term">Project size</dt>
                <dd className="sf-svc-def">
                  <p className="sf-svc-desc sf-svc-inline">{projectSizeValue}</p>
                </dd>
              </div>
              <div className="sf-svc-row">
                <dt className="sf-svc-term">Locations</dt>
                <dd className="sf-svc-def">
                  <p className="sf-svc-desc sf-svc-inline">{profileLocationValue}</p>
                </dd>
              </div>
            </dl>

            <div className="sf-work-head">
              <h2 className="sf-h2-static" style={{ margin: 0 }}>Recent work</h2>
              {projectImages.length > 0 && <span className="sf-tag-mono">{projectImages.length} {projectImages.length === 1 ? "project" : "projects"}</span>}
            </div>
            <DetailGallery items={projectImages} onImageClick={handleImageClick} />

            {reviewsEnabled && reviewsList.length > 0 && (
              <>
                <div className="sf-reviews-head">
                  <h2 className="sf-h2-static" style={{ margin: 0 }}>Reviews</h2>
                  <Link className="sf-btn sf-btn-ghost" href={buildCompanyReviewsPath(company)}>See all {company.reviewCount ?? reviewsList.length} reviews →</Link>
                </div>
                <div className="sf-reviews">
                  {reviewsList.slice(0, 2).map((review, index) => (
                    <div className="sf-review" key={`${review.name}-${index}`}>
                      <div className="sf-review-head"><b>{review.name}</b><span>· {review.date}</span></div>
                      <p>"{review.text}"</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {companyArticles && companyArticles.length > 0 && (
              <>
                <div className="sf-work-head">
                  <h2 className="sf-h2-static" style={{ margin: 0 }}>Featured articles</h2>
                  <span className="sf-tag-mono">{companyArticles.length} articles</span>
                </div>
                <div className="sf-gallery">
                  {companyArticles.map((article) => (
                    <Link
                      key={article._id}
                      href={`/article/${article._id}`}
                      className="sf-review"
                    >
                      <div className="sf-review-head"><b>{article.title}</b></div>
                      {article.subtitle && <p>{article.subtitle}</p>}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>

          <aside className="sf-detail-side">
            <div className="sf-detail-card">
              <span className="sf-tag-mono">Company details</span>
              <div className="sf-social">
                {socialLinks.map((social) => (
                  <a
                    key={social.key}
                    className="sf-social-btn"
                    href={social.href}
                    target={social.key === "email" ? undefined : "_blank"}
                    rel={social.key === "email" ? undefined : "noopener noreferrer"}
                    aria-label={social.label}
                    title={social.label}
                  >
                    {socialGlyphs[social.key]}
                  </a>
                ))}
              </div>
              <hr />
              <dl className="sf-kv">
                <dt>Region</dt><dd>{profileLocationValue}</dd>
                <dt>Projects</dt><dd>{company.projects != null ? `${company.projects}+ completed` : "—"}</dd>
                <dt>Team size</dt><dd>{company.teamSize != null ? `${company.teamSize}+ people` : "—"}</dd>
                <dt>Founded</dt><dd>{foundedYear}</dd>
                <dt>Avg. project</dt><dd>IDR 250–600 jt</dd>
                <dt>Languages</dt><dd>Bahasa, English</dd>
              </dl>
              <hr />
              <button className={`sf-btn ${isBookmarked ? "sf-btn-pri" : "sf-btn-ghost"}`} style={{ width: "100%" }} onClick={handleToggleSave}>
                {isBookmarked ? "Saved to shortlist ✓" : "Save to shortlist"}
              </button>
              {reviewsEnabled && currentUser?.accountType === "individual" && canWriteReview && (
                <button className="sf-btn sf-btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => setShowReviewModal(true)}>
                  Write a review
                  <Star size={15} />
                </button>
              )}
              <div className="sf-detail-share-row">
                <button className="sf-btn sf-btn-ghost sf-share-btn" onClick={handleShare}>
                  Share
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
                </button>
                <button className="sf-report" onClick={() => setShowReportModal(true)}>
                  Report
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>
                </button>
              </div>
              {showCopiedToast && <p className="sf-tag-mono" style={{ marginTop: 12, color: "var(--sf-orange)" }}>Link copied</p>}
            </div>
          </aside>
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
