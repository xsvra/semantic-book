import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand info */}
          <div className="sm:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif text-lg sm:text-xl font-bold text-white">
                SemanticBook
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md">
              Wadah implementasi model sistem rekomendasi buku non-fiksi berbasis <strong>Sentence-BERT + Cosine Similarity</strong>. Membantu pembaca menemukan buku relevan secara makna dan konteks.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-amber-400 transition-colors">Beranda</Link>
              </li>
              <li>
                <Link to="/books" className="text-slate-300 hover:text-amber-400 transition-colors">Eksplor Katalog</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-amber-400 transition-colors">Metode & Evaluasi Model</Link>
              </li>
            </ul>
          </div>

          {/* Technology stack */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Teknologi & Model</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <span>Multilingual SBERT (MPNet)</span>
              </li>
              <li>
                <span>FastAPI + React Vite</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] sm:text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SemanticBook. Tugas Akhir / Skripsi Universitas Gunadarma.</p>
          <p className="flex items-center gap-1 text-slate-300 font-medium">
            Fajar Agus Dwi Rahmawan - 50422499
          </p>
        </div>
      </div>
    </footer>
  );
}
