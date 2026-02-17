import { ListingCardSkeleton } from "@/components/ui/ListingCardSkeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header placeholder */}
      <div className="h-[60px] border-b border-[#e8e8e8]" />

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Search bar placeholder */}
        <div className="animate-pulse h-[48px] w-full rounded-[6px] bg-[#e8e8e8] mb-8" />

        {/* Cards grid */}
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
