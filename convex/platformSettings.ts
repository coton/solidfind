import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting?.value ?? null;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("platformSettings").collect();
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: args.updatedBy,
      });
    } else {
      await ctx.db.insert("platformSettings", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: args.updatedBy,
      });
    }
  },
});

// Seed default settings (call once to initialize)
export const seedDefaults = internalMutation({
  args: {},
  handler: async (ctx) => {
    const defaults: Record<string, string> = {
      pro_enabled: "false",
      monthly_price_launch: "450000",
      yearly_price_launch: "5000000",
      monthly_price_standard: "650000",
      yearly_price_standard: "7000000",
      pricing_phase: "launch",
    };

    for (const [key, value] of Object.entries(defaults)) {
      const existing = await ctx.db
        .query("platformSettings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();

      if (!existing) {
        await ctx.db.insert("platformSettings", {
          key,
          value,
          updatedAt: Date.now(),
        });
      }
    }
  },
});
