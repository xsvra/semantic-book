import React from 'react';
import { Award, Flame } from 'lucide-react';
import BookCard from '../book/BookCard';
import BookCardSkeleton from '../book/BookCardSkeleton';

export default function TopRatedCarousel({ books, isLoading, onBookClick }) {
  return (
    <section className="py-12 bg-bg-base border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-accent/20" />
              <span>Buku Pilihan Utama</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-text-primary">
              Buku Terpopuler dan Rating Tertinggi
            </h2>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="w-64 shrink-0 snap-start">
                <BookCardSkeleton />
              </div>
            ))
          ) : (
            Array.isArray(books) && books.map((book) => (
              <div key={book.book_id} className="w-64 shrink-0 snap-start">
                <BookCard book={book} onClick={onBookClick} />
              </div>
            ))
          )}

        </div>
      </div>
    </section>
  );
}
