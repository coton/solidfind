"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Pagination, { PAGE_SIZE } from "../components/Pagination";

type Tab = "all" | "flagged" | "normal";

export default function AdminReviews() {
  const reviews = useQuery(api.reviews.listAll);
  const deleteReview = useMutation(api.reviews.deleteReview);
  const flagReview = useMutation(api.reviews.flagReview);
  const unflagReview = useMutation(api.reviews.unflagReview);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const filtered = reviews
    ?.filter((r) => {
      if (tab === "flagged") return r.flagged === true;
      if (tab === "normal") return !r.flagged;
      return true;
    })
    .filter((r) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.content.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        r.userDisplayName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q)
      );
    });

  const totalItems = filtered?.length ?? 0;
  const paginated = filtered?.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin";

  const handleDelete = async (id: Id<"reviews">) => {
    await deleteReview({ reviewId: id, adminEmail });
    setConfirmDelete(null);
  };

  const handleFilterChange = () => setCurrentPage(0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "flagged", label: "Flagged" },
    { key: "normal", label: "Normal" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#333] tracking-[0.48px]">Reviews</h1>
        <span className="text-[12px] text-[#333]/50">
          {totalItems} reviews
          {reviews && (
            <> &middot; {reviews.filter((r) => r.flagged).length} flagged</>
          )}
        </span>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-white border border-[#e4e4e4] rounded-[6px] p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); handleFilterChange(); }}
              className={`px-3 py-1.5 rounded-[4px] text-[11px] font-medium transition-colors ${
                tab === t.key
                  ? "bg-[#333] text-white"
                  : "text-[#333]/60 hover:text-[#333]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
          placeholder="Search reviews..."
          className="w-full max-w-[300px] h-9 px-3 bg-white border border-[#e4e4e4] rounded-[6px] text-[12px] text-[#333] outline-none focus:border-[#333] transition-colors"
        />
      </div>

      {/* Reviews list */}
      <div className="space-y-2">
        {paginated === undefined ? (
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-8 text-center">
            <p className="text-[12px] text-[#333]/50">Loading...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#e4e4e4] p-8 text-center">
            <p className="text-[12px] text-[#333]/50">No reviews found.</p>
          </div>
        ) : (
          paginated.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-[8px] border border-[#e4e4e4] p-4 ${
                review.flagged ? "border-l-4 border-l-red-400" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[12px] font-medium text-[#333]">
                      {review.companyName}
                    </span>
                    <span className="text-[11px] text-amber-500">
                      {"★".repeat(Math.round(review.rating))}
                      {"☆".repeat(5 - Math.round(review.rating))}
                    </span>
                    {review.flagged && (
                      <span className="text-[9px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        SPAM
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#333]/70 leading-[18px] mb-2">
                    {review.content.length > 80
                      ? review.content.slice(0, 80) + "..."
                      : review.content}
                  </p>
                  <div className="flex items-center gap-3 text-[9px] text-[#333]/40">
                    <span>by {review.userDisplayName}</span>
                    <span>{review.userEmail}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {review.flagged ? (
                    <button
                      onClick={() => unflagReview({ reviewId: review._id, adminEmail })}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-full border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                    >
                      Unflag
                    </button>
                  ) : (
                    <button
                      onClick={() => flagReview({ reviewId: review._id, adminEmail })}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-full border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      Flag Spam
                    </button>
                  )}

                  {confirmDelete === review._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-[10px] font-medium px-3 py-1.5 rounded-full border border-[#e4e4e4] hover:bg-[#f0f0f0] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(review._id)}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
