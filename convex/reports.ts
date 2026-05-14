import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    reporterUserId: v.optional(v.id("users")),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      companyId: args.companyId,
      reporterUserId: args.reporterUserId,
      text: args.text,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("reports")
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      reports.map(async (r) => {
        const company = await ctx.db.get(r.companyId);
        const reporter = r.reporterUserId ? await ctx.db.get(r.reporterUserId) : null;
        return {
          ...r,
          companyName: company?.name ?? "Deleted Company",
          companySlug: company?.slug,
          reporterName: reporter?.name,
          reporterEmail: reporter?.email,
          reporterAccountType: reporter?.accountType,
        };
      })
    );

    return enriched;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("dismissed")),
    adminEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });

    if (args.adminEmail) {
      await ctx.db.insert("auditLogs", {
        adminEmail: args.adminEmail,
        action: `report_${args.status}`,
        targetType: "report",
        targetId: args.id,
        details: `Status changed to ${args.status}`,
        createdAt: Date.now(),
      });
    }
  },
});
