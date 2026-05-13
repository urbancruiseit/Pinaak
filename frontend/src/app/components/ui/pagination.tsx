import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  rowsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2">
      <p className="text-sm font-semibold text-gray-600">
        Page {currentPage} of {totalPages || 1} • Total {totalItems} items •
        Showing {startItem} - {endItem} of {totalItems} items
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border-2 text-md border-red-700 bg-white text-red-600 hover:text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          ←
        </button>

        <button
          onClick={() => {
            const nextPage = currentPage >= totalPages ? 1 : currentPage + 1;
            onPageChange(nextPage);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {currentPage}
        </button>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full  border-2 text-md border-green-500 bg-white text-green-600 hover:text-white hover:bg-green-600  disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  );
}


