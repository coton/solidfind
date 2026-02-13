"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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

    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first few pages
      for (let i = 1; i <= Math.min(8, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > 8) {
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          PREVIOUS
        </button>
      )}

      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`min-w-[24px] h-6 flex items-center justify-center rounded transition-colors ${
              page === currentPage
                ? "text-orange-500 font-bold"
                : page === "..."
                ? "text-muted-foreground cursor-default"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {page}.
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
