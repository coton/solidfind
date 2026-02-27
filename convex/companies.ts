import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
    location: v.optional(v.string()),
    search: v.optional(v.string()),
    projectSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let companies;

    if (args.category) {
      companies = await ctx.db
        .query("companies")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      companies = await ctx.db.query("companies").collect();
    }

    if (args.location) {
      // Handle comma-separated multiple locations
      const selectedLocations = args.location.toLowerCase().split(",");
      companies = companies.filter((c) => {
        if (!c.location) return false;
        const companyLocation = c.location.toLowerCase();
        return selectedLocations.some(loc => companyLocation.includes(loc.trim()));
      });
    }

    if (args.search) {
      const s = args.search.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.description?.toLowerCase().includes(s)
      );
    }

    if (args.projectSize && args.projectSize !== "any") {
      companies = companies.filter(
        (c) => c.projectSize === args.projectSize
      );
    }

    // Pro companies listed first
    companies.sort((a, b) => (b.isPro ? 1 : 0) - (a.isPro ? 1 : 0));

    return companies;
  },
});

export const latest = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").order("desc").take(4);
    return companies;
  },
});

export const getById = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", args.ownerId))
      .first();
  },
});

export const getAdjacentIds = query({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("companies").order("asc").collect();
    const idx = all.findIndex((c) => c._id === args.id);
    if (idx === -1) return { prevId: null, nextId: null };
    return {
      prevId: idx > 0 ? all[idx - 1]._id : null,
      nextId: idx < all.length - 1 ? all[idx + 1]._id : null,
    };
  },
});

export const create = mutation({
  args: {
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    subcategory: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    isPro: v.boolean(),
    projects: v.optional(v.number()),
    teamSize: v.optional(v.number()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    facebook: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    instagram: v.optional(v.string()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("companies", {
      ...args,
      rating: 0,
      reviewCount: 0,
      bookmarkCount: 0,
      viewsLastMonth: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    isPro: v.optional(v.boolean()),
    projects: v.optional(v.number()),
    teamSize: v.optional(v.number()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    facebook: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    instagram: v.optional(v.string()),
    projectSizes: v.optional(v.array(v.string())),
    constructionTypes: v.optional(v.array(v.string())),
    constructionLocations: v.optional(v.array(v.string())),
    renovationTypes: v.optional(v.array(v.string())),
    renovationLocations: v.optional(v.array(v.string())),
    logoId: v.optional(v.id("_storage")),
    projectImageIds: v.optional(v.array(v.id("_storage"))),
    isFeatured: v.optional(v.boolean()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filtered[key] = value;
      }
    }
    await ctx.db.patch(id, filtered);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").order("desc").collect();
    const enriched = await Promise.all(
      companies.map(async (c) => {
        const owner = await ctx.db.get(c.ownerId);
        return { ...c, ownerEmail: owner?.email ?? "unknown" };
      })
    );
    return enriched;
  },
});

export const remove = mutation({
  args: { id: v.id("companies"), adminEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.id);
    // Delete associated reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.id))
      .collect();
    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }
    // Delete associated saved listings
    const saved = await ctx.db.query("savedListings").collect();
    for (const s of saved) {
      if (s.companyId === args.id) {
        await ctx.db.delete(s._id);
      }
    }
    // Delete associated reports
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.id))
      .collect();
    for (const report of reports) {
      await ctx.db.delete(report._id);
    }
    await ctx.db.delete(args.id);

    if (args.adminEmail) {
      await ctx.db.insert("auditLogs", {
        adminEmail: args.adminEmail,
        action: "delete_company",
        targetType: "company",
        targetId: args.id,
        details: company?.name ?? "Unknown",
        createdAt: Date.now(),
      });
    }
  },
});

export const listIds = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query("companies").collect();
    return companies.map((c) => ({ id: c._id, createdAt: c.createdAt }));
  },
});
