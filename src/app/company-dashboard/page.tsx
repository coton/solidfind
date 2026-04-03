"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";
import { useProEnabled } from "@/hooks/useProEnabled";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";

const proFeatures = [
  { icon: "star", title: "Top search ranking", subtitle: "Peringkat pencarian teratas" },
  { icon: "ai", title: "AI search optimisation", subtitle: "Optimasi pencarian AI" },
  { icon: "stats", title: "Statistics", subtitle: "Statistik" },
  { icon: "pics", title: "12 project pictures or videos", subtitle: "12 gambar proyek atau Video" },
  { icon: "ads", title: "Possibility to buy ad space", subtitle: "Boleh untuk membeli iklan" },
];

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
  const proEnabled = useProEnabled();
  const reviewsEnabled = useReviewsEnabled();
  const [showAdModal, setShowAdModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const deleteAccount = useMutation(api.users.deleteAccount);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!clerkUser?.id) return;
    await deleteAccount({ clerkId: clerkUser.id });
    await handleSignOut();
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

  // If user has no company, redirect to individual dashboard
  if (currentUser && company === null && !redirected) {
    setRedirected(true);
    router.push("/dashboard");
    return null;
  }

  // If user has no company yet, redirect to register-business
  if (currentUser && company === null) {
    router.push("/register-business");
    return null;
  }

  const reviews = useQuery(
    api.reviews.listByCompany,
    company?._id ? { companyId: company._id } : "skip"
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

  // If user has no company yet, redirect directly to register-business
  if (currentUser && company === null) {
    router.push("/register-business");
    return null;
  }

  const data = {
    name: company?.name ?? "Company Name",
    accountType: isPro ? "PRO" : "FREE",
    stats: {
      bookmarked: company?.bookmarkCount ?? 0,
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

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-[5px]">
          <div>
            <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-0">
              {company?._id ? (
                <Link href={`/profile/${company._id}`} className="hover:text-[#f14110] transition-colors">
                  Company profile
                </Link>
              ) : (
                "Company profile"
              )}
            </h1>
          </div>

          <div className="text-right">
            {isPro && proEnabled ? (
              <p className="text-[11px] font-medium tracking-[0.22px] mb-1 text-[#f14110]">PRO ACCOUNT</p>
            ) : proEnabled ? (
              <p className="text-[11px] font-medium tracking-[0.22px] mb-1 text-[#333]/60">FREE ACCOUNT</p>
            ) : null}
            {clerkUser?.emailAddresses?.[0]?.emailAddress && (
              <p className="text-[10px] text-[#333]/60 tracking-[0.2px] mb-1">
                {clerkUser.emailAddresses[0].emailAddress}
              </p>
            )}

          </div>
        </div>

        <div className="flex items-start justify-between mb-6">
          <p className="text-[11px] text-[#333]/70 tracking-[0.22px] leading-[18px]">
            Your profile is live on SolidFind. As the platform grows, so does your visibility. Make sure you are showing your best profile : )
            <br />
            Profil Anda sudah aktif di SolidFind. Seiring platform berkembang, begitu pula jangkauan Anda. Pastikan kamu menampilkan profil terbaikmu : )
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Link
            href="/company-dashboard/edit"
            className="h-10 rounded-full border border-[#333] text-[#333] text-[11px] font-medium tracking-[0.22px] hover:border-[#f14110] hover:text-[#f14110] transition-colors flex items-center justify-center"
            style={{ minWidth: '140px' }}
          >
            Edit profile
          </Link>
          {isPro && proEnabled && (
            <button
              onClick={() => setShowAdModal(true)}
              className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors ml-auto"
            >
              Get AD space
            </button>
          )}
          {!isPro && proEnabled && (
            <button
              onClick={() => setShowProModal(true)}
              className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors ml-auto"
            >
              Get PRO
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className={`grid ${isPro && proEnabled ? 'grid-cols-4' : proEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-6 mb-8`}>
          {/* Bookmarked — always visible */}
          <div>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
              Company bookmarked /
            </p>
            <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
              Perusahaan favorit sebanyak
            </p>
            <p className={`text-[32px] font-bold tracking-[0.64px] ${data.stats.bookmarked === 0 ? 'text-[#666]' : 'text-[#f14110]'}`}>
              {data.stats.bookmarked}
              <span className="text-[14px] font-normal ml-1">Times</span>
            </p>
          </div>

          {isPro && proEnabled && (
            <>
              {/* Views Last Month */}
              <div>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  View within the last month /
                </p>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                  Lihat dalam sebulan terakhir
                </p>
                <p className="text-[32px] font-bold text-[#f14110] tracking-[0.64px]">
                  {data.stats.viewsLastMonth}
                  <span className="text-[14px] font-normal ml-1">Views</span>
                </p>
              </div>

              {/* Most Searched Location */}
              <div>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Most frequent location searched/
                </p>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                  Lokasi yang paling sering lokasi
                </p>
                <p className="text-[24px] font-bold text-[#f14110] tracking-[0.48px]">
                  {data.stats.mostSearchedLocation}
                </p>
              </div>
            </>
          )}

          {/* PRO Features — only when proEnabled */}
          {proEnabled && (
            <div className="bg-white rounded-[6px] p-4">
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
                      {feature.icon === "pics" && (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.5 0C18.163 0 18.7987 0.263581 19.2676 0.732422C19.7364 1.20126 20 1.83696 20 2.5V17.5C20 18.163 19.7364 18.7987 19.2676 19.2676C18.7987 19.7364 18.163 20 17.5 20H2.5C1.83696 20 1.20126 19.7364 0.732422 19.2676C0.263581 18.7987 0 18.163 0 17.5V2.5C0 1.83696 0.263581 1.20126 0.732422 0.732422C1.20126 0.263581 1.83696 0 2.5 0H17.5ZM7.99512 18H17.084L12.6963 11.709L7.99512 18ZM2.5 2C2.36739 2 2.24025 2.05272 2.14648 2.14648C2.05272 2.24025 2 2.36739 2 2.5V17.5C2 17.6326 2.05272 17.7597 2.14648 17.8535C2.24025 17.9473 2.36739 18 2.5 18H5.49902L11.0938 10.5117C11.2832 10.258 11.5302 10.0527 11.8145 9.91309C12.0986 9.77355 12.412 9.70387 12.7285 9.70898C13.0452 9.71416 13.3562 9.79456 13.6357 9.94336C13.9153 10.0922 14.1558 10.3047 14.3369 10.5645L18 15.8164V2.5C18 2.36739 17.9473 2.24025 17.8535 2.14648C17.7597 2.05272 17.6326 2 17.5 2H2.5ZM7 3.5C7.92826 3.5 8.81823 3.86901 9.47461 4.52539C10.131 5.18177 10.5 6.07174 10.5 7C10.5 7.92826 10.131 8.81823 9.47461 9.47461C8.81823 10.131 7.92826 10.5 7 10.5C6.07174 10.5 5.18177 10.131 4.52539 9.47461C3.86901 8.81823 3.5 7.92826 3.5 7C3.5 6.07174 3.86901 5.18177 4.52539 4.52539C5.18177 3.86901 6.07174 3.5 7 3.5ZM7 5.5C6.60218 5.5 6.22076 5.65815 5.93945 5.93945C5.65815 6.22076 5.5 6.60218 5.5 7C5.5 7.39782 5.65815 7.77924 5.93945 8.06055C6.22076 8.34185 6.60218 8.5 7 8.5C7.39782 8.5 7.77924 8.34185 8.06055 8.06055C8.34185 7.77924 8.5 7.39782 8.5 7C8.5 6.60218 8.34185 6.22076 8.06055 5.93945C7.77924 5.65815 7.39782 5.5 7 5.5Z" fill="#F14110"/>
                        </svg>
                      )}
                      {feature.icon === "ads" && (
                        <svg width="16" height="16" viewBox="0 0 26 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.5942 19.7313V15.9813H16.9148V14.7313H20.5942V10.9813H21.8206V14.7313H25.5V15.9813H21.8206V19.7313H20.5942ZM2.48072 20.5C1.91655 20.5 1.44519 20.3075 1.06662 19.9225C0.688059 19.5375 0.499185 19.0571 0.500003 18.4813V2.51875C0.500003 1.94375 0.688876 1.46375 1.06662 1.07875C1.44437 0.69375 1.91574 0.500833 2.48072 0.5H18.1425C18.7067 0.5 19.1776 0.692916 19.5554 1.07875C19.9331 1.46458 20.1224 1.945 20.1232 2.52V8H18.8968V4.73125H1.72645V18.4813C1.72645 18.7054 1.79718 18.8896 1.93863 19.0337C2.08008 19.1779 2.26078 19.25 2.48072 19.25H17.6703V20.5H2.48072ZM1.72645 3.48125H18.8968V2.51875C18.8968 2.29458 18.8257 2.11042 18.6834 1.96625C18.5427 1.82208 18.3621 1.75 18.1413 1.75H2.48072C2.25996 1.75 2.07926 1.82208 1.93863 1.96625C1.79718 2.11042 1.72645 2.295 1.72645 2.52V3.48125Z" fill="#F14110"/>
                          <path d="M1.72645 3.48125H18.8968V2.51875C18.8968 2.29458 18.8257 2.11042 18.6834 1.96625C18.5427 1.82208 18.3621 1.75 18.1413 1.75H2.48072C2.25996 1.75 2.07926 1.82208 1.93863 1.96625C1.79718 2.11042 1.72645 2.295 1.72645 2.52V3.48125ZM1.72645 3.48125V1.75M20.5942 19.7313V15.9813H16.9148V14.7313H20.5942V10.9813H21.8206V14.7313H25.5V15.9813H21.8206V19.7313H20.5942ZM2.48072 20.5C1.91655 20.5 1.44519 20.3075 1.06662 19.9225C0.688059 19.5375 0.499185 19.0571 0.500003 18.4813V2.51875C0.500003 1.94375 0.688876 1.46375 1.06662 1.07875C1.44437 0.69375 1.91574 0.500833 2.48072 0.5H18.1425C18.7067 0.5 19.1776 0.692916 19.5554 1.07875C19.9331 1.46458 20.1224 1.945 20.1232 2.52V8H18.8968V4.73125H1.72645V18.4813C1.72645 18.7054 1.79718 18.8896 1.93863 19.0337C2.08008 19.1779 2.26078 19.25 2.48072 19.25H17.6703V20.5H2.48072Z" stroke="#F14110"/>
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

        {/* Monthly Views Chart */}
        {isPro && <div className="mb-8">
          <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-1">
            This Month views /
          </p>
          <p className="text-[11px] text-[#333]/70 tracking-[0.22px] mb-4">
            Jumlah tayangan bulan ini
          </p>
          <div className="bg-white rounded-[6px] p-4">
            <div className="space-y-3">
              {data.monthlyViews.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="text-[10px] text-[#333]/70 w-20 shrink-0 tracking-[0.2px]">{item.month}</span>
                  <div className="flex-1 h-4 bg-[#f8f8f8] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.views / maxViews) * 100}%`,
                        background: "linear-gradient(to right, #e9a28e, #f14110)"
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#333]/70 w-8 text-right tracking-[0.2px]">{item.views}</span>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* Banner Image — hidden when reviews are enabled */}
        {!isPro && !reviewsEnabled && (
          <div className="mb-8 rounded-[6px] overflow-hidden">
            {/* Desktop: full width */}
            <div className="hidden sm:block relative w-full" style={{ aspectRatio: '900/200' }}>
              <Image src="/images/bg-individual-page.png" alt="" fill className="object-cover" />
            </div>
            {/* Mobile: cropped from bottom-right */}
            <div className="sm:hidden relative w-full" style={{ aspectRatio: '2/1' }}>
              <Image src="/images/bg-individual-page.png" alt="" fill className="object-cover object-right-bottom" />
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviewsEnabled && <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                  Latest testimonials /
                </p>
                <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
                  Ulasan terbaru
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-[#f14110] text-[#f14110]" />
                <span className="text-[16px] font-bold text-[#f14110]">{data.rating}</span>
                <span className="text-[12px] text-[#333]/50">({data.reviewCount})</span>
              </div>
            </div>
            {company?._id && (
              <Link
                href={`/profile/${company._id}/reviews`}
                className="rounded-full border border-[#333] text-[11px] font-medium text-[#333] tracking-[0.22px] hover:bg-[#333] hover:text-white transition-colors flex items-center justify-center"
                style={{ width: '140px', height: '40px' }}
              >
                See all
              </Link>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {data.reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
          </div>
        </div>}
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
              Make sure your brand stands out!
              <br />
              Pastikan merek Anda menonjol!
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
                  <p className="text-[12px] text-[#333]/70">Jangkau audiens yang sangat tertarget</p>
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
                  <p className="text-[12px] text-[#333]/70">Peningkatan visibilitas pada momen-momen penting pengambilan keputusan</p>
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
                  <p className="text-[12px] text-[#333]/70">Paparan yang sederhana dan hemat biaya</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#333]/70 text-center mb-6 leading-[18px]">
              Your Ads will be visible throughout the website, in essential pages offering instant visibility across the entirety of Solidfind.id / Iklan Anda akan terlihat di seluruh situs web, di halaman-halaman penting yang menawarkan visibilitas instan di seluruh Solidfind.id.
            </p>

            <p className="text-[12px] text-[#f14110] text-center mb-4">
              Contact us to know more about the pricing options.
              <br />
              Hubungi kami untuk mengetahui pilihan harga.
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
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProModal(false)} />
          <div className="relative bg-white w-full max-w-[520px] rounded-[6px] p-10 overflow-hidden">
            {/* Launch Discount Ribbon */}
            <div className="absolute top-0 left-0 w-[150px] h-[150px] overflow-hidden">
              <div
                className="absolute top-[35px] left-[-35px] w-[180px] bg-[#f14110] text-white text-[10px] font-bold tracking-[0.2px] py-1 text-center transform -rotate-45"
              >
                LAUNCH DISCOUNT
              </div>
            </div>

            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-[#333]/50 hover:text-[#333]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <h3 className="text-[28px] font-bold text-[#333] text-center mb-2 mt-4">PRO ACCOUNT</h3>
            <p className="text-[12px] text-[#333]/50 text-center mb-8">
              Services included with PRO account:
              <br />
              Layanan dengan akun PRO:
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-[#f14110]" />
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">Top search ranking</p>
                  <p className="text-[10px] text-[#333]/50">Peringkat pencarian teratas</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#f14110">
                  <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z"/>
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">AI search optimisation</p>
                  <p className="text-[10px] text-[#333]/50">Optimasi pencarian AI</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#f14110">
                  <rect x="1" y="8" width="3" height="7"/>
                  <rect x="6" y="4" width="3" height="11"/>
                  <rect x="11" y="1" width="3" height="14"/>
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">Statistics</p>
                  <p className="text-[10px] text-[#333]/50">Statistik</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#f14110">
                  <path d="M17.5 0C18.163 0 18.7987 0.263581 19.2676 0.732422C19.7364 1.20126 20 1.83696 20 2.5V17.5C20 18.163 19.7364 18.7987 19.2676 19.2676C18.7987 19.7364 18.163 20 17.5 20H2.5C1.83696 20 1.20126 19.7364 0.732422 19.2676C0.263581 18.7987 0 18.163 0 17.5V2.5C0 1.83696 0.263581 1.20126 0.732422 0.732422C1.20126 0.263581 1.83696 0 2.5 0H17.5ZM7.99512 18H17.084L12.6963 11.709L7.99512 18ZM2.5 2C2.36739 2 2.24025 2.05272 2.14648 2.14648C2.05272 2.24025 2 2.36739 2 2.5V17.5C2 17.6326 2.05272 17.7597 2.14648 17.8535C2.24025 17.9473 2.36739 18 2.5 18H5.49902L11.0938 10.5117C11.2832 10.258 11.5302 10.0527 11.8145 9.91309C12.0986 9.77355 12.412 9.70387 12.7285 9.70898C13.0452 9.71416 13.3562 9.79456 13.6357 9.94336C13.9153 10.0922 14.1558 10.3047 14.3369 10.5645L18 15.8164V2.5C18 2.36739 17.9473 2.24025 17.8535 2.14648C17.7597 2.05272 17.6326 2 17.5 2H2.5ZM7 3.5C7.92826 3.5 8.81823 3.86901 9.47461 4.52539C10.131 5.18177 10.5 6.07174 10.5 7C10.5 7.92826 10.131 8.81823 9.47461 9.47461C8.81823 10.131 7.92826 10.5 7 10.5C6.07174 10.5 5.18177 10.131 4.52539 9.47461C3.86901 8.81823 3.5 7.92826 3.5 7C3.5 6.07174 3.86901 5.18177 4.52539 4.52539C5.18177 3.86901 6.07174 3.5 7 3.5ZM7 5.5C6.60218 5.5 6.22076 5.65815 5.93945 5.93945C5.65815 6.22076 5.5 6.60218 5.5 7C5.5 7.39782 5.65815 7.77924 5.93945 8.06055C6.22076 8.34185 6.60218 8.5 7 8.5C7.39782 8.5 7.77924 8.34185 8.06055 8.06055C8.34185 7.77924 8.5 7.39782 8.5 7C8.5 6.60218 8.34185 6.22076 8.06055 5.93945C7.77924 5.65815 7.39782 5.5 7 5.5Z" fill="#F14110"/>
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">12 project pictures or videos</p>
                  <p className="text-[10px] text-[#333]/50">12 gambar proyek atau Video</p>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2">
                <svg width="20" height="20" viewBox="0 0 26 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.5942 19.7313V15.9813H16.9148V14.7313H20.5942V10.9813H21.8206V14.7313H25.5V15.9813H21.8206V19.7313H20.5942ZM2.48072 20.5C1.91655 20.5 1.44519 20.3075 1.06662 19.9225C0.688059 19.5375 0.499185 19.0571 0.500003 18.4813V2.51875C0.500003 1.94375 0.688876 1.46375 1.06662 1.07875C1.44437 0.69375 1.91574 0.500833 2.48072 0.5H18.1425C18.7067 0.5 19.1776 0.692916 19.5554 1.07875C19.9331 1.46458 20.1224 1.945 20.1232 2.52V8H18.8968V4.73125H1.72645V18.4813C1.72645 18.7054 1.79718 18.8896 1.93863 19.0337C2.08008 19.1779 2.26078 19.25 2.48072 19.25H17.6703V20.5H2.48072ZM1.72645 3.48125H18.8968V2.51875C18.8968 2.29458 18.8257 2.11042 18.6834 1.96625C18.5427 1.82208 18.3621 1.75 18.1413 1.75H2.48072C2.25996 1.75 2.07926 1.82208 1.93863 1.96625C1.79718 2.11042 1.72645 2.295 1.72645 2.52V3.48125Z" fill="#F14110"/>
                  <path d="M1.72645 3.48125H18.8968V2.51875C18.8968 2.29458 18.8257 2.11042 18.6834 1.96625C18.5427 1.82208 18.3621 1.75 18.1413 1.75H2.48072C2.25996 1.75 2.07926 1.82208 1.93863 1.96625C1.79718 2.11042 1.72645 2.295 1.72645 2.52V3.48125ZM1.72645 3.48125V1.75M20.5942 19.7313V15.9813H16.9148V14.7313H20.5942V10.9813H21.8206V14.7313H25.5V15.9813H21.8206V19.7313H20.5942ZM2.48072 20.5C1.91655 20.5 1.44519 20.3075 1.06662 19.9225C0.688059 19.5375 0.499185 19.0571 0.500003 18.4813V2.51875C0.500003 1.94375 0.688876 1.46375 1.06662 1.07875C1.44437 0.69375 1.91574 0.500833 2.48072 0.5H18.1425C18.7067 0.5 19.1776 0.692916 19.5554 1.07875C19.9331 1.46458 20.1224 1.945 20.1232 2.52V8H18.8968V4.73125H1.72645V18.4813C1.72645 18.7054 1.79718 18.8896 1.93863 19.0337C2.08008 19.1779 2.26078 19.25 2.48072 19.25H17.6703V20.5H2.48072Z" stroke="#F14110"/>
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">Possibility to buy ad space</p>
                  <p className="text-[10px] text-[#333]/50">Boleh untuk membeli iklan</p>
                </div>
              </div>
            </div>

            {/* Pricing Toggle */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[28px] font-bold text-[#333]">650.000<span className="text-[14px]">rp</span></p>
                  <p className="text-[11px] text-[#333]/50">Month / Bulan</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-gradient-to-l from-[#f14110] to-[#e9a28e]">
                  <div className="w-4 h-4 bg-white rounded-full mt-0.5 ml-5" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[28px] font-bold text-[#333]/30">7<span className="text-[14px]">jt</span></p>
                  <p className="text-[11px] text-[#333]/30">Year / Tahun</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-[#333]/20">
                  <div className="w-4 h-4 bg-white rounded-full mt-0.5 ml-0.5" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProModal(false)}
              className="mx-auto flex items-center gap-2 h-10 px-10 rounded-full border-2 border-[#f14110] text-[#f14110] text-[12px] font-medium tracking-[0.24px] hover:bg-[#f14110] hover:text-white transition-colors"
            >
              BUY NOW
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
                <path d="M9 4H7v5h5V7H9V4z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
