import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    accountType: v.union(v.literal("company"), v.literal("individual")),
    companyName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  companies: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // construction, renovation, architecture, interior, real-estate
    subcategory: v.optional(v.string()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    isPro: v.boolean(),
    rating: v.optional(v.float64()),
    reviewCount: v.optional(v.number()),
    projects: v.optional(v.number()),
    teamSize: v.optional(v.number()),
    bookmarkCount: v.optional(v.number()),
    viewsLastMonth: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_category", ["category"]),

  listings: defineTable({
    companyId: v.id("companies"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    subcategory: v.optional(v.string()),
    location: v.optional(v.string()),
    projectSize: v.optional(v.string()),
    isFeatured: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_companyId", ["companyId"])
    .index("by_category", ["category"]),

  reviews: defineTable({
    companyId: v.id("companies"),
    userId: v.id("users"),
    userName: v.string(),
    rating: v.float64(),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_companyId", ["companyId"])
    .index("by_userId", ["userId"]),

  savedListings: defineTable({
    userId: v.id("users"),
    companyId: v.id("companies"),
    category: v.string(),
    savedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_companyId", ["userId", "companyId"]),
});
