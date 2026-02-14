import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByCompany = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .collect();
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
    const reviewId = await ctx.db.insert("reviews", {
      ...args,
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
