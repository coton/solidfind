"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";
import { useReviewsEnabled } from "@/hooks/useReviewsEnabled";
import { buildCompanyProfilePath } from "@/lib/company-profile-url.mjs";

export default function CompanyReviewsPage() {
  const params = useParams();
  const companyIdentifier = (params.companySlug ?? params.id) as string;

  const reviewsEnabled = useReviewsEnabled();
  const company = useQuery(api.companies.getByPublicIdentifier, { identifier: companyIdentifier });
  const reviews = useQuery(api.reviews.listByCompany, company?._id ? { companyId: company._id } : "skip");

  if (!reviewsEnabled) {
    return (
      <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
        <Header />
        <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
          <Link
            href={company ? buildCompanyProfilePath(company) : "/"}
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors mb-6"
          >
            <span>←</span> BACK TO PROFILE
          </Link>
          <p className="text-[14px] text-[#333]/70 mt-8">Reviews are currently unavailable.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
      <Header />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-8 flex-grow w-full">
        <Link
          href={company ? buildCompanyProfilePath(company) : "/"}
          className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors mb-6"
        >
          <span>←</span> BACK TO PROFILE
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[26px] font-semibold text-[#333] leading-[30px]">
              {company?.name ?? "Loading..."}
            </h1>
            {company && (
              <div className="flex items-center gap-1">
                <svg width="16" height="15" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.93511 0.71955C8.31202 -0.239851 9.68798 -0.23985 10.0649 0.719551L11.6204 4.67914C11.7825 5.09161 12.1742 5.37238 12.6219 5.39695L16.9196 5.63291C17.9609 5.69008 18.3861 6.98113 17.5777 7.63124L14.2414 10.3144C13.8938 10.5939 13.7442 11.0481 13.8589 11.4758L14.9595 15.5812C15.2262 16.576 14.113 17.3739 13.2364 16.8163L9.61892 14.5149C9.24208 14.2752 8.75792 14.2752 8.38108 14.5149L4.76355 16.8163C3.88703 17.3739 2.77385 16.576 3.04053 15.5812L4.14114 11.4758C4.25579 11.0481 4.10618 10.5939 3.75863 10.3144L0.422255 7.63124C-0.386142 6.98113 0.0390565 5.69008 1.08039 5.63291L5.37814 5.39695C5.82584 5.37238 6.21753 5.09161 6.37957 4.67914L7.93511 0.71955Z" fill="#f14110"/>
                </svg>
                <span className="font-bam text-[18px] font-bold tracking-[-0.2em] text-[#f14110]">{company.rating ?? 0}</span>
                <span className="text-[10px] text-[#f14110]/70">({company.reviewCount ?? 0})</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
            All reviews / Semua ulasan
          </p>
        </div>

        {reviews === undefined ? (
          <p className="text-[#333]/50 text-[12px]">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-[#333]/50 text-[12px]">No reviews yet.</p>
        ) : (
          <div>
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-[#333]/10 py-5">
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
