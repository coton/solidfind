"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

export default function CompanyReviewsPage() {
  const params = useParams();
  const companyId = params.id as Id<"companies">;

  const company = useQuery(api.companies.getById, { id: companyId });
  const reviews = useQuery(api.reviews.listByCompany, { companyId });

  return (
    <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        <Link
          href={`/profile/${companyId}`}
          className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors mb-6"
        >
          <span>←</span> BACK TO PROFILE
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-[26px] font-semibold text-[#333] leading-[30px]">
              {company?.name ?? "Loading..."}
            </h1>
            <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
              All reviews / Semua ulasan
            </p>
          </div>
          {company && (
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-[#f14110] text-[#f14110]" />
              <span className="text-[22px] font-semibold text-[#f14110]">{company.rating ?? 0}</span>
              <span className="text-[10px] text-[#f14110]/70">({company.reviewCount ?? 0})</span>
            </div>
          )}
        </div>

        {reviews === undefined ? (
          <p className="text-[#333]/50 text-[12px]">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-[#333]/50 text-[12px]">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-[6px] p-5">
                <p className="text-[12px] font-semibold text-[#333] mb-2">{review.userName}</p>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-[#f14110] text-[#f14110]' : 'fill-[#e4e4e4] text-[#e4e4e4]'}`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#333]/70 leading-[18px] mb-2">
                  {review.content}
                </p>
                <p className="text-[9px] text-[#333]/40 font-mono">
                  {new Date(review.createdAt).toLocaleDateString("en-CA").replace(/-/g, "/")}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
