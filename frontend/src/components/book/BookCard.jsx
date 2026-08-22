import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function BookCard({ book, onClick }) {
  const [imgError, setImgError] = useState(false);

  const genreTags = book.genre_tags && book.genre_tags.length > 0 
    ? book.genre_tags.slice(0, 3) 
    : ['Nonfiction'];

  const rankDisplay = book.rank ? `#${book.rank}` : null;
  const langCode = (book.language_code || 'EN').toUpperCase();

  const fallbackCover = (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center p-2 text-center text-text-muted">
      <BookOpen className="w-6 h-6 mb-1 text-gold opacity-60" />
      <span className="text-[10px] font-serif font-medium text-text-primary line-clamp-2">{book.title}</span>
    </div>
  );

  return (
    <div
      onClick={() => onClick(book)}
      className="group cursor-pointer bg-white rounded-2xl border border-border shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
    >
      {/* Top Banner Container with Professional Slate Navy Blurred Cover Background */}
      <div className="relative h-44 sm:h-48 w-full bg-[#1E293B] flex items-center justify-center p-3 overflow-hidden">
        {/* Cover image blurred background effect */}
        {book.cover_url && !imgError ? (
          <div
            className="absolute inset-0 bg-cover bg-center blur-md opacity-40 scale-110 pointer-events-none transition-transform duration-500 group-hover:scale-125"
            style={{ backgroundImage: `url(${book.cover_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B] pointer-events-none" />
        )}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        {/* Top Badges Header */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
          {/* Rank Badge #1, #2... */}
          {rankDisplay ? (
            <div className="bg-[#0F172A] text-amber-400 text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-md font-mono border border-amber-400/30">
              {rankDisplay}
            </div>
          ) : <div />}

          {/* Top Right: Cosine Similarity Match & Language Code */}
          <div className="flex items-center gap-1.5 ml-auto">
            {book.similarity_score !== undefined && (
              <span className="px-2 py-0.5 rounded-md bg-gold text-white text-[10px] font-bold shadow-sm">
                {(book.similarity_score * 100).toFixed(1)}% Match
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-white/90 text-text-primary text-[10px] font-extrabold shadow-sm border border-white/80">
              {langCode}
            </span>
          </div>
        </div>

        {/* Center 3D Standing Physical Book Cover */}
        <div className="relative z-10 w-24 sm:w-28 aspect-[2/3] bg-white rounded-r-md rounded-l-sm shadow-2xl overflow-hidden border-l-4 border-slate-400/80 border-y border-r border-white/60 transition-transform duration-300 group-hover:scale-105 translate-y-2">
          {/* Spine effect overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/30 to-transparent z-10 pointer-events-none" />
          {book.cover_url && !imgError ? (
            <img
              src={book.cover_url}
              alt={book.title}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            fallbackCover
          )}
        </div>
      </div>

      {/* Bottom Content Container */}
      <div className="p-4 sm:p-5 bg-white flex flex-col justify-between flex-1 space-y-2.5 pt-5">
        <div>
          {/* Title */}
          <h3 className="font-serif font-bold text-sm text-text-primary group-hover:text-gold transition-colors line-clamp-2 leading-snug mb-1">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs font-medium text-text-secondary line-clamp-1 mb-2.5">
            {book.author}
          </p>

          {/* Genre Tags from genre_text (Maksimal 3 Genre Tags) */}
          <div className="flex flex-wrap gap-1 mb-1">
            {genreTags.map((gt, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium tracking-tight border border-slate-200/80"
              >
                {gt}
              </span>
            ))}
          </div>
        </div>

        {/* Short Description Excerpt Quote */}
        <div className="pt-2.5 border-t border-border/60">
          <p className="text-[11px] italic text-text-muted line-clamp-2 leading-relaxed">
            "{book.short_description}"
          </p>
        </div>
      </div>
    </div>
  );
}
