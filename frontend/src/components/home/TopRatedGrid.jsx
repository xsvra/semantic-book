import React, { useEffect, useState } from 'react';
import { fetchTopRatedBooks } from '../../lib/apiClient';
import BookCard from '../book/BookCard';
import { Flame, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

export default function TopRatedGrid({ onSelectBook }) {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchTopRatedBooks(100)
      .then((data) => {
        if (isMounted) {
          setBooks(data || []);
        }
      })
      .catch((err) => console.error("Failed to load top rated books:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const safeBooks = Array.isArray(books) ? books : [];
  const totalPages = Math.max(1, Math.ceil(safeBooks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = safeBooks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-bg-base border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 border-b border-border/80 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-gold font-semibold text-xs tracking-wider uppercase mb-1">
              <Flame className="w-4 h-4 fill-gold text-gold" />
              <span>Katalog Terpopuler (Top 100)</span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-3xl text-text-primary">
              Buku Terpopuler & Total Penilai Tertinggi
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5 sm:mt-1">
              Top 100 koleksi buku non-fiksi terlaris berdasarkan akumulasi ulasan terbanyak (20 buku per halaman).
            </p>
          </div>

          {/* Quick Pagination Info Pill */}
          {!isLoading && books.length > 0 && (
            <div className="flex items-center gap-2 bg-white px-3 sm:px-3.5 py-1.5 rounded-full border border-border text-[11px] sm:text-xs text-text-secondary shadow-sm shrink-0 self-start sm:self-auto">
              <TrendingUp className="w-3.5 h-3.5 text-gold" />
              <span>Menampilkan #{startIndex + 1} - #{Math.min(startIndex + itemsPerPage, books.length)} dari {books.length} Buku</span>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl h-80 animate-pulse border border-border p-4 flex flex-col justify-between">
                <div className="w-full h-44 bg-slate-200 rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Book Cards Grid (20 Books Per Page, Responsive Grid 2-5 Cols) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {currentBooks.map((book) => (
                <BookCard
                  key={book.book_id}
                  book={book}
                  onClick={onSelectBook}
                />
              ))}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-10 flex items-center justify-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 sm:p-2.5 rounded-xl border border-border bg-white text-text-secondary hover:text-text-primary hover:bg-bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 text-xs font-semibold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1 px-1 sm:px-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-slate-900 text-amber-400 shadow-md scale-105 border border-slate-700'
                            : 'bg-white text-text-secondary hover:bg-bg-muted border border-border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 sm:p-2.5 rounded-xl border border-border bg-white text-text-secondary hover:text-text-primary hover:bg-bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 text-xs font-semibold"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
