import React, { useState, useEffect } from 'react';
import FilterBar from '../components/books/FilterBar';
import BookCard from '../components/book/BookCard';
import BookCardSkeleton from '../components/book/BookCardSkeleton';
import BookDetailModal from '../components/book/BookDetailModal';
import Pagination from '../components/books/Pagination';
import { fetchBooks, searchSemanticBooks } from '../lib/apiClient';
import { validateSearchInput } from '../lib/validateSearchInput';
import { BookOpen, Layers, Search, X, AlertTriangle } from 'lucide-react';

export default function Books() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [validationError, setValidationError] = useState(null);

  const [selectedBook, setSelectedBook] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const result = validateSearchInput(searchQuery);
    if (!result.isValid) {
      setValidationError(result.message);
      return;
    }
    setValidationError(null);
    setActiveQuery(result.sanitized);
    setPage(1);
    setSearchQuery('');
  };

  const handleClearQuery = () => {
    setSearchQuery('');
    setActiveQuery('');
    setValidationError(null);
    setPage(1);
  };


  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    if (activeQuery) {
      searchSemanticBooks({
        query: activeQuery,
        category,
        page,
        limit: 20
      })
        .then((res) => {
          if (isMounted) {
            setBooks(res.results || []);
            setTotal(res.total || 0);
            setTotalPages(res.total_pages || 1);
          }
        })
        .catch((err) => {
          console.error("Failed to search catalog books:", err);
          if (isMounted) setBooks([]);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      fetchBooks({
        page,
        limit: 20,
        category,
        sort_by: sortBy,
        order
      })
        .then((res) => {
          if (isMounted) {
            setBooks(res.items || []);
            setTotal(res.total || 0);
            setTotalPages(res.total_pages || 1);
          }
        })
        .catch((err) => {
          console.error("Failed to load catalog books:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeQuery, category, sortBy, order, page]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveQuery('');
    setCategory(null);
    setSortBy(null);
    setOrder('desc');
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col py-10 bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-gold font-semibold text-xs uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-gold" />
              <span>Katalog Lengkap</span>
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-text-primary mb-2">
              Eksplorasi Katalog Buku Non-Fiksi
            </h1>
            <p className="text-text-secondary text-sm">
              Menampilkan total <strong>{total}</strong> judul buku non-fiksi terverifikasi.
              {activeQuery && <span> (Pencarian: <strong>"{activeQuery}"</strong>)</span>}
            </p>
          </div>

          {/* Clean Quick Catalog Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
            <div className="relative flex items-center bg-white rounded-full border border-border shadow-sm p-1.5 focus-within:border-gold">
              <Search className="w-4 h-4 text-gold ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kata kunci katalog..."
                className="w-full px-3 py-1.5 text-xs bg-transparent text-text-primary focus:outline-none placeholder:text-text-muted"
              />
              {activeQuery ? (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="p-1 rounded-full text-text-muted hover:text-text-primary mr-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-black text-amber-400 text-xs font-bold transition-colors shrink-0 border border-amber-400/30"
                >
                  Cari
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Validation Error Alert Banner */}
        {validationError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-3 text-sm shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-medium">{validationError}</span>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="p-1 rounded-full hover:bg-rose-100 text-rose-500 hover:text-rose-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter & Sort Bar */}

        <FilterBar
          selectedCategory={category}
          onSelectCategory={(cat) => {
            setCategory(cat);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortChange={(s) => {
            setSortBy(s);
            setPage(1);
          }}
          order={order}
          onOrderChange={(o) => {
            setOrder(o);
            setPage(1);
          }}
          onReset={handleResetFilters}
        />

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 20 }).map((_, idx) => (
              <BookCardSkeleton key={idx} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border p-8 shadow-soft">
            <BookOpen className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <h3 className="font-serif font-bold text-xl text-text-primary mb-2">
              Tidak Ada Buku Sesuai Filter
            </h3>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
              Cobalah memilih opsi filter atau kata kunci lain.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-slate-900 text-amber-400 text-xs font-bold hover:bg-black transition-colors shadow-soft border border-amber-400/30"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.book_id}
                  book={book}
                  onClick={(b) => setSelectedBook(b)}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}
