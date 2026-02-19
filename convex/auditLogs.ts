import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: {
    adminEmail: v.string(),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("auditLogs")
      .order("desc")
      .collect();
  },
});
