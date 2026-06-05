"use client";

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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 6) {
      for (let i = 1; i <= 8; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 5) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 7; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      <div className="m-pager">
        <button
          type="button"
          className="m-page arrow"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>
        {getMobilePages(currentPage, totalPages).map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className="m-page dots">…</span>
          ) : (
            <button
              key={page}
              type="button"
              className={`m-page ${page === currentPage ? "on" : ""}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          )
        )}
        <button
          type="button"
          className="m-page arrow"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      <div className="sf-desktop-pager flex items-center gap-[8px] text-[11px] font-medium tracking-[0.22px] leading-[14px]">
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`transition-colors ${
              page === currentPage
                ? "text-[#f14110]"
                : page === "..."
                ? "text-[#333]/30 cursor-default"
                : "text-[#333]/50 hover:text-[#333]"
            }`}
          >
            {typeof page === "number" ? `${page}.` : page}
          </button>
        ))}

        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-[4px] text-[#333]/50 hover:text-[#333] transition-colors ml-[8px]"
          >
            NEXT
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </>
  );
}

function getMobilePages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
  if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", currentPage, "...", totalPages];
}
