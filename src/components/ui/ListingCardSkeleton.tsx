import { Skeleton } from "./skeleton"

export function ListingCardSkeleton() {
  return (
    <div className="relative w-[210px] h-[230px] rounded-[6px] overflow-hidden bg-[#f8f8f8]">
      {/* Avatar */}
      <div className="absolute top-[14px] left-[14px]">
        <Skeleton className="w-[38px] h-[38px] rounded-full" />
      </div>
      {/* Title & desc */}
      <div className="absolute top-[14px] left-[62px] right-[14px] space-y-2">
        <Skeleton className="h-[14px] w-[100px]" />
        <Skeleton className="h-[10px] w-[120px]" />
        <Skeleton className="h-[10px] w-[80px]" />
      </div>
      {/* Stats row */}
      <div className="absolute bottom-[40px] left-[14px] right-[14px] flex gap-3">
        <Skeleton className="h-[10px] w-[50px]" />
        <Skeleton className="h-[10px] w-[50px]" />
      </div>
      {/* Pro images row */}
      <div className="absolute bottom-[14px] left-[14px] right-[14px] flex gap-2">
        <Skeleton className="h-[18px] w-[55px] rounded-sm" />
        <Skeleton className="h-[18px] w-[55px] rounded-sm" />
        <Skeleton className="h-[18px] w-[55px] rounded-sm" />
      </div>
    </div>
  )
}
