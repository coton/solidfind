import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const createInvoice = action({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    email: v.string(),
    companyName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get pricing phase from platform settings
    const pricingPhase = await ctx.runQuery(
      internal.xendit.getPricingPhase
    );
    const phase = pricingPhase ?? "launch";

    // Get price based on plan and phase
    const priceKey =
      args.plan === "monthly"
        ? `monthly_price_${phase}`
        : `yearly_price_${phase}`;
    const priceStr = await ctx.runQuery(internal.xendit.getPriceSetting, {
      key: priceKey,
    });
    const amount = parseInt(priceStr ?? "0", 10);

    if (amount <= 0) {
      throw new Error("Invalid pricing configuration");
    }

    // Calculate dates
    const now = Date.now();
    const endDate =
      args.plan === "monthly"
        ? now + 30 * 24 * 60 * 60 * 1000
        : now + 365 * 24 * 60 * 60 * 1000;

    // Create Xendit invoice
    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("XENDIT_SECRET_KEY not configured");
    }

    const externalId = `sf-${args.companyId}-${Date.now()}`;

    const response = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(secretKey + ":")}`,
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        currency: "IDR",
        description: `SolidFind Pro ${args.plan === "monthly" ? "Monthly" : "Yearly"} - ${args.companyName}`,
        payer_email: args.email,
        invoice_duration: 86400, // 24 hours
        success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://solidfind.vercel.app"}/company-dashboard?payment=success`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://solidfind.vercel.app"}/company-dashboard?payment=failed`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Xendit API error: ${error}`);
    }

    const invoice = await response.json();

    // Create subscription record
    await ctx.runMutation(internal.xendit.createSubscriptionRecord, {
      userId: args.userId,
      companyId: args.companyId,
      plan: args.plan,
      amount,
      xenditInvoiceId: invoice.id,
      startDate: now,
      endDate,
    });

    return { invoiceUrl: invoice.invoice_url };
  },
});

// Internal queries used by createInvoice action
import { internalQuery } from "./_generated/server";

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

// Internal mutation to create subscription (called from action)
export const createSubscriptionRecord = internalMutation({
  args: {
    userId: v.id("users"),
    companyId: v.id("companies"),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    amount: v.number(),
    xenditInvoiceId: v.string(),
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

    await ctx.db.patch(args.companyId, { subscriptionId });

    return subscriptionId;
  },
});

// Webhook handler: processes Xendit payment callback
export const handleWebhookPayment = internalMutation({
  args: {
    xenditInvoiceId: v.string(),
    status: v.string(),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_xenditInvoiceId", (q) =>
        q.eq("xenditInvoiceId", args.xenditInvoiceId)
      )
      .first();

    if (!subscription) {
      console.error(`No subscription found for invoice: ${args.xenditInvoiceId}`);
      return;
    }

    if (args.status === "PAID" || args.status === "SETTLED") {
      // Payment success
      await ctx.db.patch(subscription._id, {
        status: "active",
        xenditPaymentId: args.paymentId,
      });

      // Set company as Pro
      await ctx.db.patch(subscription.companyId, {
        isPro: true,
        subscriptionId: subscription._id,
      });
    } else if (args.status === "EXPIRED" || args.status === "FAILED") {
      // Payment failed
      await ctx.db.patch(subscription._id, {
        status: "expired",
      });
    }
  },
});
