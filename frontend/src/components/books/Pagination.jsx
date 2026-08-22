import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (page > 1) {
      onPageChange(page - 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-6">
      {/* Prev Button */}
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="p-2 rounded-xl bg-bg-surface border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-muted transition-colors"
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => {
              onPageChange(p);
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
              p === page
                ? 'bg-accent text-white shadow-soft'
                : 'bg-bg-surface border border-border text-text-secondary hover:bg-bg-muted hover:text-text-primary'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="p-2 rounded-xl bg-bg-surface border border-border text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-muted transition-colors"
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
