"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Star, X } from "lucide-react";
import { starFillColor } from "@/lib/starColors";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: Id<"companies">;
  userId: Id<"users">;
  userName: string;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  userId,
  userName,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReview = useMutation(api.reviews.create);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0 || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await createReview({
        companyId,
        userId,
        userName,
        rating,
        content: content.trim(),
      });
      setRating(0);
      setContent("");
      onSuccess();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-[12px] w-full max-w-[440px] p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#333]/50 hover:text-[#f14110] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-[20px] font-semibold text-[#333] mb-2">Write a Review</h2>
        <p className="text-[11px] text-[#333]/50 mb-6 tracking-[0.22px]">
          Share your experience to help others make better decisions.
        </p>

        {/* Star Rating */}
        <div className="mb-6">
          <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-3">Your Rating</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onMouseEnter={() => setHoveredRating(i)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(i)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className="w-7 h-7"
                  style={{
                    fill: starFillColor(i - 1, hoveredRating || rating),
                    color: starFillColor(i - 1, hoveredRating || rating),
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <p className="text-[11px] font-medium text-[#333] tracking-[0.22px] mb-3">Your Review</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell us about your experience..."
            rows={5}
            className="w-full bg-[#f8f8f8] rounded-[6px] p-3 text-[11px] text-[#333] placeholder:text-[#333]/40 outline-none resize-none leading-[18px]"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || !content.trim() || isSubmitting}
          className="w-full h-[44px] rounded-full bg-[#f14110] text-white text-[12px] font-medium tracking-[0.24px] hover:bg-[#d93a0e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
