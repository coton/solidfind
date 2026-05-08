import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const requestDeletion = mutation({
  args: {
    clerkId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    const now = Date.now();

    // Set deletion dates on user
    await ctx.db.patch(user._id, {
      deletionRequestedAt: now,
      deletionScheduledAt: now + THIRTY_DAYS_MS,
    });

    // Store feedback
    await ctx.db.insert("accountDeletionFeedback", {
      userId: user._id,
      reason: args.reason,
      createdAt: now,
    });

    // Freeze any active subscription
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();

    for (const company of companies) {
      if (company.subscriptionId) {
        const subscription = await ctx.db.get(company.subscriptionId);
        if (subscription && subscription.status === "active") {
          await ctx.db.patch(subscription._id, { status: "frozen" });
        }
      }
    }
  },
});

export const cancelDeletion = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) throw new Error("User not found");

    // Remove deletion request
    await ctx.db.patch(user._id, {
      deletionRequestedAt: undefined,
      deletionScheduledAt: undefined,
    });

    // Unfreeze subscriptions
    const companies = await ctx.db
      .query("companies")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();

    for (const company of companies) {
      if (company.subscriptionId) {
        const subscription = await ctx.db.get(company.subscriptionId);
        if (subscription && subscription.status === "frozen") {
          await ctx.db.patch(subscription._id, { status: "active" });
        }
      }
    }
  },
});

export const getDeletionStatus = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user || !user.deletionRequestedAt) return null;

    const now = Date.now();
    const daysRemaining = Math.max(
      0,
      Math.ceil(((user.deletionScheduledAt ?? 0) - now) / (24 * 60 * 60 * 1000))
    );

    return {
      requestedAt: user.deletionRequestedAt,
      scheduledAt: user.deletionScheduledAt,
      daysRemaining,
    };
  },
});

// To be called by a cron job: permanently deletes accounts past 30 days
export const processExpiredDeletions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find users with expired deletion schedules
    const allUsers = await ctx.db.query("users").collect();
    const expiredUsers = allUsers.filter(
      (u) => u.deletionScheduledAt && u.deletionScheduledAt <= now
    );

    for (const user of expiredUsers) {
      // Delete user's companies and associated data
      const companies = await ctx.db
        .query("companies")
        .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
        .collect();

      for (const company of companies) {
        // Delete subscriptions
        if (company.subscriptionId) {
          await ctx.db.delete(company.subscriptionId);
        }

        // Delete reviews for this company
        const companyReviews = await ctx.db
          .query("reviews")
          .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
          .collect();
        for (const review of companyReviews) {
          await ctx.db.delete(review._id);
        }

        // Delete saved listings referencing this company
        const savedForCompany = await ctx.db.query("savedListings").collect();
        for (const saved of savedForCompany) {
          if (saved.companyId === company._id) {
            await ctx.db.delete(saved._id);
          }
        }

        // Delete reports for this company
        const reports = await ctx.db
          .query("reports")
          .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
          .collect();
        for (const report of reports) {
          await ctx.db.delete(report._id);
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

      // Delete deletion feedback
      const feedback = await ctx.db
        .query("accountDeletionFeedback")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect();
      for (const fb of feedback) {
        await ctx.db.delete(fb._id);
      }

      // Delete user
      await ctx.db.delete(user._id);
    }

    return { deletedCount: expiredUsers.length };
  },
});

// Admin: list all deletion feedback
export const listFeedback = query({
  args: {},
  handler: async (ctx) => {
    const feedback = await ctx.db
      .query("accountDeletionFeedback")
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      feedback.map(async (fb) => {
        const user = await ctx.db.get(fb.userId);
        return {
          ...fb,
          userEmail: user?.email ?? "deleted",
          userName: user?.name ?? "unknown",
        };
      })
    );

    return enriched;
  },
});
