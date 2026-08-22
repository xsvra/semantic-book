import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(quickQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              SemanticBook
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
              Multilingual SBERT
            </span>
          </div>
        </Link>

        {/* Quick Search (Navbar Header) */}
        {location.pathname !== '/' && (
          <form onSubmit={handleQuickSearch} className="hidden md:flex flex-1 max-w-xs relative items-center">
            <input
              type="text"
              placeholder="Cari makna atau topik..."
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-slate-800 border border-slate-700 focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-400 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          </form>
        )}

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive('/')
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Beranda
          </Link>
          <Link
            to="/books"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive('/books')
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Katalog Buku
          </Link>
          <Link
            to="/about"
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive('/about')
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Tentang Sistem
          </Link>
        </nav>
      </div>
    </header>
  );
}
