import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Temporary: link a Clerk user to the Balitecture company for demo purposes
export const linkBalitectureDemo = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Create or find the Convex user
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: "Balitecture Demo",
        accountType: "company",
        companyName: "Balitecture",
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    if (!user) throw new Error("Failed to create user");

    // Find the Balitecture company
    const companies = await ctx.db.query("companies").collect();
    const balitecture = companies.find((c) => c.name === "Balitecture");

    if (!balitecture) throw new Error("Balitecture company not found");

    // Transfer ownership
    await ctx.db.patch(balitecture._id, { ownerId: user._id });

    return {
      userId: user._id,
      companyId: balitecture._id,
      message: "Balitecture company linked to demo user",
    };
  },
});
