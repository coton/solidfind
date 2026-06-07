"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardHeroMedia } from "@/components/DashboardHeroMedia";
import { useSiteLanguage } from "@/components/LanguageProvider";
import { buildCompanyProfilePath, buildCompanyReviewsPath } from "@/lib/company-profile-url.mjs";
import { starColor } from "@/lib/starColors";
import { ArrowLeft, Star } from "lucide-react";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { calculateProfileCompletionScore, getProfileCompletionStatus } from "@/lib/profile-completion.mjs";
import {
  DEFAULT_PRO_TERMS_EN_TEXT,
  DEFAULT_PRO_TERMS_ID_TEXT,
  parseTermsContent,
  PRO_TERMS_EN_PLATFORM_SETTING_KEY,
  PRO_TERMS_ID_PLATFORM_SETTING_KEY,
} from "@/lib/terms-content.mjs";

const PRICE_DEFAULTS = {
  launch: { monthly: "450000", yearly: "5000000" },
  standard: { monthly: "650000", yearly: "7000000" },
};

function formatIdrPrice(value: string | null | undefined) {
  const amount = Number.parseInt(value ?? "0", 10);
  if (!Number.isFinite(amount) || amount <= 0) return "0";
  return new Intl.NumberFormat("id-ID").format(amount);
}

function formatProPrice(value: string | null | undefined, plan: "monthly" | "yearly") {
  const amount = Number.parseInt(value ?? "0", 10);
  if (!Number.isFinite(amount) || amount <= 0) return "0";
  if (plan === "yearly" && amount >= 1000000) {
    const millionValue = amount / 1000000;
    return `${Number.isInteger(millionValue) ? millionValue.toFixed(0) : millionValue.toFixed(1)}jt`;
  }
  return `${formatIdrPrice(value)}rp`;
}

function ProFeatureIcon({ name }: { name: "star" | "ai" | "stats" | "photos" | "ad" }) {
  return (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[#f14110]" aria-hidden="true">
      {name === "star" && (
        <svg className="h-5 w-5" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.93511 0.71955C8.31202 -0.239851 9.68798 -0.23985 10.0649 0.719551L11.6204 4.67914C11.7825 5.09161 12.1742 5.37238 12.6219 5.39695L16.9196 5.63291C17.9609 5.69008 18.3861 6.98113 17.5777 7.63124L14.2414 10.3144C13.8938 10.5939 13.7442 11.0481 13.8589 11.4758L14.9595 15.5812C15.2262 16.576 14.113 17.3739 13.2364 16.8163L9.61892 14.5149C9.24208 14.2752 8.75792 14.2752 8.38108 14.5149L4.76355 16.8163C3.88703 17.3739 2.77385 16.576 3.04053 15.5812L4.14114 11.4758C4.25579 11.0481 4.10618 10.5939 3.75863 10.3144L0.422255 7.63124C-0.386142 6.98113 0.0390565 5.69008 1.08039 5.63291L5.37814 5.39695C5.82584 5.37238 6.21753 5.09161 6.37957 4.67914L7.93511 0.71955Z" fill="currentColor" />
        </svg>
      )}
      {name === "ai" && (
        <svg className="h-[22px] w-[22px]" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 1V4.25926M11 17.7407V21M21 11H17.7407M4.25926 11H1M18.0711 3.92893L15.7668 6.23317M6.23317 15.7668L3.92893 18.0711M18.0711 18.0711L15.7668 15.7668M6.23317 6.23317L3.92893 3.92893M15.5455 11C15.5455 13.5104 13.5104 15.5455 11 15.5455C8.48962 15.5455 6.45455 13.5104 6.45455 11C6.45455 8.48962 8.48962 6.45455 11 6.45455C13.5104 6.45455 15.5455 8.48962 15.5455 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {name === "stats" && (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C18.6569 0 20 1.34315 20 3V17C20 18.6051 18.7394 19.9158 17.1543 19.9961L17 20H3L2.8457 19.9961C1.31166 19.9184 0.0816253 18.6883 0.00390625 17.1543L0 17V3C0 1.34315 1.34315 6.44255e-08 3 0H17ZM3 2C2.44771 2 2 2.44772 2 3V17C2 17.5523 2.44772 18 3 18H17C17.5523 18 18 17.5523 18 17V3C18 2.44771 17.5523 2 17 2H3ZM6.66699 15.5557H4.44434V4.44434H6.66699V15.5557ZM11.1113 15.5557H8.88867V7.77734H11.1113V15.5557ZM15.5557 15.5557H13.333V10H15.5557V15.5557Z" fill="currentColor" />
        </svg>
      )}
      {name === "photos" && (
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.5 0C18.163 0 18.7987 0.263581 19.2676 0.732422C19.7364 1.20126 20 1.83696 20 2.5V17.5C20 18.163 19.7364 18.7987 19.2676 19.2676C18.7987 19.7364 18.163 20 17.5 20H2.5C1.83696 20 1.20126 19.7364 0.732422 19.2676C0.263581 18.7987 0 18.163 0 17.5V2.5C0 1.83696 0.263581 1.20126 0.732422 0.732422C1.20126 0.263581 1.83696 0 2.5 0H17.5ZM7.99512 18H17.084L12.6963 11.709L7.99512 18ZM2.5 2C2.36739 2 2.24025 2.05272 2.14648 2.14648C2.05272 2.24025 2 2.36739 2 2.5V17.5C2 17.6326 2.05272 17.7597 2.14648 17.8535C2.24025 17.9473 2.36739 18 2.5 18H5.49902L11.0938 10.5117C11.2832 10.258 11.5302 10.0527 11.8145 9.91309C12.0986 9.77355 12.412 9.70387 12.7285 9.70898C13.0452 9.71416 13.3562 9.79456 13.6357 9.94336C13.9153 10.0922 14.1558 10.3047 14.3369 10.5645L18 15.8164V2.5C18 2.36739 17.9473 2.24025 17.8535 2.14648C17.7597 2.05272 17.6326 2 17.5 2H2.5ZM7 3.5C7.92826 3.5 8.81823 3.86901 9.47461 4.52539C10.131 5.18177 10.5 6.07174 10.5 7C10.5 7.92826 10.131 8.81823 9.47461 9.47461C8.81823 10.131 7.92826 10.5 7 10.5C6.07174 10.5 5.18177 10.131 4.52539 9.47461C3.86901 8.81823 3.5 7.92826 3.5 7C3.5 6.07174 3.86901 5.18177 4.52539 4.52539C5.18177 3.86901 6.07174 3.5 7 3.5ZM7 5.5C6.60218 5.5 6.22076 5.65815 5.93945 5.93945C5.65815 6.22076 5.5 6.60218 5.5 7C5.5 7.39782 5.65815 7.77924 5.93945 8.06055C6.22076 8.34185 6.60218 8.5 7 8.5C7.39782 8.5 7.77924 8.34185 8.06055 8.06055C8.34185 7.77924 8.5 7.39782 8.5 7C8.5 6.60218 8.34185 6.22076 8.06055 5.93945C7.77924 5.65815 7.39782 5.5 7 5.5Z" fill="currentColor" />
        </svg>
      )}
      {name === "ad" && (
        <svg className="h-5 w-6" viewBox="0 0 26 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5942 19.7313V15.9813H16.9148V14.7313H20.5942V10.9813H21.8206V14.7313H25.5V15.9813H21.8206V19.7313H20.5942ZM2.48072 20.5C1.91655 20.5 1.44519 20.3075 1.06662 19.9225C0.688059 19.5375 0.499185 19.0571 0.500003 18.4813V2.51875C0.500003 1.94375 0.688876 1.46375 1.06662 1.07875C1.44437 0.69375 1.91574 0.500833 2.48072 0.5H18.1425C18.7067 0.5 19.1776 0.692916 19.5554 1.07875C19.9331 1.46458 20.1224 1.945 20.1232 2.52V8H18.8968V4.73125H1.72645V18.4813C1.72645 18.7054 1.79718 18.8896 1.93863 19.0337C2.08008 19.1779 2.26078 19.25 2.48072 19.25H17.6703V20.5H2.48072ZM1.72645 3.48125H18.8968V2.51875C18.8968 2.29458 18.8257 2.11042 18.6834 1.96625C18.5427 1.82208 18.3621 1.75 18.1413 1.75H2.48072C2.25996 1.75 2.07926 1.82208 1.93863 1.96625C1.79718 2.11042 1.72645 2.295 1.72645 2.52V3.48125Z" fill="currentColor" />
          <path d="M1.72645 3.48125H18.8968V2.51875C18.8968 2.29458 18.8257 2.11042 18.6834 1.96625C18.5427 1.82208 18.3621 1.75 18.1413 1.75H2.48072C2.25996 1.75 2.07926 1.82208 1.93863 1.96625C1.79718 2.11042 1.72645 2.295 1.72645 2.52V3.48125ZM1.72645 3.48125V1.75M20.5942 19.7313V15.9813H16.9148V14.7313H20.5942V10.9813H21.8206V14.7313H25.5V15.9813H21.8206V19.7313H20.5942ZM2.48072 20.5C1.91655 20.5 1.44519 20.3075 1.06662 19.9225C0.688059 19.5375 0.499185 19.0571 0.500003 18.4813V2.51875C0.500003 1.94375 0.688876 1.46375 1.06662 1.07875C1.44437 0.69375 1.91574 0.500833 2.48072 0.5H18.1425C18.7067 0.5 19.1776 0.692916 19.5554 1.07875C19.9331 1.46458 20.1224 1.945 20.1232 2.52V8H18.8968V4.73125H1.72645V18.4813C1.72645 18.7054 1.79718 18.8896 1.93863 19.0337C2.08008 19.1779 2.26078 19.25 2.48072 19.25H17.6703V20.5H2.48072Z" stroke="currentColor" />
        </svg>
      )}
    </span>
  );
}

function ReviewCard({ userName, rating, content, date }: {
  userName: string;
  rating: number;
  content: string;
  date: string;
}) {
  return (
    <div className="bg-white rounded-[6px] p-4">
      <p className="text-[12px] font-semibold text-[#333] mb-2">{userName}</p>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'fill-[#f14110] text-[#f14110]' : 'fill-[#e4e4e4] text-[#e4e4e4]'}`}
          />
        ))}
      </div>
      <p className="text-[9px] text-[#333]/70 leading-[14px] mb-2 line-clamp-4">
        {content}
      </p>
      <p className="text-[9px] text-[#333]/40">{date}</p>
    </div>
  );
}

export default function CompanyDashboardPage() {
  const { t } = useSiteLanguage();
  const proEnabled = useProEnabled();
  const reviewsEnabled = useReviewsEnabled();
  const [showAdModal, setShowAdModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billingPlan, setBillingPlan] = useState<"monthly" | "yearly">("monthly");
  const [proTermsView, setProTermsView] = useState<"english" | "indonesian" | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [proCheckoutError, setProCheckoutError] = useState("");
  const [redirected, setRedirected] = useState(false);
  const [bookmarkWeekStart] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenProModal = searchParams.get("pro") === "1";
  const shouldShowProSuccess = searchParams.get("proSuccess") === "1";
  const checkoutStateParam = searchParams.get("checkout");
  const checkoutState =
    checkoutStateParam === "pending" || checkoutStateParam === "cancelled" || checkoutStateParam === "failure"
      ? checkoutStateParam
      : null;
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const deleteAccount = useMutation(api.users.deleteAccount);
  const createProCheckout = useAction(api.midtrans.createCheckout);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!clerkUser?.id) return;
    await deleteAccount({ clerkId: clerkUser.id });
    await handleSignOut();
  };

  const closeProModal = () => {
    setShowProModal(false);
    setProTermsView(null);
    if (shouldOpenProModal) {
      router.replace("/company-dashboard");
    }
  };

  const closeProSuccess = () => {
    router.replace("/company-dashboard");
  };

  const closeCheckoutState = () => {
    router.replace("/company-dashboard");
  };

  // Check if user has a company and redirect if needed
  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const company = useQuery(
    api.companies.getByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );
  const bookmarkedThisWeek = useQuery(
    api.savedListings.countForCompanySince,
    company?._id ? { companyId: company._id, since: bookmarkWeekStart } : "skip"
  );

  const reviews = useQuery(
    api.reviews.listByCompany,
    company?._id ? { companyId: company._id } : "skip"
  );

  const platformSettings = useQuery(api.platformSettings.getAll);
  const platformMap = new Map((platformSettings ?? []).map((setting) => [setting.key, setting.value]));
  const pricingPhase = platformMap.get("pricing_phase") === "standard" ? "standard" : "launch";
  const monthlyPrice = platformMap.get(`monthly_price_${pricingPhase}`) ?? PRICE_DEFAULTS[pricingPhase].monthly;
  const yearlyPrice = platformMap.get(`yearly_price_${pricingPhase}`) ?? PRICE_DEFAULTS[pricingPhase].yearly;
  const proTermsEnglishText = platformMap.get(PRO_TERMS_EN_PLATFORM_SETTING_KEY) ?? DEFAULT_PRO_TERMS_EN_TEXT;
  const proTermsIndonesianText = platformMap.get(PRO_TERMS_ID_PLATFORM_SETTING_KEY) ?? DEFAULT_PRO_TERMS_ID_TEXT;
  const selectedProTermsSections = parseTermsContent(
    proTermsView === "indonesian" ? proTermsIndonesianText : proTermsEnglishText
  );

  const monthlyViews = useQuery(
    api.profileViews.getMonthlyStats,
    company?._id ? { companyId: company._id } : "skip"
  ) ?? [];

  const viewsLastMonth = useQuery(
    api.profileViews.getViewsLastMonth,
    company?._id ? { companyId: company._id } : "skip"
  ) ?? 0;

  const isPro = company?.isPro ?? false;
  const activeCategories = company
    ? [
      (company.constructionTypes?.length ?? 0) > 0 ? "construction" : null,
      (company.renovationTypes?.length ?? 0) > 0 ? "renovation" : null,
      (company.architectureTypes?.length ?? 0) > 0 ? "architecture" : null,
      (company.interiorTypes?.length ?? 0) > 0 ? "interior" : null,
      (company.realEstateTypes?.length ?? 0) > 0 ? "real-estate" : null,
    ].filter(Boolean)
    : [];
  const companyProfileLocations = company
    ? [
      ...(company.constructionLocations ?? []),
      ...(company.renovationLocations ?? []),
      ...(company.architectureLocations ?? []),
      ...(company.interiorLocations ?? []),
      ...(company.realEstateLocations ?? []),
      ...(company.location?.split(",") ?? []),
    ].filter(Boolean)
    : [];
  const companyProjectImageCount = (company?.projectImageIds?.length ?? 0) + (company?.projectImageUrls?.length ?? 0);
  const profileCompletionScore = calculateProfileCompletionScore(
    {
      companyName: company?.name,
      categories: activeCategories,
      locations: Array.from(new Set(companyProfileLocations)),
      description: company?.description,
      phone: company?.phone,
      whatsapp: company?.whatsapp,
      email: company?.email,
      website: company?.website,
      instagram: company?.instagram,
      facebook: company?.facebook,
      linkedin: company?.linkedin,
      foundedYear: company?.since,
      teamSize: company?.teamSize,
      projects: company?.projects,
      hasLogo: Boolean(company?.logoId || company?.imageUrl),
      projectPhotoCount: companyProjectImageCount,
      isReviewed: company?.isReviewed,
    },
    isPro
  );
  const profileCompletionStatus = getProfileCompletionStatus(profileCompletionScore);

    // Redirect based on account type when no company exists
  if (currentUser && company === null && !redirected) {
    setRedirected(true);
    if (currentUser.accountType === "company") {
      // Company user with no company record yet → create one
      router.push("/register-business");
    } else {
      // Individual user somehow landed here → send to individual dashboard
      router.push("/dashboard");
    }
    return null;
  }

  const data = {
    name: company?.name ?? "Company Name",
    accountType: isPro ? "PRO" : "FREE",
    stats: {
      bookmarked: company?.bookmarkCount ?? 0,
      bookmarkedThisWeek: bookmarkedThisWeek ?? 0,
      viewsLastMonth,
      mostSearchedLocation: "KARANGASEM",
    },
    monthlyViews,
    rating: company?.rating ?? 0,
    reviewCount: company?.reviewCount ?? 0,
    reviews: (reviews ?? []).map((r) => ({
      userName: r.userName,
      rating: r.rating,
      content: r.content,
      date: new Date(r.createdAt).toLocaleDateString("en-CA").replace(/-/g, "/"),
    })),
  };

  const maxViews = Math.max(1, ...data.monthlyViews.map(m => m.views));
  const showProAnalytics = isPro;
  const profilePath = company?._id ? buildCompanyProfilePath(company) : "/";
  const dashboardReviews = data.reviews.map((review, index) => ({
    ...review,
    context: `${index === 0 ? "New" : "Review"} · ${review.date}`,
    isNew: index === 0,
  }));
  const viewsThisMonth = data.monthlyViews.at(-1)?.views ?? data.stats.viewsLastMonth;
  const previousMonthViews = data.monthlyViews.length > 1 ? data.monthlyViews.at(-2)?.views ?? 0 : 0;
  const viewsDelta = previousMonthViews > 0 ? Math.round(((viewsThisMonth - previousMonthViews) / previousMonthViews) * 100) : 0;
  const topLocation = data.stats.mostSearchedLocation || "Bali";
  const completionRing = {
    background: `conic-gradient(var(--sf-peach-300) 0deg, var(--sf-orange) ${profileCompletionScore * 3.6}deg, var(--sf-stone-300) ${profileCompletionScore * 3.6}deg 360deg)`,
  };
  const completionItems = [
    { label: t("Company details"), done: Boolean(company?.name && company?.email && company?.phone) },
    { label: t("Portfolio photos"), done: companyProjectImageCount > 0 },
    { label: t("Licenses & documents"), done: Boolean(company?.isReviewed) },
    { label: t("Service areas"), done: companyProfileLocations.length > 0 },
  ];

  const handleBuyPro = async () => {
    if (!currentUser?._id || !company?._id) {
      setProCheckoutError("Company profile is still loading. Please try again in a moment.");
      return;
    }

    const email =
      company.email ||
      currentUser.email ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      "";

    if (!email) {
      setProCheckoutError("Please add an email address before buying PRO.");
      return;
    }

    setIsCreatingCheckout(true);
    setProCheckoutError("");

    try {
      const result = await createProCheckout({
        userId: currentUser._id,
        companyId: company._id,
        plan: billingPlan,
        email,
        companyName: company.name,
      });

      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        setProCheckoutError("Payment link could not be created. Please try again.");
      }
    } catch (error) {
      setProCheckoutError(error instanceof Error ? error.message : "Payment link could not be created. Please try again.");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="sf-dash flex-grow" data-screen-label="Company dashboard">
        <div className="m-dashboard sm:hidden">
          <div className="m-pad" style={{ paddingTop: 18, paddingBottom: 6 }}>
            <span className="m-eyebrow">{t("Company dashboard")} · <span style={{ color: isPro && proEnabled ? "var(--sf-orange)" : "var(--sf-stone-500)" }}>{isPro && proEnabled ? t("Pro Account") : t("Free account")}</span></span>
            <h1 className="m-dash-hi">{t("Welcome back, [name].").replace("[name]", data.name)}</h1>
            <p className="m-dash-sub">{isPro && proEnabled ? t("Here's how your profile is performing on SolidFind this month. Your Pro Account ranks you above free listings and unlocks the insights below.") : t("You're listed on SolidFind. Complete your profile and upgrade to Pro to get more visibility.")}</p>
          </div>

          <div className="m-pad m-dash-stack">
            <section className="m-card">
              <span className="m-eyebrow">{t("Profile completion")}</span>
              <div className="m-complete">
                <div className="m-ring" style={completionRing}><div className="inner">{profileCompletionScore}%</div></div>
                <ul>
                  {completionItems.map((item) => (
                    <li key={item.label} className={item.done ? "done" : ""}>{item.label}</li>
                  ))}
                </ul>
              </div>
              <div className="m-dash-actions">
                <Link className="m-btn m-btn-ghost" href={profilePath}>{t("View profile")}</Link>
                <Link className="m-btn m-btn-pri" href="/company-dashboard/edit">{t("Edit profile →")}</Link>
              </div>
            </section>

            {isPro && proEnabled && (
              <section className="m-card">
                <div className="m-dash-card-head">
                  <span className="m-eyebrow">{t("Profile views · this month")}</span>
                  <span className="m-pill-pro">{t("Pro")}</span>
                </div>
                <div className="m-insight-row">
                  <span className="m-stat-num">{viewsThisMonth.toLocaleString()}</span>
                  <span className="m-delta">{viewsDelta >= 0 ? "▲" : "▼"} {Math.abs(viewsDelta)}%</span>
                </div>
                <div className="m-stat-label">{t("vs. last month")} · {viewsLastMonth.toLocaleString()} {t("all-time")}</div>
                <div className="m-chart" role="img" aria-label="Monthly profile views">
                  {data.monthlyViews.map((item, index) => (
                    <div className="m-chart-col" key={item.month}>
                      <div className={`m-chart-bar ${index === data.monthlyViews.length - 1 ? "last" : ""}`} style={{ height: `${Math.max(4, Math.round((item.views / maxViews) * 100))}%` }} />
                      <span className="m-chart-m">{item.month.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="m-dash-two">
              <section className="m-card">
                <span className="m-eyebrow">{t("Saved by clients")}</span>
                <div className="m-stat-num">{data.stats.bookmarked}</div>
                <div className="m-stat-label">{t("times bookmarked")}</div>
                <div className="sf-stat-trend"><span>▲</span> {data.stats.bookmarkedThisWeek} {t("this week")}</div>
              </section>
              {isPro && proEnabled && (
                <section className="m-card">
                  <span className="m-eyebrow">{t("Found via")}</span>
                  <div className="m-stat-num m-stat-location">{topLocation}</div>
                  <div className="m-stat-label">{t("top region this month")}</div>
                </section>
              )}
            </div>

            {proEnabled && (
              <section className="m-card m-pro-card">
                <span className="m-eyebrow">{isPro ? t("Promote") : t("Go further")}</span>
                <h3>{isPro ? t("Buy ad space") : t("Get Pro")}</h3>
                <p>{isPro ? t("Sponsored slots on category pages and company profiles put your studio in front of more clients.") : t("Priority placement, analytics, up to 12 photos and ad placements for companies that take visibility seriously.")}</p>
                <button className="m-btn m-btn-pri m-btn-block" type="button" onClick={() => isPro ? setShowAdModal(true) : setShowProModal(true)}>
                  {isPro ? t("Purchase ad space →") : t("Upgrade to Pro →")}
                </button>
              </section>
            )}

            {reviewsEnabled && (
              <section>
                <div className="m-dash-reviews-head">
                  <h2 className="m-h2">{t("Latest reviews")}</h2>
                  {company?._id && data.reviewCount > 0 && <Link href={buildCompanyReviewsPath(company)}>{t("All")} {data.reviewCount} →</Link>}
                </div>
                <div className="m-review-list">
                  {dashboardReviews.length > 0 ? (
                    dashboardReviews.slice(0, 3).map((review, index) => (
                      <div className={`m-review ${review.isNew ? "new" : ""}`} key={`${review.userName}-${index}`}>
                        <div className="m-review-top">
                          <span className="stars">{Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} fill={i < review.rating ? "#f14110" : "none"} color={i < review.rating ? "#f14110" : "#d8d8d8"} />
                          ))}</span>
                          <span className="m-review-when">{review.context}</span>
                        </div>
                        <p>"{review.content}"</p>
                        <div className="m-review-by">{review.userName}</div>
                      </div>
                    ))
                  ) : (
                    <div className="m-review"><p>{t("No reviews yet.")}</p></div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="sf-dash-desktop hidden sm:block">
          <div className="sf-dash-intro">
            <span className="sf-tag-mono">{t("Company dashboard")} · <span className={isPro && proEnabled ? "sf-eyebrow-pro" : ""}>{isPro && proEnabled ? t("Pro Account") : t("Free account")}</span></span>
            <h1 className="sf-dash-hi">{t("Welcome back, [name].").replace("[name]", data.name)}</h1>
            <p className="sf-dash-sub">{isPro && proEnabled ? t("Here's how your profile is performing on SolidFind this month. Your Pro Account ranks you above free listings and unlocks the insights below.") : t("You're listed on SolidFind. Complete your profile to make a strong impression — upgrade to Pro to unlock visibility insights.")}</p>
          </div>

          <div className={`sf-dash-layout ${!isPro && proEnabled ? "sf-dash-layout-free" : ""}`}>
            <div className="sf-dash-main">
              <div className="sf-dash-cards">
                <section className="sf-dash-card">
                  <span className="sf-tag-mono">{t("Profile completion")}</span>
                  <div className="sf-completion">
                    <div className="sf-ring" style={completionRing}><span>{profileCompletionScore}%</span></div>
                    <ul className="sf-completion-list">
                      {completionItems.map((item) => (
                        <li key={item.label} className={item.done ? "done" : ""}>{item.label}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="sf-card-btns">
                    <Link className="sf-btn sf-btn-lg sf-btn-ghost" href={profilePath}>{t("View profile")}</Link>
                    <Link className="sf-btn sf-btn-lg sf-btn-pri" href="/company-dashboard/edit">{t("Edit profile →")}</Link>
                  </div>
                </section>

                {isPro && proEnabled && (
                  <section className="sf-dash-card sf-dash-card-pro">
                    <span className="sf-tag-light">{t("Promote")}</span>
                    <h3>{t("Buy ad space")}</h3>
                    <p>{t("Place sponsored slots on category pages and company profiles to put your studio in front of more clients.")}</p>
                    <button className="sf-btn sf-btn-lg sf-dash-getpro" type="button" onClick={() => setShowAdModal(true)}>{t("Purchase ad space →")}</button>
                  </section>
                )}

                <section className="sf-dash-card sf-dash-card-stat">
                  <span className="sf-tag-mono">{t("Saved by clients")}</span>
                  <div className="sf-stat-num">{data.stats.bookmarked}</div>
                  <div className="sf-stat-label">{t("times your company was bookmarked")}</div>
                  <div className="sf-stat-trend"><span>▲</span> {data.stats.bookmarkedThisWeek} {t("this week")}</div>
                </section>

                {!isPro && proEnabled && (
                  <section className="sf-dash-card sf-dash-card-pro">
                    <span className="sf-tag-light">{t("Go further")}</span>
                    <h3>{t("Get Pro")}</h3>
                    <p>{t("Priority placement, profile analytics, up to 12 photos and ad placements across the platform.")}</p>
                    <button className="sf-btn sf-btn-lg sf-dash-getpro" type="button" onClick={() => setShowProModal(true)}>{t("Upgrade to Pro →")}</button>
                  </section>
                )}
              </div>

              {reviewsEnabled && (
                <section className="sf-dash-reviews">
                  <div className="sf-dash-reviews-head">
                    <h2 className="sf-h2-static">{t("Latest reviews")}</h2>
                    {company?._id && data.reviewCount > 0 && <Link className="sf-btn sf-btn-lg sf-btn-ghost" href={buildCompanyReviewsPath(company)}>{t("See all")} {data.reviewCount} {t("reviews")} →</Link>}
                  </div>
                  <div className="sf-reviews-grid">
                    {dashboardReviews.length > 0 ? (
                      dashboardReviews.slice(0, 4).map((review, index) => (
                        <div className={`sf-review ${review.isNew ? "is-new" : ""}`} key={`${review.userName}-${index}`}>
                          <div className="sf-review-top">
                            <span className="stars">{Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={13} fill={i < review.rating ? "#f14110" : "none"} color={i < review.rating ? "#f14110" : "#d8d8d8"} />
                            ))}</span>
                            <span className="sf-review-when">{review.context}</span>
                          </div>
                          <p>"{review.content}"</p>
                          <div className="sf-review-by">{review.userName}</div>
                        </div>
                      ))
                    ) : (
                      <div className="sf-review"><p>{t("No reviews yet.")}</p><div className="sf-review-by">{t("Review system enabled")}</div></div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {isPro && proEnabled && (
              <aside className="sf-dash-side sf-dash-side-insights">
                <div className="sf-dash-side-head">
                  <h2 className="sf-h2-static">{t("Pro insights")}</h2>
                  <span className="sf-pro-pill">{t("Pro")}</span>
                </div>
                <div className="sf-insight-card">
                  <span className="sf-tag-mono">{t("Profile views · this month")}</span>
                  <div className="sf-insight-row">
                    <div className="sf-stat-num sf-stat-num-sm">{viewsThisMonth.toLocaleString()}</div>
                    <span className={`sf-insight-delta ${viewsDelta >= 0 ? "up" : ""}`}>{viewsDelta >= 0 ? "▲" : "▼"} {Math.abs(viewsDelta)}%</span>
                  </div>
                  <div className="sf-stat-label">{t("vs. last month")} · {viewsLastMonth.toLocaleString()} {t("views all-time")}</div>
                  <div className="sf-chart" role="img" aria-label="Monthly profile views">
                    {data.monthlyViews.map((item) => (
                      <div className="sf-chart-col" key={item.month}>
                        <div className="sf-chart-bar" style={{ height: `${Math.max(4, Math.round((item.views / maxViews) * 100))}%` }}>
                          <span className="sf-chart-val">{item.views}</span>
                        </div>
                        <span className="sf-chart-m">{item.month.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sf-insight-card">
                  <span className="sf-tag-mono">{t("Found through location")}</span>
                  <div className="sf-toploc-big">{topLocation}</div>
                  <p className="sf-toploc-note">{t("The region most clients found you through this month. Keep your service areas complete to stay visible here.")}</p>
                </div>
                <div className="sf-insight-card sf-buyad">
                  <div>
                    <span className="sf-tag-mono">{t("Advertising")}</span>
                    <div className="sf-buyad-head">{t("Promote your profile")}</div>
                    <p>{t("Sponsored placements across SolidFind.")}</p>
                  </div>
                  <button className="sf-btn sf-btn-pri sf-btn-lg" type="button" onClick={() => setShowAdModal(true)}>{t("Buy ad space →")}</button>
                </div>
              </aside>
            )}

            {!isPro && proEnabled && (
              <aside className="sf-dash-side sf-dash-side-pro">
                <div className="sf-dash-side-head">
                  <h2 className="sf-h2-static">{t("What's included in Pro")}</h2>
                </div>
                <div className="sf-insight-card">
                  <div className="sf-adm-points">
                    {[
                      ["Priority placement in search", "Rank above free listings in your category."],
                      ["Up to 12 portfolio photos or videos", "Show four times more work."],
                      ["Full analytics dashboard", "See profile views, reach data and location insights."],
                      ["Ad placement access", "Sponsor slots on category pages and profiles."],
                      ["AI-ready profile formatting", "Optimised for AI-assisted search."],
                    ].map(([heading, sub]) => (
                      <div className="sf-adm-point" key={heading}>
                        <span className="sf-adm-check"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                        <div><div className="sf-adm-point-h">{t(heading)}</div><div className="sf-adm-point-s">{t(sub)}</div></div>
                      </div>
                    ))}
                  </div>
                  <button className="sf-btn sf-btn-pri sf-btn-lg sf-full-btn" type="button" onClick={() => setShowProModal(true)}>{t("Get Pro →")}</button>
                  <p className="sf-dash-note">{t("Secure payment via Midtrans · cancel any time")}</p>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* AD Space Modal - POPUP-04-BuyAd */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdModal(false)} />
          <div className="relative bg-white w-full max-w-[500px] rounded-[6px] p-10">
            <button
              onClick={() => setShowAdModal(false)}
              className="absolute top-4 right-4 text-[#333]/50 hover:text-[#333]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <h3 className="text-[28px] font-bold text-[#333] text-center mb-2">AD SPACE</h3>
            <p className="text-[12px] text-[#333]/50 text-center mb-8">
              Ad placements on SolidFind
              <br />
              Penempatan iklan di SolidFind
            </p>

            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#f14110] flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="#f14110" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#333]">Reach a highly targeted audience</p>
                  <p className="text-[12px] text-[#333]/70">Jangkau audiens yang tepat.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#f14110] flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="#f14110" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#333]">Increased visibility at key decision moments</p>
                  <p className="text-[12px] text-[#333]/70">Tingkatkan visibilitas pada momen penting pengambilan keputusan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-[#f14110] flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1" stroke="#f14110" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#333]">Simple and cost-effective exposure</p>
                  <p className="text-[12px] text-[#333]/70">Eksposur yang sederhana dan hemat biaya.</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#333]/70 text-center mb-6 leading-[18px]">
              Your placement appears on category pages and search results — clearly visible to people actively looking for professionals. Iklan Anda akan tampil di halaman kategori dan hasil pencarian - di hadapan pengguna yang sedang aktif mencari tenaga profesional.
            </p>

            <p className="text-[12px] text-[#f14110] text-center mb-4">
              Contact us to know more about the pricing options.
              <br />
              Hubungi kami untuk mengetahui pilihan harga yang tersedia.
            </p>

            <a
              href={`mailto:getadspace@solidfind.id?subject=${encodeURIComponent(`"${company?.name || 'Company'}" wants ad space`)}&body=${encodeURIComponent(`Company: ${company?.name || 'N/A'}\nEmail: ${company?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || 'N/A'}\nDate: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' })}`)}`}
              className="mx-auto block h-10 rounded-full border border-[#f14110] text-[#f14110] text-[12px] font-medium tracking-[0.24px] hover:bg-[#f14110] hover:text-white transition-colors text-center leading-[40px]"
              style={{ width: '140px' }}
            >
              Get in touch
            </a>
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

      {/* PRO Features Modal - POPUP-03-BuyPro */}
      {(showProModal || shouldOpenProModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-[10px] py-4 sm:px-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeProModal} />
          <div className={`relative bg-white w-full ${proTermsView ? "max-w-[540px]" : "max-w-[440px]"} max-h-[calc(100vh-20px)] rounded-[6px] p-6 sm:p-8 overflow-y-auto overflow-x-hidden`}>
            {/* Launch Discount Ribbon */}
            {!proTermsView && <div className="absolute top-0 left-0 w-[150px] h-[150px] overflow-hidden">
              <div
                className="absolute top-[35px] left-[-35px] w-[180px] bg-[#f14110] text-white text-[10px] font-bold tracking-[0.2px] py-1 text-center transform -rotate-45"
              >
                LAUNCH DISCOUNT
              </div>
            </div>}

            <button
              onClick={closeProModal}
              className="absolute top-4 right-4 text-[#333]/50 hover:text-[#f14110] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            {proTermsView ? (
              <div className="mt-4">
                <div className="mb-6 flex items-center justify-between gap-4 pr-8">
                  <button
                    type="button"
                    onClick={() => setProTermsView(null)}
                    className="inline-flex items-center gap-2 text-[11px] text-[#333]/50 hover:text-[#333] transition-colors tracking-[0.22px]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    BACK
                  </button>
                  <div className="flex h-7 overflow-hidden rounded-full border border-[#333]/15 text-[10px] font-semibold tracking-[0.2px] text-[#333]/50">
                    {([
                      ["english", "EN"],
                      ["indonesian", "ID"],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setProTermsView(value)}
                        className={`px-3 transition-colors ${proTermsView === value ? "bg-[#333] text-white" : "hover:text-[#333]"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <h3 className="text-[24px] font-bold text-[#333] mb-6">
                  {proTermsView === "english" ? "Pro Terms of Services" : "Ketentuan Penggunaan Pro"}
                </h3>
                <div className="space-y-5 text-[11px] text-[#333]/70 leading-[15px] tracking-[0.22px]">
                  {selectedProTermsSections.map((section) => (
                    <section key={section.title}>
                      <h4 className="text-[16px] font-semibold text-[#333] leading-[18px] mb-2">{section.title}</h4>
                      {section.blocks.map((block, index) => {
                        if (block.type === "list") {
                          return (
                            <ul key={`${section.title}-${index}`} className="space-y-0.5 pl-8 ml-2 mb-1">
                              {block.items.map((item) => (
                                <li key={item} className="flex items-start gap-2 leading-[15px]">
                                  <span className="text-[#333]">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        return (
                          <p key={`${section.title}-${index}`} className="mb-1">
                            {block.content}
                          </p>
                        );
                      })}
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-[28px] font-bold text-[#333] text-center mb-2 mt-4">PRO ACCOUNT</h3>
                <p className="text-[12px] text-[#333]/50 text-center mb-8">
                  Services included with PRO account:
                  <br />
                  Layanan dengan akun PRO:
                </p>

                <div className="mx-auto max-w-[340px] space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <ProFeatureIcon name="star" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#333]">Priority positioning in search results</p>
                      <p className="text-[10px] text-[#333]/50">Penempatan prioritas dalam hasil pencarian</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ProFeatureIcon name="ai" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#333]">Structured for AI-assisted search</p>
                      <p className="text-[10px] text-[#333]/50">Terstruktur untuk pencarian yang dibantu AI</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ProFeatureIcon name="stats" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#333]">Visibility analytics — who&apos;s interested and when</p>
                      <p className="text-[10px] text-[#333]/50">Analisis visibilitas — siapa yang tertarik dan kapan</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ProFeatureIcon name="photos" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#333]">Up to 12 project photos or videos</p>
                      <p className="text-[10px] text-[#333]/50">Hingga 12 foto atau video proyek</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <ProFeatureIcon name="ad" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#333]">Ad placements across the website</p>
                      <p className="text-[10px] text-[#333]/50">Penempatan iklan di seluruh situs web</p>
                    </div>
                  </div>
                </div>

                <div className="mx-auto max-w-[260px] space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setBillingPlan("monthly")}
                    className="flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-[22px] font-bold leading-[26px] text-[#333]">{formatProPrice(monthlyPrice, "monthly")}</p>
                      <p className="text-[11px] text-[#333]/50">Month / Bulan</p>
                    </div>
                    <div className={`relative h-4 w-8 rounded-full transition-colors ${billingPlan === "monthly" ? "bg-gradient-to-r from-[#e9a28e] to-[#f14110]" : "bg-[#333]/20"}`}>
                      <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${billingPlan === "monthly" ? "left-[18px]" : "left-0.5"}`} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingPlan("yearly")}
                    className="flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-[22px] font-bold leading-[26px] text-[#333]">{formatProPrice(yearlyPrice, "yearly")}</p>
                      <p className="text-[11px] text-[#333]/50">Year / Tahun</p>
                    </div>
                    <div className={`relative h-4 w-8 rounded-full transition-colors ${billingPlan === "yearly" ? "bg-gradient-to-r from-[#e9a28e] to-[#f14110]" : "bg-[#333]/20"}`}>
                      <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${billingPlan === "yearly" ? "left-[18px]" : "left-0.5"}`} />
                    </div>
                  </button>
                </div>

                {proCheckoutError && (
                  <p className="mb-4 text-center text-[10px] leading-[16px] text-[#f14110]">
                    {proCheckoutError}
                  </p>
                )}

                <button
                  onClick={handleBuyPro}
                  disabled={isCreatingCheckout}
                  className="mx-auto flex items-center justify-center h-10 px-10 rounded-full border border-[#f14110] text-[#f14110] text-[12px] font-medium tracking-[0.24px] hover:bg-[#f14110] hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreatingCheckout ? "Creating link..." : "Buy now"}
                </button>

                <p className="mt-4 text-center text-[10px] leading-[16px] text-[#333]/50">
                  By subscribing, you agree to our{" "}
                  <Link href="/terms?view=pro-en&from=%2Fcompany-dashboard%3Fpro%3D1" className="underline hover:text-[#f14110] transition-colors">
                    Terms of Services
                  </Link>
                  {" / "}Dengan berlangganan, Anda menyetujui{" "}
                  <Link href="/terms?view=pro-id&from=%2Fcompany-dashboard%3Fpro%3D1" className="underline hover:text-[#f14110] transition-colors">
                    Ketentuan penggunaan
                  </Link>
                  {" "}kami
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {shouldShowProSuccess && (
        <ProPurchaseConfirmationPopup
          plan={billingPlan}
          yearlyPrice={yearlyPrice}
          monthlyPrice={monthlyPrice}
          onClose={closeProSuccess}
        />
      )}
      {checkoutState && (
        <CheckoutStatePopup state={checkoutState} onClose={closeCheckoutState} onRetry={() => setShowProModal(true)} />
      )}
    </div>
  );
}

function CheckoutStatePopup({ state, onClose, onRetry }: { state: "pending" | "cancelled" | "failure"; onClose: () => void; onRetry: () => void }) {
  const content = {
    pending: {
      eyebrow: "Processing payment",
      title: "Confirming your payment",
      body: "We're waiting on confirmation from Midtrans. This usually takes just a few seconds. Please don't close this window.",
      icon: "spinner",
      primary: "Back to dashboard",
      secondary: "Do not close or refresh",
      tone: "neutral",
    },
    cancelled: {
      eyebrow: "Payment cancelled",
      title: "You cancelled the payment",
      body: "No charge has been made to your account. You can try again whenever you're ready.",
      icon: "cancel",
      primary: "Try again →",
      secondary: "Back to dashboard",
      tone: "grey",
    },
    failure: {
      eyebrow: "Payment failed",
      title: "Your payment didn't go through",
      body: "There was an issue processing your payment. Please check your card details and try again, or contact your bank.",
      icon: "error",
      primary: "Try again →",
      secondary: "Contact support",
      tone: "orange",
    },
  }[state];

  const handlePrimary = () => {
    if (state === "pending") {
      onClose();
      return;
    }
    onClose();
    onRetry();
  };

  return (
    <div className="sf-modal-scrim" onClick={state === "pending" ? undefined : onClose}>
      <div className="sf-modal sf-modal-confirm" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        {state !== "pending" && <button className="sf-modal-x" type="button" onClick={onClose}>×</button>}
        <div className="sf-confirm-ico" style={{ background: state === "cancelled" ? "var(--sf-stone-200)" : state === "pending" ? "none" : "var(--sf-peach-100)", color: state === "cancelled" ? "var(--sf-stone-700)" : "var(--sf-orange)", border: state === "pending" ? "0" : undefined }}>
          {content.icon === "spinner" && <div className="sf-spinner" />}
          {content.icon === "cancel" && <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>}
          {content.icon === "error" && <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        </div>
        <span className="sf-tag-mono" style={{ display: "block", color: state === "failure" ? "var(--sf-orange)" : "var(--sf-fg-3)", marginBottom: 8 }}>{content.eyebrow}</span>
        <h2>{content.title}</h2>
        <p>{content.body}</p>
        {state === "pending" && (
          <p style={{ marginTop: 14, fontFamily: "var(--sf-font-mono)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--sf-fg-3)" }}>{content.secondary}</p>
        )}
        <div className="sf-confirm-actions">
          {state === "failure" ? (
            <a className="sf-btn sf-btn-lg sf-btn-ghost" href="mailto:hello@solidfind.id">Contact support</a>
          ) : state === "cancelled" ? (
            <button className="sf-btn sf-btn-lg sf-btn-ghost" type="button" onClick={onClose}>{content.secondary}</button>
          ) : null}
          <button className="sf-btn sf-btn-lg sf-btn-pri" type="button" onClick={handlePrimary}>{content.primary}</button>
        </div>
      </div>
    </div>
  );
}

function ProPurchaseConfirmationPopup({
  plan,
  yearlyPrice,
  monthlyPrice,
  onClose,
}: {
  plan: "monthly" | "yearly";
  yearlyPrice: string | null | undefined;
  monthlyPrice: string | null | undefined;
  onClose: () => void;
}) {
  const planLabel = plan === "monthly"
    ? `Monthly plan · Rp ${formatIdrPrice(monthlyPrice)} / month`
    : `Yearly plan · Rp ${formatIdrPrice(yearlyPrice)} / year`;
  const features = [
    "Priority placement in search results",
    "Visibility analytics dashboard",
    "Up to 12 project photos or videos",
    "Ad placements across the platform",
    "AI-ready profile formatting",
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#f8f8f8]/85 px-4 py-12 backdrop-blur-sm">
      <section className="relative w-full max-w-[560px] overflow-hidden rounded-xl border border-[#e4e4e4] bg-white shadow-[0_12px_32px_rgba(35,31,32,0.12),0_4px_8px_rgba(35,31,32,0.06)]" role="dialog" aria-modal="true" aria-labelledby="proSuccessTitle">
        <div className="relative overflow-hidden bg-[#f14110] px-6 py-6 text-white sm:px-9 sm:pb-7 sm:pt-8">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.75) 1px, transparent 1px)", backgroundSize: "18px 18px" }} aria-hidden="true" />
          <button type="button" onClick={onClose} className="absolute right-3.5 top-3.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white/80 transition hover:bg-white/25 hover:text-white" aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-3.5 w-3.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>

          <div className="relative flex items-start gap-[18px]">
            <div className="mt-0.5 grid h-12 w-12 flex-none place-items-center rounded-full border border-white/35 bg-white/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white/70">Purchase confirmed</p>
              <h2 id="proSuccessTitle" className="mb-1 text-[24px] font-light leading-[1.15] tracking-[-0.02em] text-white sm:text-[28px]">
                Welcome to <strong className="font-bold">Pro.</strong>
              </h2>
              <p className="m-0 text-[13px] leading-[1.5] text-white/70">Your profile is now upgraded - everything below is live.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 py-1.5 pl-2 pr-3.5">
                <span className="h-2 w-2 rounded-full bg-white/90" aria-hidden="true" />
                <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-white/90">{planLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-7 sm:px-9">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c8c8c]">Now active on your profile</p>
          <ul className="mb-7">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3.5 border-b border-[#e4e4e4] py-[11px] last:border-b-0">
                <span className="grid h-[22px] w-[22px] flex-none place-items-center rounded-full bg-[#eaf4ee] text-[#2e7d55]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="flex-1 text-[14px] font-medium leading-[1.35] text-[#231f20]">{feature}</span>
                <span className="rounded-full bg-[#fbe6de] px-2 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#f14110]">Active</span>
              </li>
            ))}
          </ul>

          <div className="mb-7 rounded-lg bg-[#f8f8f8] px-[18px] py-4">
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c8c8c]">Make the most of Pro</p>
            <ol className="space-y-2.5">
              {[
                ["Complete your profile", "add photos, services, and a project description to rank higher."],
                ["Check your analytics", "visibility data updates within 24 hours of going live."],
                ["Review ad placement guidelines", "keep your content compliant so your ads stay active."],
              ].map(([title, copy], index) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-px grid h-5 w-5 flex-none place-items-center rounded-full border border-[#d8d8d8] font-mono text-[10px] font-semibold text-[#8c8c8c]">{index + 1}</span>
                  <span className="text-[13px] leading-[1.45] text-[#333]"><strong className="font-semibold text-[#231f20]">{title}</strong> - {copy}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-6 pb-8 sm:px-9">
          <button type="button" onClick={onClose} className="rounded-[6px] bg-[#f14110] px-[22px] py-[13px] text-center text-[14px] font-semibold tracking-[0.01em] text-white transition hover:bg-[#ec3300]">
            Go to your dashboard →
          </button>
          <button type="button" onClick={onClose} className="rounded-[6px] border border-[#d8d8d8] bg-transparent px-[22px] py-[13px] text-center text-[14px] font-semibold tracking-[0.01em] text-[#333] transition hover:bg-[#f8f8f8]">
            Close
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#e4e4e4] px-6 py-4 text-[12px] text-[#8c8c8c] sm:px-9">
          <span>A receipt has been sent to your email.</span>
          <span className="text-[#d8d8d8]" aria-hidden="true">·</span>
          <Link href="/company-dashboard" className="font-medium text-[#f14110] hover:underline">View subscription</Link>
          <span className="text-[#d8d8d8]" aria-hidden="true">·</span>
          <Link href="/terms?view=pro-en&from=%2Fcompany-dashboard%3FproSuccess%3D1" className="font-medium text-[#f14110] hover:underline">Terms</Link>
        </div>
      </section>
    </div>
  );
}
