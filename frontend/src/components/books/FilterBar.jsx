import React from 'react';
import { Filter, X, ArrowUpDown, Tag } from 'lucide-react';

const CATEGORIES = [
  'Semua Kategori',
  'Self Development',
  'Career Development',
  'Productivity',
  'Technology',
  'Psychology'
];

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  order,
  onOrderChange,
  onReset
}) {
  const isFiltered = (selectedCategory && selectedCategory !== 'Semua Kategori') || sortBy;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-4 shadow-soft mb-8 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-text-muted flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3.5 h-3.5" /> Kategori:
          </span>
          {CATEGORIES.map((cat) => {
            const active = (selectedCategory === cat) || (!selectedCategory && cat === 'Semua Kategori');
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat === 'Semua Kategori' ? null : cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  active
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-soft'
                    : 'bg-bg-muted text-text-secondary hover:text-text-primary hover:bg-border'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown & Reset */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-text-muted">Urutkan:</span>
            <select
              value={`${sortBy || ''}_${order || 'desc'}`}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onSortChange(null);
                  onOrderChange('desc');
                } else {
                  const [s, o] = val.split('_');
                  onSortChange(s);
                  onOrderChange(o);
                }
              }}
              className="bg-bg-base border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber-400"
            >
              <option value="_desc">Bawaan (Default)</option>
              <option value="pages_asc">Halaman: Terendah → Tertinggi</option>
              <option value="pages_desc">Halaman: Tertinggi → Terendah</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-amber-400 hover:bg-black text-xs font-bold flex items-center gap-1 transition-colors border border-amber-400/30"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
