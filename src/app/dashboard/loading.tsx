import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[60px] border-b border-[#e8e8e8]" />
      <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-6">
        <Skeleton className="h-[28px] w-[180px]" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-[8px]" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[56px] rounded-[6px]" />
          ))}
        </div>
      </div>
    </div>
  )
}
