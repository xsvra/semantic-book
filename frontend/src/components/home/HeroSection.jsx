import React, { useState } from 'react';
import { Search, Globe, Brain, AlertTriangle, X } from 'lucide-react';
import { validateSearchInput } from '../../lib/validateSearchInput';

const SAMPLE_QUERIES = [
  "cara mengelola waktu dan mengatasi prokrastinasi...",
  "memahami penyebab kecemasan sosial dan membangun percaya diri...",
  "strategi membangun kebiasaan baik secara konsisten...",
  "managing teams and organizational leadership..."
];

export default function HeroSection({ query, setQuery, onSearch, useReranker, setUseReranker, isSearching }) {
  const [validationError, setValidationError] = useState(null);

  const handleSampleClick = (sample) => {
    setQuery(sample);
    setValidationError(null);
    onSearch(sample, useReranker);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateSearchInput(query);
    if (!result.isValid) {
      setValidationError(result.message);
      return;
    }
    setValidationError(null);
    onSearch(result.sanitized, useReranker);
  };

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white border-b border-slate-800">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Headline */}
        <h1 className="font-serif font-bold text-2xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.2] sm:leading-[1.15] mb-4 sm:mb-6">
          Temukan buku non-fiksi yang cocok dengan <span className="italic text-amber-400 underline decoration-amber-400/30 underline-offset-8">cara berpikirmu</span>.
        </h1>

        {/* Subheadline */}
        <p className="text-xs sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6 sm:mb-10">
          Cari berdasarkan topik, pertanyaan, atau masalah yang ingin kamu selesaikan — sistem kami memahami makna mendalam di balik setiap kalimatmu secara multilingual & cross-lingual.
        </p>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="max-w-2xl mx-auto mb-4 p-3 sm:p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-200 flex items-center justify-between text-xs sm:text-sm animate-in fade-in shadow-lg">
            <div className="flex items-center gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" />
              <span className="font-medium">{validationError}</span>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="p-1 rounded-full hover:bg-rose-500/30 text-rose-300 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* Main Search Bar (Responsive flex-col on mobile, flex-row on sm screens) */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-6">
          <div className={`relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full border shadow-2xl p-2 gap-2 sm:gap-0 transition-all focus-within:ring-4 ${validationError ? 'border-rose-500 ring-rose-400/40' : 'border-slate-300 focus-within:ring-amber-400/30'}`}>
            <div className="flex items-center flex-1 w-full pl-2 sm:pl-4">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Ketik judul buku, topik, atau kecemasan yang ingin kamu atasi..."
                className="w-full px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-base bg-transparent text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full bg-slate-900 hover:bg-black text-amber-400 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shrink-0 shadow-md disabled:opacity-50 border border-amber-400/30"
            >
              {isSearching ? (
                <span>Mencari...</span>
              ) : (
                <span>Cari Rekomendasi</span>
              )}
            </button>
          </div>
        </form>

        {/* Badges & Reranker Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300 mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Cross-lingual support (34 Bahasa)</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Semantic search</span>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-800/80 px-3 sm:px-3.5 py-1.5 rounded-full border border-slate-700 hover:border-amber-400/50 transition-colors shadow-sm text-white text-[11px] sm:text-xs">
            <input
              type="checkbox"
              checked={useReranker}
              onChange={(e) => setUseReranker(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-400"
            />
            <span className="font-semibold text-slate-200">Cross-Encoder Reranker</span>
            <span className="text-[9px] sm:text-[10px] text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full font-bold">Presisi Tinggi</span>
          </label>
        </div>

        {/* Sample Queries */}
        <div className="space-y-2">
          <span className="text-[11px] sm:text-xs text-slate-400 font-medium block">Atau coba contoh topik berikut:</span>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {SAMPLE_QUERIES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="px-2.5 sm:px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-400 text-[10px] sm:text-xs transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
