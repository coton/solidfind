import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    accountType: v.union(v.literal("company"), v.literal("individual")),
    companyName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      accountType: args.accountType,
      companyName: args.companyName,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });
  },
});

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const updateAccountType = mutation({
  args: {
    clerkId: v.string(),
    accountType: v.union(v.literal("company"), v.literal("individual")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) return;
    await ctx.db.patch(user._id, { accountType: args.accountType });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

export const deleteAccount = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return;

    // Delete user's companies
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();

    for (const company of companies) {
      // Delete reviews for this company
      const companyReviews = await ctx.db
        .query("reviews")
        .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
        .collect();
      for (const review of companyReviews) {
        await ctx.db.delete(review._id);
      }

      // Delete saved listings referencing this company
      const savedForCompany = await ctx.db
        .query("savedListings")
        .collect();
      for (const saved of savedForCompany) {
        if (saved.companyId === company._id) {
          await ctx.db.delete(saved._id);
        }
      }

      await ctx.db.delete(company._id);
    }

    // Delete user's reviews
    const userReviews = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const review of userReviews) {
      await ctx.db.delete(review._id);
    }

    // Delete user's saved listings
    const userSaved = await ctx.db
      .query("savedListings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();
    for (const saved of userSaved) {
      await ctx.db.delete(saved._id);
    }

    // Delete user
    await ctx.db.delete(user._id);
  },
});
