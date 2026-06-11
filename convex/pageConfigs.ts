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
    labelId: v.optional(v.string()),
    subtitle: v.string(),
    subtitleId: v.optional(v.string()),
    visible: v.boolean(),
    sortOrder: v.number(),
    filters: v.array(v.object({
      id: v.string(),
      title: v.string(),
      titleId: v.optional(v.string()),
      options: v.array(v.object({
        id: v.string(),
        label: v.string(),
        labelId: v.optional(v.string()),
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
    labelId: v.optional(v.string()),
    subtitle: v.string(),
    subtitleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("pageConfigs").collect();
    const maxSort = all.length > 0 ? Math.max(...all.map((c) => c.sortOrder)) : -1;

    return await ctx.db.insert("pageConfigs", {
      categoryId: args.categoryId,
      label: args.label,
      labelId: args.labelId,
      subtitle: args.subtitle,
      subtitleId: args.subtitleId,
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
    labelId: "01. Konstruksi",
    subtitle: "Find construction professionals for residential, commercial and hospitality projects.",
    subtitleId: "Temukan profesional konstruksi untuk proyek residensial, komersial, dan perhotelan.",
    visible: true,
    sortOrder: 0,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        titleId: "UKURAN PROYEK",
        options: [
          { id: "any", label: "ANY SIZE", labelId: "SEMUA UKURAN" },
          { id: "solo", label: "SOLO / COUPLE (1-2)", labelId: "SOLO / PASANGAN (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)", labelId: "KELUARGA / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)", labelId: "BERSAMA / KOMUNITAS (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        titleId: "KATEGORI",
        options: [
          { id: "all", label: "ALL TYPES", labelId: "SEMUA JENIS" },
          { id: "residential", label: "RESIDENTIAL", labelId: "RESIDENSIAL" },
          { id: "commercial", label: "COMMERCIAL", labelId: "KOMERSIAL" },
          { id: "hospitality", label: "HOSPITALITY", labelId: "PERHOTELAN" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        titleId: "LOKASI",
        options: [
          { id: "bali", label: "BALI", labelId: "BALI" },
          { id: "badung", label: "BADUNG", labelId: "BADUNG" },
          { id: "denpasar", label: "DENPASAR", labelId: "DENPASAR" },
          { id: "tabanan", label: "TABANAN", labelId: "TABANAN" },
          { id: "gianyar", label: "GIANYAR", labelId: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG", labelId: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM", labelId: "KARANGASEM" },
          { id: "bangli", label: "BANGLI", labelId: "BANGLI" },
          { id: "buleleng", label: "BULELENG", labelId: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA", labelId: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "renovation",
    label: "02. Renovation",
    labelId: "02. Renovasi",
    subtitle: "Find renovation professionals for complete upgrades, targeted improvements, and structural works.",
    subtitleId: "Temukan profesional renovasi untuk peningkatan menyeluruh, perbaikan terarah, dan pekerjaan struktural.",
    visible: true,
    sortOrder: 1,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        titleId: "UKURAN PROYEK",
        options: [
          { id: "any", label: "ANY SIZE", labelId: "SEMUA UKURAN" },
          { id: "solo", label: "SOLO / COUPLE (1-2)", labelId: "SOLO / PASANGAN (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)", labelId: "KELUARGA / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)", labelId: "BERSAMA / KOMUNITAS (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        titleId: "KATEGORI",
        options: [
          { id: "all", label: "EVERY RENOVATIONS", labelId: "SEMUA RENOVASI" },
          { id: "complete", label: "COMPLETE HOUSE", labelId: "RUMAH LENGKAP" },
          { id: "living", label: "LIVING ROOM", labelId: "RUANG TAMU" },
          { id: "kitchen", label: "KITCHEN", labelId: "DAPUR" },
          { id: "bathroom", label: "BATHROOM", labelId: "KAMAR MANDI" },
          { id: "bedroom", label: "BEDROOM", labelId: "KAMAR TIDUR" },
          { id: "aircon", label: "AIRCON", labelId: "AC" },
          { id: "electricity", label: "ELECTRICITY", labelId: "LISTRIK" },
          { id: "plumbing", label: "PLUMBING", labelId: "PIPA / SANITASI" },
          { id: "roofing", label: "ROOFING", labelId: "ATAP" },
          { id: "waterproofing", label: "WATERPROOFING", labelId: "ANTI BOCOR" },
          { id: "pool", label: "POOL", labelId: "KOLAM RENANG" },
          { id: "mold", label: "MOLD TREATMENT", labelId: "PENANGANAN JAMUR" },
          { id: "tiling", label: "TILING", labelId: "PEMASANGAN KERAMIK" },
          { id: "painting", label: "PAINTING", labelId: "PENGECATAN" },
          { id: "fencing", label: "FENCING", labelId: "PAGAR" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        titleId: "LOKASI",
        options: [
          { id: "bali", label: "BALI", labelId: "BALI" },
          { id: "badung", label: "BADUNG", labelId: "BADUNG" },
          { id: "denpasar", label: "DENPASAR", labelId: "DENPASAR" },
          { id: "tabanan", label: "TABANAN", labelId: "TABANAN" },
          { id: "gianyar", label: "GIANYAR", labelId: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG", labelId: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM", labelId: "KARANGASEM" },
          { id: "bangli", label: "BANGLI", labelId: "BANGLI" },
          { id: "buleleng", label: "BULELENG", labelId: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA", labelId: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "architecture",
    label: "03. Architecture",
    labelId: "03. Arsitektur",
    subtitle: "Find architecture studios for concept design, planning, and project development.",
    subtitleId: "Temukan studio arsitektur untuk desain konsep, perencanaan, dan pengembangan proyek.",
    visible: false,
    sortOrder: 2,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        titleId: "UKURAN PROYEK",
        options: [
          { id: "any", label: "ANY SIZE", labelId: "SEMUA UKURAN" },
          { id: "solo", label: "SOLO / COUPLE (1-2)", labelId: "SOLO / PASANGAN (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)", labelId: "KELUARGA / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)", labelId: "BERSAMA / KOMUNITAS (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        titleId: "KATEGORI",
        options: [
          { id: "all", label: "ALL TYPES", labelId: "SEMUA JENIS" },
          { id: "residential", label: "RESIDENTIAL", labelId: "RESIDENSIAL" },
          { id: "commercial", label: "COMMERCIAL", labelId: "KOMERSIAL" },
          { id: "renovations-extensions", label: "RENOVATIONS & EXTENSIONS", labelId: "RENOVASI & PERLUASAN" },
          { id: "sustainable-eco", label: "SUSTAINABLE / ECO-ARCHI.", labelId: "BERKELANJUTAN / ECO-ARCHI." },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        titleId: "LOKASI",
        options: [
          { id: "bali", label: "BALI", labelId: "BALI" },
          { id: "badung", label: "BADUNG", labelId: "BADUNG" },
          { id: "denpasar", label: "DENPASAR", labelId: "DENPASAR" },
          { id: "tabanan", label: "TABANAN", labelId: "TABANAN" },
          { id: "gianyar", label: "GIANYAR", labelId: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG", labelId: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM", labelId: "KARANGASEM" },
          { id: "bangli", label: "BANGLI", labelId: "BANGLI" },
          { id: "buleleng", label: "BULELENG", labelId: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA", labelId: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "interior",
    label: "04. Interior",
    labelId: "04. Interior",
    subtitle: "Find interior professionals for space planning, styling, furnitures and full interior projects.",
    subtitleId: "Temukan profesional interior untuk perencanaan ruang, styling, furnitur, dan proyek interior lengkap.",
    visible: false,
    sortOrder: 3,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        titleId: "UKURAN PROYEK",
        options: [
          { id: "any", label: "ANY SIZE", labelId: "SEMUA UKURAN" },
          { id: "solo", label: "SOLO / COUPLE (1-2)", labelId: "SOLO / PASANGAN (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)", labelId: "KELUARGA / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)", labelId: "BERSAMA / KOMUNITAS (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        titleId: "KATEGORI",
        options: [
          { id: "all", label: "ALL TYPES", labelId: "SEMUA JENIS" },
          { id: "residential", label: "RESIDENTIAL", labelId: "RESIDENSIAL" },
          { id: "commercial", label: "COMMERCIAL", labelId: "KOMERSIAL" },
          { id: "hospitality", label: "HOSPITALITY", labelId: "PERHOTELAN" },
          { id: "furnitures", label: "FURNITURES", labelId: "FURNITUR" },
          { id: "lighting", label: "LIGHTING", labelId: "PENCAHAYAAN" },
          { id: "styling-decoration", label: "STYLING & DECORATION", labelId: "STYLING & DEKORASI" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        titleId: "LOKASI",
        options: [
          { id: "bali", label: "BALI", labelId: "BALI" },
          { id: "badung", label: "BADUNG", labelId: "BADUNG" },
          { id: "denpasar", label: "DENPASAR", labelId: "DENPASAR" },
          { id: "tabanan", label: "TABANAN", labelId: "TABANAN" },
          { id: "gianyar", label: "GIANYAR", labelId: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG", labelId: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM", labelId: "KARANGASEM" },
          { id: "bangli", label: "BANGLI", labelId: "BANGLI" },
          { id: "buleleng", label: "BULELENG", labelId: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA", labelId: "JEMBRANA" },
        ],
      },
    ],
  },
  {
    categoryId: "real-estate",
    label: "05. Real Estate",
    labelId: "05. Properti",
    subtitle: "Find real estate professionals for property acquisition, sales, and investment opportunities.",
    subtitleId: "Temukan profesional properti untuk akuisisi properti, penjualan, dan peluang investasi.",
    visible: false,
    sortOrder: 4,
    filters: [
      {
        id: "project-size",
        title: "PROJECT SIZE",
        titleId: "UKURAN PROYEK",
        options: [
          { id: "any", label: "ANY SIZE", labelId: "SEMUA UKURAN" },
          { id: "solo", label: "SOLO / COUPLE (1-2)", labelId: "SOLO / PASANGAN (1-2)" },
          { id: "family", label: "FAMILY / CO-HOSTING (3-6)", labelId: "KELUARGA / CO-HOSTING (3-6)" },
          { id: "shared", label: "SHARED / COMMUNITY (7+)", labelId: "BERSAMA / KOMUNITAS (7+)" },
        ],
      },
      {
        id: "categories",
        title: "CATEGORIES",
        titleId: "KATEGORI",
        options: [
          { id: "all", label: "ALL TYPES", labelId: "SEMUA JENIS" },
          { id: "residential", label: "RESIDENTIAL", labelId: "RESIDENSIAL" },
          { id: "commercial", label: "COMMERCIAL", labelId: "KOMERSIAL" },
          { id: "land-development", label: "LAND & DEVELOPMENT PLOTS", labelId: "TANAH & KAVLING" },
          { id: "property-management", label: "PROPERTY MANAGEMENT", labelId: "MANAJEMEN PROPERTI" },
          { id: "legal-notary", label: "LEGAL & NOTARY SERVICES", labelId: "LAYANAN HUKUM & NOTARIS" },
        ],
      },
      {
        id: "location",
        title: "LOCATION",
        titleId: "LOKASI",
        options: [
          { id: "bali", label: "BALI", labelId: "BALI" },
          { id: "badung", label: "BADUNG", labelId: "BADUNG" },
          { id: "denpasar", label: "DENPASAR", labelId: "DENPASAR" },
          { id: "tabanan", label: "TABANAN", labelId: "TABANAN" },
          { id: "gianyar", label: "GIANYAR", labelId: "GIANYAR" },
          { id: "klungkung", label: "KLUNGKUNG", labelId: "KLUNGKUNG" },
          { id: "karangasem", label: "KARANGASEM", labelId: "KARANGASEM" },
          { id: "bangli", label: "BANGLI", labelId: "BANGLI" },
          { id: "buleleng", label: "BULELENG", labelId: "BULELENG" },
          { id: "jembrana", label: "JEMBRANA", labelId: "JEMBRANA" },
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
