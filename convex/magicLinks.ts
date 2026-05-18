import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("magicLinks")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

export const upsert = mutation({
  args: {
    code: v.string(),
    token: v.string(),
    companyId: v.id("companies"),
    companyName: v.string(),
    clerkUserId: v.string(),
    targetPath: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("magicLinks")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        token: args.token,
        companyId: args.companyId,
        companyName: args.companyName,
        clerkUserId: args.clerkUserId,
        targetPath: args.targetPath,
        expiresAt: args.expiresAt,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("magicLinks", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
