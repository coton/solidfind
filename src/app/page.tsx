"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WelcomeCard, FeaturedCard, StatsCard, ListingCard } from "@/components/cards";
import { Pagination } from "@/components/Pagination";
import { SortDropdown } from "@/components/SortDropdown";
import { AdBanner } from "@/components/AdBanner";

// Mock data for listings
const mockListings = [
  {
    id: "1",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isPro: true,
    isFeatured: true,
    isSaved: true,
  },
  {
    id: "2",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isPro: true,
  },
  {
    id: "3",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
  },
  {
    id: "4",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
  },
  {
    id: "5",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
    isPro: true,
  },
  {
    id: "6",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
  },
  {
    id: "7",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
  },
  {
    id: "8",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
  },
  {
    id: "9",
    name: "ATELIER GENERATIONS ASUDEVA DESIGN EXTRA TEXT TEST",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore consectetur do nsectetur[...]",
    rating: 4.5,
  },
];

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-bold text-[#333]">1953 Solid Finds</h2>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {/* Results Grid - 4 columns, 210px each, 20px gap */}
        <div className="grid grid-cols-4 gap-5 mb-8" style={{ gridTemplateColumns: 'repeat(4, 210px)' }}>
          {/* First Row: Welcome + Featured + Stats + First Listing */}
          <WelcomeCard />
          <FeaturedCard
            image="/images/featured-bg.png"
            title="FEATURED ARTICLE TITLE"
            address="Jl. Imam Bonjol No.198/249, Pemecutan Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80119"
          />
          <StatsCard />

          {/* Listing Cards */}
          {mockListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-start mb-8">
          <Pagination
            currentPage={currentPage}
            totalPages={12}
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
