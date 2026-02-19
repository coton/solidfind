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

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .collect();
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
    // Spam detection
    const lowerContent = args.content.toLowerCase();
    const isFlagged = SPAM_KEYWORDS.some((kw) => lowerContent.includes(kw));

    const reviewId = await ctx.db.insert("reviews", {
      ...args,
      flagged: isFlagged || undefined,
      createdAt: Date.now(),
    });

    // Update company rating
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .collect();

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await ctx.db.patch(args.companyId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
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

    // Recalculate company rating
    const remaining = await ctx.db
      .query("reviews")
      .withIndex("by_companyId", (q) => q.eq("companyId", companyId))
      .collect();

    if (remaining.length === 0) {
      await ctx.db.patch(companyId, { rating: 0, reviewCount: 0 });
    } else {
      const avgRating =
        remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length;
      await ctx.db.patch(companyId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: remaining.length,
      });
    }

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
