import React, { useEffect, useState } from 'react';
import { X, Star, BookOpen, ExternalLink, Layers, MessageSquare, Users, Globe, Tag, Bookmark, Hash, BookType } from 'lucide-react';
import { fetchBookById } from '../../lib/apiClient';

export default function BookDetailModal({ book: initialBook, onClose }) {
  const [book, setBook] = useState(initialBook);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (initialBook && initialBook.book_id) {
      setIsLoadingDetail(true);
      fetchBookById(initialBook.book_id)
        .then((fullData) => {
          if (isMounted && fullData) {
            setBook((prev) => ({
              ...prev,
              ...fullData,
              similarity_score: prev?.similarity_score ?? fullData.similarity_score,
              rank: prev?.rank ?? fullData.rank
            }));
          }
        })
        .catch((err) => console.error("Failed to fetch full book detail:", err))
        .finally(() => {
          if (isMounted) setIsLoadingDetail(false);
        });
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [initialBook, onClose]);

  if (!book) return null;

  const langCode = (book.language_code || 'EN').toUpperCase();
  const descriptionText = book.full_description || book.short_description || "Tidak ada deskripsi tersedia.";

  const allGenresList = book.genre_full
    ? book.genre_full.split(',').map((g) => g.trim()).filter(Boolean)
    : (book.genre_tags || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Container */}
      <div className="relative bg-white border border-border rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header bar */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-serif font-bold text-sm">Detail Lengkap Buku Non-Fiksi</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-bg-base">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column: 3D Cover Image & Metadata Pills */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="w-44 sm:w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 p-4 relative shadow-md border border-slate-800 mb-4 flex items-center justify-center">
                {book.cover_url && (
                  <div
                    className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${book.cover_url})` }}
                  />
                )}
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-28 sm:w-36 aspect-[2/3] object-cover rounded-r-md rounded-l-sm shadow-2xl border-l-4 border-slate-400 border-y border-r border-white/80 z-10 relative"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 z-10">
                    <BookOpen className="w-12 h-12 mb-2 text-amber-400" />
                    <span className="text-xs font-serif text-white">{book.title}</span>
                  </div>
                )}
              </div>

              {/* Cosine Similarity Score */}
              {book.similarity_score !== undefined && (
                <div className="w-full bg-amber-500/10 text-amber-700 p-3 rounded-2xl text-center border border-amber-400/30 mb-3">
                  <span className="text-[11px] font-bold block uppercase tracking-wider">Relevansi Cosine Similarity</span>
                  <span className="text-xl font-bold font-serif text-amber-600">
                    {(book.similarity_score * 100).toFixed(1)}% Match
                  </span>
                </div>
              )}

              {/* Language Code Badge */}
              <div className="w-full bg-slate-100 px-3 py-2 rounded-xl text-center text-xs font-medium text-slate-700 border border-slate-200 mb-4 flex items-center justify-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600" />
                <span>Bahasa Dataset: <strong>{langCode}</strong></span>
              </div>

              {/* External GoodReads Link */}
              {book.link && (
                <a
                  href={book.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-full bg-slate-900 hover:bg-black text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm border border-amber-400/30"
                >
                  <span>Buka di Goodreads</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Right Column: Complete Metadata */}
            <div className="sm:col-span-2 space-y-5">
              <div>
                {/* Target Categories */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <span className="text-xs font-bold text-text-muted mr-1">Kategori:</span>
                  {book.categories && book.categories.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-400/30 text-xs font-bold flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-amber-600" /> {cat}
                    </span>
                  ))}
                </div>

                <h2 className="font-serif font-bold text-xl sm:text-2xl text-text-primary leading-tight mb-1">
                  {book.title}
                </h2>
                <p className="text-sm font-medium text-text-secondary mb-3">
                  Penulis: <span className="text-text-primary font-bold">{book.author}</span>
                </p>

                {/* All Genres Chips List (Keseluruhan Genre Asli) */}
                <div className="p-4 rounded-2xl bg-white border border-border text-xs space-y-2 shadow-sm">
                  <span className="font-bold text-text-primary flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-600" /> Keseluruhan Genre:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {allGenresList.map((g, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats Grid — Halaman dan Format DIPISAH */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 rounded-2xl bg-white border border-border text-center shadow-sm">
                <div>
                  <span className="text-[10px] text-text-muted block">Rating Utama</span>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{book.rating ? book.rating.toFixed(2) : 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">Total Penilai</span>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary mt-1">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    <span>{book.totalratings !== undefined && book.totalratings !== null ? book.totalratings.toLocaleString() : '0'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">Total Ulasan</span>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary mt-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>{book.reviews !== undefined && book.reviews !== null ? book.reviews.toLocaleString() : '0'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">Jumlah Halaman</span>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary mt-1">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>{book.pages ? `${book.pages} hlm` : '-'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted block">Format Buku</span>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-text-primary mt-1 truncate">
                    <BookType className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{book.bookformat || 'Paperback'}</span>
                  </div>
                </div>
              </div>

              {/* Full Description (Teks Rapi Dalam Kontainer Pembatas) */}
              <div>
                <h4 className="font-serif font-bold text-text-primary text-sm mb-2">
                  Deskripsi & Sinopsis Lengkap Buku
                </h4>
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-border text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words overflow-hidden shadow-sm">
                  {descriptionText}
                </div>
              </div>

              {/* Technical Metadata (ISBN) */}
              {(book.isbn13 || book.isbn10) && (
                <div className="pt-3 border-t border-border text-xs text-text-muted flex flex-wrap gap-4">
                  {book.isbn13 && <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-amber-600" /> <strong>ISBN-13:</strong> {book.isbn13}</span>}
                  {book.isbn10 && <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-amber-600" /> <strong>ISBN-10:</strong> {book.isbn10}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
