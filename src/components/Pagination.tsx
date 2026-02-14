"use client";

import { ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 9) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show pages 1-8 when near the start
    if (currentPage <= 6) {
      for (let i = 1; i <= 8; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 5) {
      // Near the end
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 7; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Middle
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`min-w-[24px] h-6 flex items-center justify-center rounded transition-colors ${
              page === currentPage
                ? "text-[#f14110] font-bold"
                : page === "..."
                ? "text-muted-foreground cursor-default"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {typeof page === "number" ? `${page}.` : page}
          </button>
        ))}
      </div>

      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ml-2"
        >
          NEXT
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
