import { mutation } from "./_generated/server";

const companies = [
  {
    name: "Lumbung Architect",
    description: "Balinese architecture firm specializing in residential and hospitality projects. Founded by I Gusti Ngurah Andri Saputra with over 15 years of experience.",
    category: "construction",
    subcategory: "residential",
    location: "Denpasar",
    address: "Jl. Imam Bonjol No.198/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119",
    isPro: true,
    rating: 4.5,
    reviewCount: 23,
    projects: 75,
    teamSize: 25,
    bookmarkCount: 25,
    viewsLastMonth: 725,
  },
  {
    name: "Bali Green Build",
    description: "Sustainable construction company focused on eco-friendly building materials and green architecture throughout Bali.",
    category: "construction",
    subcategory: "residential",
    location: "Seminyak",
    address: "Jl. Raya Seminyak No.88, Seminyak, Kec. Kuta, Kota Denpasar, Bali 80361",
    isPro: true,
    rating: 4.5,
    reviewCount: 18,
    projects: 52,
    teamSize: 12,
    bookmarkCount: 18,
    viewsLastMonth: 540,
  },
  {
    name: "Tropical Designs Studio",
    description: "Interior design studio bringing modern tropical aesthetics to villas, hotels, and commercial spaces across Bali.",
    category: "interior",
    subcategory: "hospitality",
    location: "Canggu",
    address: "Jl. Raya Canggu, Canggu, Kec. Kuta Utara, Kabupaten Badung, Bali 80351",
    isPro: false,
    rating: 4.5,
    reviewCount: 31,
    projects: 89,
    teamSize: 30,
    bookmarkCount: 42,
    viewsLastMonth: 890,
  },
  {
    name: "Ubud Renovations",
    description: "Full-service renovation company specializing in traditional Balinese homes and villa upgrades in the Ubud area.",
    category: "renovation",
    subcategory: "complete",
    location: "Ubud",
    address: "Jl. Monkey Forest, Ubud, Kec. Gianyar, Kabupaten Gianyar, Bali 80571",
    isPro: false,
    rating: 4.5,
    reviewCount: 15,
    projects: 40,
    teamSize: 8,
    bookmarkCount: 12,
    viewsLastMonth: 320,
  },
  {
    name: "Sanur Development Corp",
    description: "Large-scale construction and real estate development firm handling commercial and hospitality projects across southern Bali.",
    category: "construction",
    subcategory: "commercial",
    location: "Sanur",
    address: "Jl. Bypass Ngurah Rai No.21, Sanur, Kec. Denpasar Sel., Kota Denpasar, Bali 80228",
    isPro: true,
    rating: 4.5,
    reviewCount: 42,
    projects: 110,
    teamSize: 45,
    bookmarkCount: 55,
    viewsLastMonth: 1200,
  },
  {
    name: "Kuta Pool & Garden",
    description: "Specialized in pool construction, garden landscaping, and outdoor living spaces for villas and resorts.",
    category: "renovation",
    subcategory: "pool",
    location: "Kuta",
    address: "Jl. Pantai Kuta, Kuta, Kec. Kuta, Kabupaten Badung, Bali 80361",
    isPro: false,
    rating: 4.5,
    reviewCount: 27,
    projects: 65,
    teamSize: 18,
    bookmarkCount: 30,
    viewsLastMonth: 670,
  },
  {
    name: "Uluwatu Cliff Builders",
    description: "Expert builders specializing in cliff-side construction, structural engineering, and luxury villa development in the Bukit Peninsula.",
    category: "construction",
    subcategory: "residential",
    location: "Uluwatu",
    address: "Jl. Raya Uluwatu, Pecatu, Kec. Kuta Sel., Kabupaten Badung, Bali 80364",
    isPro: false,
    rating: 4.5,
    reviewCount: 12,
    projects: 38,
    teamSize: 10,
    bookmarkCount: 9,
    viewsLastMonth: 280,
  },
  {
    name: "Tegallalang Heritage Restorations",
    description: "Artisan restoration company preserving traditional Balinese architecture while integrating modern comforts and standards.",
    category: "renovation",
    subcategory: "complete",
    location: "Tegallalang",
    address: "Jl. Tegallalang, Tegallalang, Kec. Tegallalang, Kabupaten Gianyar, Bali 80561",
    isPro: false,
    rating: 4.5,
    reviewCount: 35,
    projects: 95,
    teamSize: 28,
    bookmarkCount: 38,
    viewsLastMonth: 750,
  },
  {
    name: "Bali Arch Studio",
    description: "Award-winning architecture practice creating contemporary tropical designs that honor Balinese building traditions.",
    category: "architecture",
    subcategory: "residential",
    location: "Denpasar",
    address: "Jl. Gatot Subroto No.45, Denpasar, Bali 80234",
    isPro: true,
    rating: 4.8,
    reviewCount: 56,
    projects: 120,
    teamSize: 35,
    bookmarkCount: 67,
    viewsLastMonth: 1500,
  },
  {
    name: "Island Property Group",
    description: "Full-service real estate agency specializing in land acquisition, property management, and investment consulting in Bali.",
    category: "real-estate",
    subcategory: "commercial",
    location: "Seminyak",
    address: "Jl. Kayu Aya No.12, Seminyak, Kec. Kuta, Kabupaten Badung, Bali 80361",
    isPro: true,
    rating: 4.3,
    reviewCount: 28,
    projects: 200,
    teamSize: 20,
    bookmarkCount: 45,
    viewsLastMonth: 980,
  },
];

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingCompanies = await ctx.db.query("companies").first();
    if (existingCompanies) {
      return "Already seeded";
    }

    // Create a system user for seeded data
    const userId = await ctx.db.insert("users", {
      clerkId: "seed_system_user",
      email: "system@solidfind.id",
      name: "System",
      accountType: "company",
      createdAt: Date.now(),
    });

    // Create companies
    for (const company of companies) {
      const companyId = await ctx.db.insert("companies", {
        ownerId: userId,
        name: company.name,
        description: company.description,
        category: company.category,
        subcategory: company.subcategory,
        location: company.location,
        address: company.address,
        isPro: company.isPro,
        rating: company.rating,
        reviewCount: company.reviewCount,
        projects: company.projects,
        teamSize: company.teamSize,
        bookmarkCount: company.bookmarkCount,
        viewsLastMonth: company.viewsLastMonth,
        createdAt: Date.now(),
      });

      // Create sample reviews for each company
      for (let i = 0; i < 3; i++) {
        await ctx.db.insert("reviews", {
          companyId,
          userId,
          userName: ["Wayan Surya", "Made Dewi", "Ketut Agung"][i],
          rating: [5, 4, 5][i],
          content: [
            "Excellent work quality and very professional team. Completed our villa renovation on time and within budget.",
            "Good communication throughout the project. Would recommend for residential construction in Bali.",
            "Outstanding attention to detail and deep understanding of Balinese architectural traditions.",
          ][i],
          createdAt: Date.now() - (i + 1) * 86400000,
        });
      }
    }

    return "Seeded successfully";
  },
});
