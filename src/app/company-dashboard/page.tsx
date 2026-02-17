"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

const proFeatures = [
  { icon: "star", title: "Top search ranking", subtitle: "Peringkat pencarian teratas" },
  { icon: "ai", title: "AI search optimisation", subtitle: "Optimasi pencarian AI" },
  { icon: "stats", title: "Statistics", subtitle: "Statistik" },
  { icon: "photos", title: "12 project pictures", subtitle: "12 gambar proyek" },
  { icon: "ad", title: "Possibility to buy ad space", subtitle: "Boleh untuk membeli iklan" },
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
  const [showAdModal, setShowAdModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const deleteAccount = useMutation(api.users.deleteAccount);

  const handleDeleteAccount = async () => {
    if (!clerkUser?.id) return;
    await deleteAccount({ clerkId: clerkUser.id });
    await signOut();
    router.push("/");
  };

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const company = useQuery(
    api.companies.getByOwner,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );

  const reviews = useQuery(
    api.reviews.listByCompany,
    company?._id ? { companyId: company._id } : "skip"
  );

  const monthlyViews = [
    { month: "January", views: 32 },
    { month: "February", views: 36 },
    { month: "March", views: 48 },
    { month: "April", views: 32 },
  ];

  const isPro = company?.isPro ?? false;

  // If user has no company yet, show onboarding prompt
  if (currentUser && company === null) {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <Header />
        <main className="max-w-[900px] mx-auto px-6 py-8">
          <div className="text-center py-20">
            <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px] mb-4">
              Welcome!
            </h1>
            <p className="text-[14px] text-[#333]/70 mb-8 max-w-[400px] mx-auto">
              {"You haven't listed your business yet. Register your company to get discovered on SolidFind."}
            </p>
            <Link
              href="/register-business"
              className="inline-flex items-center h-10 px-8 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
            >
              Register your business
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const data = {
    name: company?.name ?? "Company Name",
    accountType: isPro ? "PRO" : "FREE",
    stats: {
      bookmarked: company?.bookmarkCount ?? 0,
      viewsLastMonth: company?.viewsLastMonth ?? 0,
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

  const maxViews = Math.max(...data.monthlyViews.map(m => m.views));

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
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
              Here are the latest statistics about your company page. Check the latest reviews.
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-[#f14110] font-medium tracking-[0.22px] mb-1">
              {isPro ? "PRO ACCOUNT" : "FREE ACCOUNT"}
            </p>
            {isPro ? (
              <button onClick={() => setShowDeleteModal(true)} className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]">
                DELETE PROFILE
              </button>
            ) : (
              <button
                onClick={() => setShowProModal(true)}
                className="text-[11px] text-[#333] underline tracking-[0.22px] hover:text-[#f14110]"
              >
                UPGRADE FOR MORE
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          {isPro ? (
            <button
              onClick={() => setShowAdModal(true)}
              className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors"
            >
              Get AD space
            </button>
          ) : (
            <button
              onClick={() => setShowProModal(true)}
              className="h-10 px-6 rounded-full border border-[#f14110] text-[#f14110] text-[11px] font-medium tracking-[0.22px] hover:bg-[#f14110] hover:text-white transition-colors"
            >
              Get PRO
            </button>
          )}
          <Link
            href="/company-dashboard/edit"
            className="h-10 px-6 rounded-full bg-[#333] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#444] transition-colors flex items-center"
          >
            Edit profile
          </Link>
        </div>

        {/* Stats Grid */}
        <div className={`grid ${isPro ? 'grid-cols-4' : 'grid-cols-1 justify-items-end'} gap-6 mb-8`}>
          {isPro && (
            <>
              {/* Bookmarked */}
              <div>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-1">
                  Company bookmarked /
                </p>
                <p className="text-[10px] text-[#333]/70 tracking-[0.2px] mb-2">
                  Perusahaan favorit sebanyak
                </p>
                <p className="text-[32px] font-bold text-[#f14110] tracking-[0.64px]">
                  {data.stats.bookmarked}
                  <span className="text-[14px] font-normal ml-1">Times</span>
                </p>
              </div>

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

          {/* PRO Features */}
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
                    {feature.icon === "photos" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="3" width="14" height="10" rx="1"/>
                        <circle cx="5" cy="7" r="1.5"/>
                        <path d="M4 11L7 8L9 10L12 7L14 9V12H2V11H4Z"/>
                      </svg>
                    )}
                    {feature.icon === "ad" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M4 11L8 5L12 11H4Z"/>
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
              className="mt-4 w-full h-8 rounded-full bg-[#333] text-white text-[10px] font-medium tracking-[0.2px] hover:bg-[#444] transition-colors"
            >
              See all
            </button>
          </div>
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
                  <span className="text-[10px] text-[#333]/70 w-16 tracking-[0.2px]">{item.month}</span>
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

        {/* Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-[11px] font-medium text-[#333] tracking-[0.22px]">
                Latest reviews /
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

          <div className="grid grid-cols-4 gap-4">
            {data.reviews.map((review, index) => (
              <ReviewCard key={index} {...review} />
            ))}
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
              Your Ads will be visible throughout the website, in essential pages offering instant visibility across the entirety of Struct.id / Iklan Anda akan terlihat di seluruh situs web, di halaman-halaman penting yang menawarkan visibilitas instan di seluruh Struct.id.
            </p>

            <p className="text-[12px] text-[#f14110] text-center mb-4">
              Contact us to know more about the pricing options.
              <br />
              Hubungi kami untuk mengetahui pilihan harga.
            </p>

            <button
              onClick={() => setShowAdModal(false)}
              className="mx-auto block h-10 px-10 rounded-full border-2 border-[#f14110] text-[#f14110] text-[12px] font-medium tracking-[0.24px] hover:bg-[#f14110] hover:text-white transition-colors"
            >
              Get in touch
            </button>
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
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#f14110">
                  <rect x="1" y="3" width="14" height="10" rx="1"/>
                </svg>
                <div>
                  <p className="text-[12px] font-semibold text-[#333]">12 project pictures</p>
                  <p className="text-[10px] text-[#333]/50">12 gambar proyek</p>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="#f14110" strokeWidth="1.5">
                  <rect x="1" y="1" width="14" height="14" rx="1"/>
                  <path d="M5 10L8 6L11 10" strokeLinecap="round" strokeLinejoin="round"/>
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
