import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedListings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Fetch company data for each saved listing
    const results = await Promise.all(
      saved.map(async (s) => {
        const company = await ctx.db.get(s.companyId);
        return { ...s, company };
      })
    );

    return results.filter((r) => r.company !== null);
  },
});

export const listSavedIds = query({
  args: {
    userId: v.id("users"),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const saved = await ctx.db
      .query("savedListings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const filtered = args.category
      ? saved.filter((s) => s.category === args.category)
      : saved;

    return filtered.map((s) => ({ companyId: s.companyId, category: s.category }));
  },
});

export const toggle = mutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("savedListings")
      .withIndex("by_userId_companyId_category", (q) =>
        q.eq("userId", args.userId).eq("companyId", args.companyId).eq("category", args.category)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      // Decrement bookmark count
      const company = await ctx.db.get(args.companyId);
      if (company) {
        await ctx.db.patch(args.companyId, {
          bookmarkCount: Math.max(0, (company.bookmarkCount ?? 0) - 1),
        });
      }
      return { saved: false };
    } else {
      await ctx.db.insert("savedListings", {
        userId: args.userId,
        companyId: args.companyId,
        category: args.category,
        savedAt: Date.now(),
      });
      const company = await ctx.db.get(args.companyId);
      if (company) {
        await ctx.db.patch(args.companyId, {
          bookmarkCount: (company.bookmarkCount ?? 0) + 1,
        });
      }
      return { saved: true };
    }
  },
});

export const isSaved = query({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("savedListings")
      .withIndex("by_userId_companyId_category", (q) =>
        q.eq("userId", args.userId).eq("companyId", args.companyId).eq("category", args.category)
      )
      .unique();

    return existing !== null;
  },
});
