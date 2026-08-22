import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import TopRatedGrid from '../components/home/TopRatedGrid';
import BookCard from '../components/book/BookCard';
import BookCardSkeleton from '../components/book/BookCardSkeleton';
import BookDetailModal from '../components/book/BookDetailModal';
import Pagination from '../components/books/Pagination';
import { searchSemanticBooks } from '../lib/apiClient';
import { validateSearchInput } from '../lib/validateSearchInput';
import { BookOpen, Clock, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';


export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeSearch, setActiveSearch] = useState(initialQuery);
  const [useReranker, setUseReranker] = useState(false);

  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [inferenceTime, setInferenceTime] = useState(null);
  const [usedReranker, setUsedReranker] = useState(false);
  const [didYouMean, setDidYouMean] = useState(null);
  const [isExactMatch, setIsExactMatch] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const resultsRef = useRef(null);

  // Synchronize query from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setActiveSearch(q);
      setPage(1);
    }
  }, [searchParams]);

  // Load Search Results ONLY when activeSearch is present

  useEffect(() => {
    let isMounted = true;

    if (!activeSearch || !activeSearch.trim()) {
      setBooks([]);
      setIsLoading(false);
      return;
    }

    const validation = validateSearchInput(activeSearch);
    if (!validation.isValid) {
      setError(validation.message);
      setBooks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    searchSemanticBooks({
      query: validation.sanitized,
      use_reranker: useReranker,
      page,
      limit: 10
    })
      .then((res) => {
        if (isMounted) {
          setBooks(res.results || []);
          setTotalBooks(res.total || 0);
          setTotalPages(res.total_pages || 1);
          setInferenceTime(res.inference_time_seconds);
          setUsedReranker(res.used_reranker);
          setDidYouMean(res.did_you_mean || null);
          setIsExactMatch(res.is_exact_match || false);

          // Smooth scroll to results section
          setTimeout(() => {
            if (resultsRef.current) {
              resultsRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Search error:", err);
          const serverError = err.response?.data?.detail || "Gagal melakukan pencarian rekomendasi. Pastikan server backend FastAPI sedang berjalan.";
          setError(serverError);
          setBooks([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSearch, useReranker, page]);


  const handleSearchExecute = (q, rerank) => {
    setActiveSearch(q);
    setPage(1);
    setSearchParams(q ? { q } : {});
  };

  const handleDidYouMeanClick = (suggestedTitle) => {
    setQuery(suggestedTitle);
    setActiveSearch(suggestedTitle);
    setSearchParams({ q: suggestedTitle });
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Hero Section */}
      <HeroSection
        query={query}
        setQuery={setQuery}
        onSearch={handleSearchExecute}
        useReranker={useReranker}
        setUseReranker={setUseReranker}
        isSearching={isLoading && !!activeSearch}
      />

      {/* Main Results / Recommendations Grid Section (Conditional: Only visible after search execution) */}
      {activeSearch && activeSearch.trim() !== '' && (
        <main ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
          {/* Typo Correction Suggestion ("Mungkin maksud Anda") */}
          {didYouMean && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-between gap-4 text-sm text-text-primary shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Mungkin maksud Anda: <strong className="text-amber-700 cursor-pointer hover:underline" onClick={() => handleDidYouMeanClick(didYouMean)}>{didYouMean}</strong>?
                </span>
              </div>
              <button
                onClick={() => handleDidYouMeanClick(didYouMean)}
                className="px-4 py-1.5 rounded-full bg-slate-900 text-amber-400 text-xs font-bold hover:bg-black transition-colors shrink-0 shadow-sm border border-amber-400/30"
              >
                Cari Judul Ini
              </button>
            </div>
          )}

          {/* Exact Match Notification */}
          {isExactMatch && (
            <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-sm font-medium shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Judul sama persis ditemukan! Menampilkan <strong>buku persis di Peringkat #1</strong>, diikuti rekomendasi buku serupa.</span>
            </div>
          )}

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="text-gold font-semibold text-xs tracking-wider uppercase mb-1">
                <span>Hasil Match & Rekomendasi Semantic</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary">
                Rekomendasi untuk: <span className="italic text-gold">"{activeSearch}"</span>
              </h2>
            </div>

            {/* Search Metric Badge */}
            {inferenceTime !== null && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-border text-xs text-text-secondary shadow-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>Inferensi: <strong>{inferenceTime}s</strong></span>
                </div>
                {usedReranker && (
                  <span className="bg-gold-soft text-gold font-bold px-2 py-0.5 rounded-full text-[10px] border border-gold/30">
                    Reranked
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 mb-8">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Book Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, idx) => (
                <BookCardSkeleton key={idx} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-border p-8 shadow-soft">
              <BookOpen className="w-12 h-12 text-gold/40 mx-auto mb-4" />
              <h3 className="font-serif font-bold text-xl text-text-primary mb-2">
                Tidak Ada Buku Ditemukan
              </h3>
              <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
                Coba gunakan kalimat yang lebih panjang atau deskriptif dalam Bahasa Indonesia/Inggris.
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setActiveSearch('');
                  setSearchParams({});
                }}
                className="px-6 py-2.5 rounded-full bg-slate-900 text-amber-400 text-xs font-bold hover:bg-black transition-colors shadow-soft border border-amber-400/30"
              >
                Reset Pencarian
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
        </main>
      )}

      {/* Top Rated Grid Section (20 Books Paginated) */}
      <TopRatedGrid onSelectBook={(b) => setSelectedBook(b)} />

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
