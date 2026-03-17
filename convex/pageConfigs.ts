import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("pageConfigs").withIndex("by_sortOrder").collect();
    return configs.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("pageConfigs").withIndex("by_sortOrder").collect();
    return configs.filter((c) => c.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getByCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pageConfigs")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    categoryId: v.string(),
    label: v.string(),
    subtitle: v.string(),
    visible: v.boolean(),
    sortOrder: v.number(),
    filters: v.array(v.object({
      id: v.string(),
      title: v.string(),
      options: v.array(v.object({
        id: v.string(),
        label: v.string(),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pageConfigs")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
      return existing._id;
    } else {
      return await ctx.db.insert("pageConfigs", { ...args, updatedAt: Date.now() });
    }
  },
});

export const updateVisibility = mutation({
  args: {
    id: v.id("pageConfigs"),
    visible: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { visible: args.visible, updatedAt: Date.now() });
  },
});

export const addPage = mutation({
  args: {
    categoryId: v.string(),
    label: v.string(),
    subtitle: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("pageConfigs").collect();
    const maxSort = all.length > 0 ? Math.max(...all.map((c) => c.sortOrder)) : -1;

    return await ctx.db.insert("pageConfigs", {
      categoryId: args.categoryId,
      label: args.label,
      subtitle: args.subtitle,
      visible: false,
      sortOrder: maxSort + 1,
      filters: [],
      updatedAt: Date.now(),
    });
  },
});

export const removePage = mutation({
  args: { id: v.id("pageConfigs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

const defaultConfigs = [
  {
    categoryId: "construction",
    label: "01. Construction",
    subtitle: "Find construction professionals for residential, commercial and hospitality projects.",
    visible: true,
    sortOrder: 0,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        options: [
          { id: "any", label: "ANY SIZE" },
          { id: "solo", label: "SOLO / COUPLE (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        options: [
          { id: "all", label: "ALL TYPES" },
          { id: "residential", label: "RESIDENTIAL" },
          { id: "commercial", label: "COMMERCIAL" },
          { id: "hospitality", label: "HOSPITALITY" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        options: [
          { id: "bali", label: "BALI" },
          { id: "badung", label: "BADUNG" },
          { id: "denpasar", label: "DENPASAR" },
          { id: "tabanan", label: "TABANAN" },
          { id: "gianyar", label: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM" },
          { id: "bangli", label: "BANGLI" },
          { id: "buleleng", label: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "renovation",
    label: "02. Renovation",
    subtitle: "Find renovation professionals for complete upgrades, targeted improvements, and structural works.",
    visible: true,
    sortOrder: 1,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        options: [
          { id: "any", label: "ANY SIZE" },
          { id: "solo", label: "SOLO / COUPLE (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        options: [
          { id: "all", label: "EVERY RENOVATIONS" },
          { id: "complete", label: "COMPLETE HOUSE" },
          { id: "living", label: "LIVING ROOM" },
          { id: "kitchen", label: "KITCHEN" },
          { id: "bathroom", label: "BATHROOM" },
          { id: "bedroom", label: "BEDROOM" },
          { id: "electricity", label: "ELECTRICITY" },
          { id: "plumbing", label: "PLUMBING" },
          { id: "roofing", label: "ROOFING" },
          { id: "waterproofing", label: "WATERPROOFING" },
          { id: "pool", label: "POOL" },
          { id: "mold", label: "MOLD TREATMENT" },
          { id: "tiling", label: "TILING" },
          { id: "painting", label: "PAINTING" },
          { id: "fencing", label: "FENCING" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        options: [
          { id: "bali", label: "BALI" },
          { id: "badung", label: "BADUNG" },
          { id: "denpasar", label: "DENPASAR" },
          { id: "tabanan", label: "TABANAN" },
          { id: "gianyar", label: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM" },
          { id: "bangli", label: "BANGLI" },
          { id: "buleleng", label: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "architecture",
    label: "03. Architecture",
    subtitle: "Find architecture studios for concept design, planning, and project development.",
    visible: false,
    sortOrder: 2,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        options: [
          { id: "any", label: "ANY SIZE" },
          { id: "solo", label: "SOLO / COUPLE (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        options: [
          { id: "all", label: "ALL TYPES" },
          { id: "residential", label: "RESIDENTIAL" },
          { id: "commercial", label: "COMMERCIAL" },
          { id: "renovations-extensions", label: "RENOVATIONS & EXTENSIONS" },
          { id: "sustainable-eco", label: "SUSTAINABLE / ECO-ARCHI." },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        options: [
          { id: "bali", label: "BALI" },
          { id: "badung", label: "BADUNG" },
          { id: "denpasar", label: "DENPASAR" },
          { id: "tabanan", label: "TABANAN" },
          { id: "gianyar", label: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM" },
          { id: "bangli", label: "BANGLI" },
          { id: "buleleng", label: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "interior",
    label: "04. Interior",
    subtitle: "Find interior professionals for space planning, styling, furnitures and full interior projects.",
    visible: false,
    sortOrder: 3,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        options: [
          { id: "any", label: "ANY SIZE" },
          { id: "solo", label: "SOLO / COUPLE (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        options: [
          { id: "all", label: "ALL TYPES" },
          { id: "residential", label: "RESIDENTIAL" },
          { id: "commercial", label: "COMMERCIAL" },
          { id: "hospitality", label: "HOSPITALITY" },
          { id: "furnitures", label: "FURNITURES" },
          { id: "lighting", label: "LIGHTING" },
          { id: "styling-decoration", label: "STYLING & DECORATION" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        options: [
          { id: "bali", label: "BALI" },
          { id: "badung", label: "BADUNG" },
          { id: "denpasar", label: "DENPASAR" },
          { id: "tabanan", label: "TABANAN" },
          { id: "gianyar", label: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM" },
          { id: "bangli", label: "BANGLI" },
          { id: "buleleng", label: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "real-estate",
    label: "05. Real Estate",
    subtitle: "Find real estate professionals for property acquisition, sales, and investment opportunities.",
    visible: false,
    sortOrder: 4,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        options: [
          { id: "any", label: "ANY SIZE" },
          { id: "solo", label: "SOLO / COUPLE (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        options: [
          { id: "all", label: "ALL TYPES" },
          { id: "residential", label: "RESIDENTIAL" },
          { id: "commercial", label: "COMMERCIAL" },
          { id: "land-development", label: "LAND & DEVELOPMENT PLOTS" },
          { id: "property-management", label: "PROPERTY MANAGEMENT" },
          { id: "legal-notary", label: "LEGAL & NOTARY SERVICES" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        options: [
          { id: "bali", label: "BALI" },
          { id: "badung", label: "BADUNG" },
          { id: "denpasar", label: "DENPASAR" },
          { id: "tabanan", label: "TABANAN" },
          { id: "gianyar", label: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM" },
          { id: "bangli", label: "BANGLI" },
          { id: "buleleng", label: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA" },
        ],
      },
    ],
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("pageConfigs").first();
    if (existing) return "already_seeded";

    for (const config of defaultConfigs) {
      await ctx.db.insert("pageConfigs", { ...config, updatedAt: Date.now() });
    }
    return "seeded";
  },
});
