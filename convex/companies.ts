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
      companies = companies.filter(
        (c) => c.location?.toLowerCase().includes(args.location!.toLowerCase())
      );
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
    projectSizes: v.optional(v.array(v.string())),
    constructionTypes: v.optional(v.array(v.string())),
    constructionLocations: v.optional(v.array(v.string())),
    renovationTypes: v.optional(v.array(v.string())),
    renovationLocations: v.optional(v.array(v.string())),
    logoId: v.optional(v.id("_storage")),
    projectImageIds: v.optional(v.array(v.id("_storage"))),
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
