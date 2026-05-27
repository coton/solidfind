import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";

export const createCheckout = action({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    email: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    const pricingPhase = await ctx.runQuery(internal.midtrans.getPricingPhase);
    const phase = pricingPhase ?? "launch";
    const priceKey =
      args.plan === "monthly"
        ? `monthly_price_${phase}`
        : `yearly_price_${phase}`;
    const priceStr = await ctx.runQuery(internal.midtrans.getPriceSetting, {
      key: priceKey,
    });
    const amount = parseInt(priceStr ?? "0", 10);

    if (amount <= 0) {
      throw new Error("Invalid pricing configuration");
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY not configured");
    }

    const now = Date.now();
    const endDate =
      args.plan === "monthly"
        ? now + 30 * 24 * 60 * 60 * 1000
        : now + 365 * 24 * 60 * 60 * 1000;
    const orderId = `sf-${now}-${args.companyId.slice(0, 20)}`;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const endpoint = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${serverKey}:`)}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        item_details: [
          {
            id: `solidfind-pro-${args.plan}`,
            price: amount,
            quantity: 1,
            name: `SolidFind Pro ${args.plan === "monthly" ? "Monthly" : "Yearly"}`,
          },
        ],
        customer_details: {
          first_name: args.companyName,
          email: args.email,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Midtrans API error: ${error}`);
    }

    const transaction: { redirect_url?: string } = await response.json();
    if (!transaction.redirect_url) {
      throw new Error("Midtrans did not return a checkout URL");
    }

    await ctx.runMutation(internal.midtrans.createSubscriptionRecord, {
      userId: args.userId,
      companyId: args.companyId,
      plan: args.plan,
      amount,
      midtransOrderId: orderId,
      startDate: now,
      endDate,
    });

    return { redirectUrl: transaction.redirect_url };
  },
});

export const getPricingPhase = internalQuery({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", "pricing_phase"))
      .first();
    return setting?.value ?? "launch";
  },
});

export const getPriceSetting = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("platformSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return setting?.value ?? null;
  },
});

export const createSubscriptionRecord = internalMutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    amount: v.number(),
    midtransOrderId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      companyId: args.companyId,
      plan: args.plan,
      status: "pending",
      midtransOrderId: args.midtransOrderId,
      amount: args.amount,
      currency: "IDR",
      startDate: args.startDate,
      endDate: args.endDate,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.companyId, { subscriptionId });

    return subscriptionId;
  },
});

export const handlePaymentNotification = internalMutation({
  args: {
    midtransOrderId: v.string(),
    transactionStatus: v.string(),
    transactionId: v.optional(v.string()),
    fraudStatus: v.optional(v.string()),
    grossAmount: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_midtransOrderId", (q) =>
        q.eq("midtransOrderId", args.midtransOrderId)
      )
      .first();

    if (!subscription) {
      console.error(`No subscription found for order: ${args.midtransOrderId}`);
      return;
    }

    if (Number(args.grossAmount) !== subscription.amount) {
      console.error(`Payment amount does not match order: ${args.midtransOrderId}`);
      return;
    }

    const status = args.transactionStatus.toLowerCase();
    const paid =
      status === "settlement" ||
      (status === "capture" && args.fraudStatus?.toLowerCase() === "accept");

    if (paid) {
      await ctx.db.patch(subscription._id, {
        status: "active",
        midtransTransactionId: args.transactionId,
      });
      await ctx.db.patch(subscription.companyId, {
        isPro: true,
        subscriptionId: subscription._id,
      });
    } else if (["expire", "cancel", "deny", "failure"].includes(status)) {
      await ctx.db.patch(subscription._id, {
        status: "expired",
        midtransTransactionId: args.transactionId,
      });
    }
  },
});
