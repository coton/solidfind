import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const SPAM_KEYWORDS = [
  "http://",
  "https://",
  "www.",
  "casino",
  "spam",
  "click here",
  "buy now",
  "free money",
  "whatsapp.com",
  "t.me",
];

async function recalculateApprovedCompanyRating(ctx: any, companyId: any) {
  const reviews = await ctx.db
    .query("reviews")
    .withIndex("by_companyId", (q: any) => q.eq("companyId", companyId))
    .collect();
  const visibleReviews = reviews.filter((review: any) => review.approved !== false);

  if (visibleReviews.length === 0) {
    await ctx.db.patch(companyId, { rating: 0, reviewCount: 0 });
    return;
  }

  const avgRating =
    visibleReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / visibleReviews.length;

  await ctx.db.patch(companyId, {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: visibleReviews.length,
  });
}

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .collect();
    return reviews.filter((review) => review.approved !== false);
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Enrich with company name
    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const company = await ctx.db.get(r.companyId);
        return { ...r, companyName: company?.name ?? "Unknown Company" };
      })
    );

    return enriched;
  },
});

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.id("users"),
    userName: v.string(),
    rating: v.float64(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.accountType !== "individual") {
      throw new Error("Only individual accounts can leave testimonials.");
    }

    const existingUserReviews = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (existingUserReviews.some((review) => review.companyId === args.companyId)) {
      throw new Error("You have already left a testimonial for this company.");
    }

    // Spam detection
    const lowerContent = args.content.toLowerCase();
    const isFlagged = SPAM_KEYWORDS.some((kw) => lowerContent.includes(kw));

    const reviewId = await ctx.db.insert("reviews", {
      ...args,
      flagged: isFlagged || undefined,
      approved: false,
      createdAt: Date.now(),
    });

    return reviewId;
  },
});

// Admin: list all reviews with company and user info
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const reviews = await ctx.db.query("reviews").order("desc").collect();

    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const company = await ctx.db.get(r.companyId);
        const user = await ctx.db.get(r.userId);
        return {
          ...r,
          companyName: company?.name ?? "Unknown Company",
          userEmail: user?.email ?? "Unknown",
          userDisplayName: user?.name ?? user?.email ?? "Unknown",
        };
      })
    );

    return enriched;
  },
});

// Admin: delete a review and recalculate company rating
export const deleteReview = mutation({
  args: { reviewId: v.id("reviews"), adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) return;

    const companyId = review.companyId;
    await ctx.db.delete(args.reviewId);

    await recalculateApprovedCompanyRating(ctx, companyId);

    if (args.adminEmail) {
      await ctx.db.insert("auditLogs", {
        adminEmail: args.adminEmail,
        action: "delete_review",
        targetType: "review",
        targetId: args.reviewId,
        details: `Rating: ${review.rating}, Content: ${review.content.slice(0, 50)}`,
        createdAt: Date.now(),
      });
    }
  },
});

// Admin: approve a review and recalculate company rating
export const approveReview = mutation({
  args: { reviewId: v.id("reviews"), adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) return;

    await ctx.db.patch(args.reviewId, { approved: true, flagged: false });
    await recalculateApprovedCompanyRating(ctx, review.companyId);

    if (args.adminEmail) {
      await ctx.db.insert("auditLogs", {
        adminEmail: args.adminEmail,
        action: "approve_review",
        targetType: "review",
        targetId: args.reviewId,
        createdAt: Date.now(),
      });
    }
  },
});

// Admin: flag a review as spam
export const flagReview = mutation({
  args: { reviewId: v.id("reviews"), adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, { flagged: true });

    if (args.adminEmail) {
      await ctx.db.insert("auditLogs", {
        adminEmail: args.adminEmail,
        action: "flag_review_spam",
        targetType: "review",
        targetId: args.reviewId,
        createdAt: Date.now(),
      });
    }
  },
});

// Admin: unflag a review
export const unflagReview = mutation({
  args: { reviewId: v.id("reviews"), adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, { flagged: false });

    if (args.adminEmail) {
      await ctx.db.insert("auditLogs", {
        adminEmail: args.adminEmail,
        action: "unflag_review",
        targetType: "review",
        targetId: args.reviewId,
        createdAt: Date.now(),
      });
    }
  },
});
