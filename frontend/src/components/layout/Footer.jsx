import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif text-xl font-bold text-white">
                SemanticBook
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Wadah implementasi model sistem rekomendasi buku non-fiksi berbasis <strong>Sentence-BERT + Cosine Similarity</strong>. Membantu pembaca menemukan buku relevan secara makna dan konteks.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-serif font-semibold text-white mb-4 text-base">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-sm">
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
            <h4 className="font-serif font-semibold text-white mb-4 text-base">Teknologi & Model</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span>Multilingual SBERT (MPNet)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>FastAPI + React Vite</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SemanticBook. Tugas Akhir / Skripsi Universitas Gunadarma.</p>
          <p className="flex items-center gap-1 text-slate-300 font-medium">
            Fajar Agus Dwi Rahmawan - 50422499
          </p>
        </div>
      </div>
    </footer>
  );
}
