import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[60px] border-b border-[#e8e8e8]" />

      <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-6">
        {/* Company header */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-[72px] h-[72px] rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-[24px] w-[200px]" />
            <Skeleton className="h-[14px] w-[140px]" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-[20px] w-[40px]" />
              <Skeleton className="h-[12px] w-[60px]" />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-[14px] w-full" />
          <Skeleton className="h-[14px] w-[90%]" />
          <Skeleton className="h-[14px] w-[70%]" />
        </div>

        {/* Project images */}
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-[200px] h-[140px] rounded-[6px]" />
          ))}
        </div>
      </div>
    </div>
  )
}
