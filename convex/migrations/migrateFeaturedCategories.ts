import { internalMutation } from "../_generated/server";

export const migrateCategoryToCategories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("featuredArticles").collect();
    let migrated = 0;
    for (const article of articles) {
      const doc = article as Record<string, unknown>;
      // If old `category` field exists but no `categories` array
      if (doc.category !== undefined && !doc.categories) {
        const oldCategory = doc.category as string;
        const { _id, _creationTime, ...rest } = doc as Record<string, unknown>;
        delete rest.category;
        (rest as Record<string, unknown>).categories = oldCategory ? [oldCategory] : [];
        await ctx.db.replace(article._id, rest as never);
        migrated++;
      } else if (!doc.categories) {
        // No category at all, set empty array
        await ctx.db.patch(article._id, { categories: [] } as never);
        migrated++;
      }
    }
    return { migrated, total: articles.length };
  },
});
