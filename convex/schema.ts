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
    deletionRequestedAt: v.optional(v.number()),
    deletionScheduledAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

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
    projectSize: v.optional(v.string()), // solo, family, shared
    imageUrl: v.optional(v.string()),
    bookmarkCount: v.optional(v.number()),
    viewsLastMonth: v.optional(v.number()),
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
    architectureTypes: v.optional(v.array(v.string())),
    architectureLocations: v.optional(v.array(v.string())),
    interiorTypes: v.optional(v.array(v.string())),
    interiorLocations: v.optional(v.array(v.string())),
    realEstateTypes: v.optional(v.array(v.string())),
    realEstateLocations: v.optional(v.array(v.string())),
    logoId: v.optional(v.id("_storage")),
    projectImageIds: v.optional(v.array(v.id("_storage"))),
    projectImageUrls: v.optional(v.array(v.string())), // External image URLs as fallback
    isFeatured: v.optional(v.boolean()),
    since: v.optional(v.number()), // Founded year
    subscriptionId: v.optional(v.id("subscriptions")),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_category", ["category"]),

  reports: defineTable({
    companyId: v.id("companies"),
    reporterUserId: v.optional(v.id("users")),
    text: v.string(),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("dismissed")),
    createdAt: v.number(),
  })
    .index("by_companyId", ["companyId"])
    .index("by_status", ["status"]),

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
    flagged: v.optional(v.boolean()),
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
    .index("by_userId_companyId", ["userId", "companyId"])
    .index("by_userId_companyId_category", ["userId", "companyId", "category"]),

  auditLogs: defineTable({
    adminEmail: v.string(),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"]),

  waitlist: defineTable({
    email: v.string(),
    notified: v.boolean(),
    notifiedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_notified", ["notified"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    companyId: v.id("companies"),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("frozen")
    ),
    xenditInvoiceId: v.optional(v.string()),
    xenditPaymentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.literal("IDR"),
    startDate: v.number(),
    endDate: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_companyId", ["companyId"])
    .index("by_status", ["status"])
    .index("by_xenditInvoiceId", ["xenditInvoiceId"]),

  accountDeletionFeedback: defineTable({
    userId: v.id("users"),
    reason: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  featuredArticles: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    categories: v.array(v.string()), // Multiple categories
    coverImageId: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    visible: v.boolean(),
    sortOrder: v.number(),
    contentBlocks: v.array(v.object({
      type: v.union(v.literal("text"), v.literal("image"), v.literal("quote"), v.literal("heading"), v.literal("video")),
      text: v.optional(v.string()),
      heading: v.optional(v.string()),
      imageId: v.optional(v.id("_storage")),
      imageUrl: v.optional(v.string()),
      imageCaption: v.optional(v.string()),
      quote: v.optional(v.string()),
      quoteAuthor: v.optional(v.string()),
      videoUrl: v.optional(v.string()),
      videoStorageId: v.optional(v.id("_storage")),
    })),
    companyId: v.optional(v.id("companies")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_visible", ["visible"]).index("by_sortOrder", ["sortOrder"]).index("by_companyId", ["companyId"]).index("by_categories", ["categories"]),

  platformSettings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_key", ["key"]),

  profileViews: defineTable({
    companyId: v.id("companies"),
    viewedAt: v.number(),
  }).index("by_companyId", ["companyId"])
    .index("by_companyId_viewedAt", ["companyId", "viewedAt"]),

  pageConfigs: defineTable({
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
    updatedAt: v.number(),
  }).index("by_categoryId", ["categoryId"]).index("by_sortOrder", ["sortOrder"]),
});
