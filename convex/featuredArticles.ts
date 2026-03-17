import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const contentBlockValidator = v.object({
  type: v.union(v.literal("text"), v.literal("image"), v.literal("quote"), v.literal("heading")),
  text: v.optional(v.string()),
  heading: v.optional(v.string()),
  imageId: v.optional(v.id("_storage")),
  imageUrl: v.optional(v.string()),
  imageCaption: v.optional(v.string()),
  quote: v.optional(v.string()),
  quoteAuthor: v.optional(v.string()),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("featuredArticles")
      .withIndex("by_sortOrder")
      .collect();
  },
});

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("featuredArticles")
      .withIndex("by_sortOrder")
      .collect();
    return all.filter((a) => a.visible);
  },
});

export const getById = query({
  args: { id: v.id("featuredArticles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    category: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    visible: v.boolean(),
    sortOrder: v.number(),
    contentBlocks: v.array(contentBlockValidator),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("featuredArticles", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("featuredArticles"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    category: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    visible: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    contentBlocks: v.optional(v.array(contentBlockValidator)),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Remove undefined fields
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("featuredArticles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateVisibility = mutation({
  args: { id: v.id("featuredArticles"), visible: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      visible: args.visible,
      updatedAt: Date.now(),
    });
  },
});
