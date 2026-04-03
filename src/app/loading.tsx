import { ListingCardSkeleton } from "@/components/ui/ListingCardSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
      {/* Header placeholder */}
      <div className="h-[60px] bg-gradient-to-r from-[#E9A28E] to-[#F14110]" />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 py-6 flex-grow w-full">
        {/* Filter bar placeholder */}
        <Skeleton className="h-[40px] w-full rounded-[6px] mb-6" />

        {/* Cards grid — matches page.tsx: grid-cols-2 lg:grid-cols-4 gap-5 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </main>

      {/* Footer placeholder */}
      <div className="h-[150px] sm:h-[190px] bg-gradient-to-r from-[#E9A28E] to-[#F14110] rounded-t-[6px]" />
    </div>
  )
}
