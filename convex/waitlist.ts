import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Add email to waitlist (Coming Soon page)
 */
export const addToWaitlist = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return { success: true, alreadyExists: true };
    }

    // Add new email
    await ctx.db.insert("waitlist", {
      email: args.email,
      notified: false,
      createdAt: Date.now(),
    });

    return { success: true, alreadyExists: false };
  },
});

/**
 * Get all waitlist emails (Admin Dashboard)
 */
export const getWaitlist = query({
  args: {
    notified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let waitlist;

    if (args.notified !== undefined) {
      waitlist = await ctx.db
        .query("waitlist")
        .withIndex("by_notified", (q) => q.eq("notified", args.notified as boolean))
        .order("desc")
        .collect();
    } else {
      waitlist = await ctx.db.query("waitlist").order("desc").collect();
    }

    return {
      emails: waitlist,
      total: waitlist.length,
      notified: waitlist.filter((e) => e.notified).length,
      pending: waitlist.filter((e) => !e.notified).length,
    };
  },
});

/**
 * Mark email(s) as notified (Launch Day)
 */
export const markAsNotified = mutation({
  args: {
    emailIds: v.array(v.id("waitlist")),
  },
  handler: async (ctx, args) => {
    for (const id of args.emailIds) {
      await ctx.db.patch(id, {
        notified: true,
        notifiedAt: Date.now(),
      });
    }

    return { success: true, count: args.emailIds.length };
  },
});

/**
 * Delete waitlist email (Admin)
 */
export const deleteWaitlistEmail = mutation({
  args: {
    emailId: v.id("waitlist"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.emailId);
    return { success: true };
  },
});
