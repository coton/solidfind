"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

export default function UserReviewsPage() {
  const { user: clerkUser, isLoaded } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );

  const reviews = useQuery(
    api.reviews.listByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        <div className="mb-6">
          <Link
            href={clerkUser ? "/dashboard" : "/"}
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#333] tracking-[0.22px] hover:text-[#f14110] transition-colors mb-4"
          >
            <span>←</span> BACK
          </Link>
          <h1 className="text-[32px] font-bold text-[#333] tracking-[0.64px]">
            Your reviews
          </h1>
          <p className="text-[11px] text-[#333]/70 tracking-[0.22px]">
            Ulasan Anda
          </p>
        </div>

        {!isLoaded ? (
          <p className="text-[#333]/50 text-[12px]">Loading...</p>
        ) : !clerkUser ? (
          <div className="text-center py-12">
            <p className="text-[16px] text-[#333] mb-4">You need to be signed in to view your reviews.</p>
            <Link
              href="/sign-in"
              className="inline-block h-10 px-6 rounded-full bg-[#f14110] text-white text-[11px] font-medium tracking-[0.22px] hover:bg-[#d93a0e] transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : reviews === undefined ? (
          <p className="text-[#333]/50 text-[12px]">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-[#333]/50 text-[12px]">You haven&apos;t written any reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-[6px] p-5">
                <Link
                  href={`/profile/${review.companyId}`}
                  className="text-[13px] font-semibold text-[#f14110] hover:underline mb-2 inline-block"
                >
                  {review.companyName}
                </Link>
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
