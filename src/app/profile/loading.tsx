import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#e4e4e4] flex flex-col">
      {/* Header placeholder */}
      <div className="h-[60px] bg-gradient-to-r from-[#E9A28E] to-[#F14110]" />

      <main className="max-w-[900px] mx-auto px-4 sm:px-0 sm:pb-8 flex-grow w-full">
        {/* Back row */}
        <div className="h-[36px] mb-6 border-b border-[#333]/10" />
        
        {/* Company name */}
        <Skeleton className="h-[28px] w-[200px] mb-6" />
        
        {/* Main grid: logo | contact | stats+desc | save/share */}
        <div className="grid grid-cols-[160px_1fr] lg:grid-cols-[210px_210px_1fr_70px] gap-4 lg:gap-5 mb-0 lg:mb-8">
          {/* Column 1: Logo */}
          <Skeleton className="w-full aspect-square rounded-[6px]" />
          
          {/* Column 2: Contact info */}
          <div className="space-y-3 lg:self-start lg:h-[210px]">
            <Skeleton className="h-[14px] w-[120px]" />
            <Skeleton className="h-[14px] w-[80px]" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="w-[20px] h-[20px]" />
              <Skeleton className="w-[20px] h-[20px]" />
              <Skeleton className="w-[20px] h-[20px]" />
            </div>
            <div className="mt-auto pt-4">
              <div className="flex items-start gap-2">
                <Skeleton className="w-[14px] h-[14px] flex-shrink-0" />
                <Skeleton className="h-[12px] w-full" />
              </div>
            </div>
          </div>
          
          {/* Column 3+4: Stats + description */}
          <div className="col-span-2 lg:col-span-2 space-y-3">
            {/* Stats rows */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-[14px] w-[80px]" />
              <Skeleton className="h-[20px] w-[40px]" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-[14px] w-[60px]" />
              <Skeleton className="h-[20px] w-[40px]" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-[14px] w-[60px]" />
              <Skeleton className="h-[20px] w-[60px]" />
            </div>
            
            {/* Description */}
            <div className="space-y-2 mt-4">
              <Skeleton className="h-[12px] w-full" />
              <Skeleton className="h-[12px] w-[95%]" />
              <Skeleton className="h-[12px] w-[80%]" />
            </div>
          </div>
        </div>
        
        {/* Project images grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-square rounded-[6px]" />
          ))}
        </div>
      </main>
      
      {/* Footer placeholder */}
      <div className="h-[150px] sm:h-[190px] bg-gradient-to-r from-[#E9A28E] to-[#F14110] rounded-t-[6px]" />
    </div>
  )
}
