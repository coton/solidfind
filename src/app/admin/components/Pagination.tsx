"use client";

const PAGE_SIZE = 20;

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalItems, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  if (totalPages <= 1) return null;

  const start = currentPage * PAGE_SIZE + 1;
  const end = Math.min((currentPage + 1) * PAGE_SIZE, totalItems);

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <span className="text-[11px] text-[#333]/50">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="text-[11px] font-medium px-3 py-1.5 rounded-[6px] border border-[#e4e4e4] hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="text-[11px] font-medium px-3 py-1.5 rounded-[6px] border border-[#e4e4e4] hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export { PAGE_SIZE };
