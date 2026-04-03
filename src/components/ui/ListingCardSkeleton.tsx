import { Skeleton } from "./skeleton"

export function ListingCardSkeleton() {
  return (
    <div className="relative w-full h-[220px] rounded-[6px] overflow-hidden bg-[#f8f8f8]">
      {/* Logo */}
      <div className="absolute top-[10px] left-[10px]">
        <Skeleton className="w-[70px] h-[70px] rounded-[6px]" />
      </div>
      {/* Name & category */}
      <div className="absolute top-[10px] left-[90px] right-[10px] space-y-2">
        <Skeleton className="h-[13px] w-[80%]" />
        <Skeleton className="h-[9px] w-[50%]" />
      </div>
      {/* Description area */}
      <div className="absolute top-[90px] left-[10px] right-[10px] space-y-[6px]">
        <Skeleton className="h-[9px] w-full" />
        <Skeleton className="h-[9px] w-[90%]" />
        <Skeleton className="h-[9px] w-[70%]" />
      </div>
      {/* Bottom stats row */}
      <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-[9px] w-[40px]" />
          <Skeleton className="h-[9px] w-[40px]" />
        </div>
        <Skeleton className="h-[9px] w-[30px]" />
      </div>
    </div>
  )
}
