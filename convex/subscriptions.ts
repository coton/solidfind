import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByCompanyId = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    amount: v.number(),
    xenditInvoiceId: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      companyId: args.companyId,
      plan: args.plan,
      status: "pending",
      xenditInvoiceId: args.xenditInvoiceId,
      amount: args.amount,
      currency: "IDR",
      startDate: args.startDate,
      endDate: args.endDate,
      createdAt: Date.now(),
    });

    // Link subscription to company
    await ctx.db.patch(args.companyId, { subscriptionId });

    return subscriptionId;
  },
});

export const updateStatus = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("frozen")
    ),
    xenditPaymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    if (args.xenditPaymentId) {
      updates.xenditPaymentId = args.xenditPaymentId;
    }
    await ctx.db.patch(args.subscriptionId, updates);
  },
});

export const freeze = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) return;
    if (subscription.status === "active") {
      await ctx.db.patch(args.subscriptionId, { status: "frozen" });
    }
  },
});

export const unfreeze = mutation({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription) return;
    if (subscription.status === "frozen") {
      await ctx.db.patch(args.subscriptionId, { status: "active" });
    }
  },
});
