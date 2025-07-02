import React from 'react';

const Pagination = ({ currentPage, totalPages, goToPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center mt-6 gap-2">
      <button
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {/* Show first page if not on first */}
      {currentPage > 2 && (
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => goToPage(1)}
        >
          1
        </button>
      )}
      {/* Ellipsis if needed */}
      {currentPage > 3 && <span className="px-2">...</span>}
      {/* Show previous page if not on first */}
      {currentPage > 1 && (
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => goToPage(currentPage - 1)}
        >
          {currentPage - 1}
        </button>
      )}
      {/* Current page */}
      <button
        className="px-3 py-1 rounded bg-red-600 text-white"
        disabled
      >
        {currentPage}
      </button>
      {/* Show next page if not on last */}
      {currentPage < totalPages && (
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => goToPage(currentPage + 1)}
        >
          {currentPage + 1}
        </button>
      )}
      {/* Ellipsis if needed */}
      {currentPage < totalPages - 2 && <span className="px-2">...</span>}
      {/* Show last page if not near end */}
      {currentPage < totalPages - 1 && (
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </button>
      )}
      <button
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
