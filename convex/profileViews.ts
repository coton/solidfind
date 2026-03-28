import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const record = mutation({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("profileViews", {
      companyId: args.companyId,
      viewedAt: now,
    });
    // Increment the company's viewsLastMonth counter
    const company = await ctx.db.get(args.companyId);
    if (company) {
      await ctx.db.patch(args.companyId, {
        viewsLastMonth: (company.viewsLastMonth ?? 0) + 1,
      });
    }
  },
});

export const getMonthlyStats = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

    // Get start of current week (Monday)
    const today = new Date(now);
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(today.getDate() - daysSinceMonday);
    const thisWeekStart = startOfThisWeek.getTime();

    const weeks = [
      { month: "This week", start: thisWeekStart, end: now },
      { month: "Last week", start: thisWeekStart - MS_PER_WEEK, end: thisWeekStart },
      { month: "2 weeks ago", start: thisWeekStart - 2 * MS_PER_WEEK, end: thisWeekStart - MS_PER_WEEK },
      { month: "3 weeks ago", start: thisWeekStart - 3 * MS_PER_WEEK, end: thisWeekStart - 2 * MS_PER_WEEK },
    ];

    const results = [];
    for (const week of weeks) {
      const views = await ctx.db
        .query("profileViews")
        .withIndex("by_companyId_viewedAt", (q) =>
          q.eq("companyId", args.companyId).gte("viewedAt", week.start).lt("viewedAt", week.end)
        )
        .collect();
      results.push({ month: week.month, views: views.length });
    }

    // Reverse so oldest week is first (chart reads left to right)
    return results.reverse();
  },
});

export const getViewsLastMonth = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const views = await ctx.db
      .query("profileViews")
      .withIndex("by_companyId_viewedAt", (q) =>
        q.eq("companyId", args.companyId).gte("viewedAt", thirtyDaysAgo)
      )
      .collect();
    return views.length;
  },
});
