"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WelcomeCard, FeaturedCard, ListingCard } from "@/components/cards";
import { Pagination } from "@/components/Pagination";
import { SortDropdown } from "@/components/SortDropdown";
import { AdBanner } from "@/components/AdBanner";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");

  const companies = useQuery(api.companies.list, {});

  // Map Convex companies to the format ListingCard expects
  const listings = (companies ?? []).map((c) => ({
    id: c._id,
    name: c.name,
    description: c.description ?? "",
    rating: c.rating ?? 4.5,
    reviewCount: c.reviewCount ?? 0,
    projects: c.projects ?? 0,
    team: c.teamSize ?? 0,
    address: c.address ?? "",
    isPro: c.isPro,
    isFeatured: false,
    isSaved: false,
  }));

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#333]">{listings.length} Solid Finds</h2>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {/* Results Grid - 4 columns, 210px each, 20px gap */}
        <div className="grid grid-cols-4 gap-5 mb-8" style={{ gridTemplateColumns: 'repeat(4, 210px)' }}>
          {/* First Row: Welcome + Featured + Listing Cards */}
          <WelcomeCard />
          <FeaturedCard
            image="/images/featured-bg.png"
            title="FEATURED ARTICLE TITLE"
            address="Jl. Imam Bonjol No.198/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119"
          />

          {/* Listing Cards */}
          {listings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-start mb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(listings.length / 9))}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Ad Banner */}
        <div className="mb-8">
          <AdBanner imageSrc="/images/ad-kini-resort.png" alt="Kini Resort" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
