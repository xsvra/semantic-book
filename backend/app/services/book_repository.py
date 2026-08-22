import ast
import re
import difflib
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings

try:
    from langdetect import detect as langdetect_detect, DetectorFactory
    DetectorFactory.seed = 0
    HAS_LANGDETECT = True
except ImportError:
    HAS_LANGDETECT = False

class BookRepository:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.manifest_df: Optional[pd.DataFrame] = None
        self.index_to_book_id: Dict[int, str] = {}
        self.book_id_to_index: Dict[str, int] = {}
        self.book_id_map: Dict[str, Dict[str, Any]] = {}
        self.normalized_titles_map: Dict[str, str] = {}
        self._is_loaded = False

    def _detect_language_code(self, title: str, desc: str) -> str:
        text = (str(title) + " " + str(desc)[:300]).strip()
        if not text:
            return 'EN'

        # 1. Non-Latin script detection for 100% precision
        if any('\u0600' <= c <= '\u06FF' for c in text):
            return 'AR'
        if any('\u0400' <= c <= '\u04FF' for c in text):
            return 'RU'
        if any('\u4e00' <= c <= '\u9fff' for c in text):
            return 'ZH'
        if any('\u0370' <= c <= '\u03FF' for c in text):
            return 'EL'

        # 2. langdetect package
        if HAS_LANGDETECT and len(text) > 10:
            try:
                lang = langdetect_detect(text)
                if lang:
                    return lang.upper()
            except Exception:
                pass

        # 3. Fallback keyword checks
        lower_text = text.lower()
        id_words = {'yang', 'dan', 'di', 'ini', 'dengan', 'untuk', 'pada', 'adalah', 'buku', 'ke', 'saya', 'tidak', 'akan', 'dari', 'bisa', 'secara', 'cara', 'dalam', 'mereka', 'oleh'}
        words = set(re.findall(r'\b\w+\b', lower_text))
        if len(words.intersection(id_words)) >= 2:
            return 'ID'

        es_words = {'el', 'la', 'los', 'las', 'del', 'por', 'como', 'para', 'una', 'con', 'mas', 'sobre'}
        if len(words.intersection(es_words)) >= 2:
            return 'ES'

        fr_words = {'les', 'des', 'une', 'pour', 'dans', 'sur', 'avec', 'est', 'que'}
        if len(words.intersection(fr_words)) >= 2:
            return 'FR'

        de_words = {'das', 'ist', 'und', 'mit', 'für', 'nicht', 'dem', 'der', 'die'}
        if len(words.intersection(de_words)) >= 2:
            return 'DE'

        return 'EN'

    def _extract_genre_text_tags(self, genre_text: str) -> List[str]:
        """Extract up to 3 clean tags directly from the genre_text column"""
        tags = []
        if genre_text and isinstance(genre_text, str):
            for g in genre_text.split(','):
                clean_g = g.strip()
                if clean_g:
                    tags.append(clean_g)
        return tags[:3] if tags else ['Nonfiction']

    def load_data(self):
        if self._is_loaded:
            return

        # Load catalog parquet or csv
        try:
            if settings.CATALOG_PATH.exists():
                self.df = pd.read_parquet(settings.CATALOG_PATH)
            else:
                csv_path = settings.CATALOG_PATH.parent / "books_catalog.csv"
                self.df = pd.read_csv(csv_path)
        except Exception:
            csv_path = settings.CATALOG_PATH.parent / "books_catalog.csv"
            self.df = pd.read_csv(csv_path)

        # Clean numeric & text fields
        self.df['rating'] = pd.to_numeric(self.df['rating'], errors='coerce').fillna(0.0)
        self.df['pages'] = pd.to_numeric(self.df['pages'], errors='coerce').fillna(0).astype(int)
        self.df['reviews'] = pd.to_numeric(self.df['reviews'], errors='coerce').fillna(0).astype(int)
        self.df['totalratings'] = pd.to_numeric(self.df['totalratings'], errors='coerce').fillna(0).astype(int)
        self.df['title'] = self.df['title'].fillna('Untitled')
        self.df['author'] = self.df['author'].fillna('Unknown Author')
        self.df['desc'] = self.df['desc'].fillna('')
        self.df['img'] = self.df['img'].fillna('')
        self.df['link'] = self.df['link'].fillna('')

        # Parse target categories list
        def parse_categories(val):
            if isinstance(val, list):
                return val
            if pd.isna(val) or not val:
                return []
            try:
                parsed = ast.literal_eval(str(val))
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [cat.strip() for cat in str(val).replace('[', '').replace(']', '').replace("'", '').split(',') if cat.strip()]

        self.df['parsed_categories'] = self.df['target_categories'].apply(parse_categories)
        self.df['language_code'] = self.df.apply(lambda r: self._detect_language_code(r['title'], r['desc']), axis=1)

        # Build book lookup maps and ensure language_code is stored in book_id_map
        for _, row in self.df.iterrows():
            book_dict = row.to_dict()
            b_id = str(row['book_id'])
            book_dict['language_code'] = str(row['language_code'])
            self.book_id_map[b_id] = book_dict
            
            norm_title = str(row.get('title_normalized', '')).strip().lower()
            if not norm_title:
                norm_title = re.sub(r'[^\w\s]', '', str(row['title'])).strip().lower()
            self.normalized_titles_map[norm_title] = b_id

        # Load order manifest
        if settings.MANIFEST_PATH.exists():
            self.manifest_df = pd.read_csv(settings.MANIFEST_PATH)
            for _, row in self.manifest_df.iterrows():
                idx = int(row['corpus_index'])
                b_id = str(row['book_id'])
                self.index_to_book_id[idx] = b_id
                self.book_id_to_index[b_id] = idx
        else:
            for idx, row in self.df.iterrows():
                b_id = str(row['book_id'])
                self.index_to_book_id[idx] = b_id
                self.book_id_to_index[b_id] = idx

        self._is_loaded = True
        print(f"BookRepository initialized with {len(self.df)} books.")

    def _row_to_summary(self, row: Dict[str, Any], rank: Optional[int] = None) -> Dict[str, Any]:
        desc = str(row.get('desc', ''))
        short_desc = desc[:130] + ('...' if len(desc) > 130 else '')
        
        categories = row.get('parsed_categories', [])
        genre_text = str(row.get('genre_text', ''))
        genre_tags = self._extract_genre_text_tags(genre_text)
        lang_code = str(row.get('language_code', 'EN'))

        return {
            "book_id": str(row.get('book_id', '')),
            "title": str(row.get('title', '')),
            "author": str(row.get('author', '')),
            "cover_url": str(row.get('img', '')) if row.get('img') else None,
            "rating": float(row.get('rating', 0.0)),
            "pages": int(row.get('pages', 0)),
            "categories": categories,
            "genre_tags": genre_tags,
            "genre_full": genre_text if genre_text else None,
            "language_code": lang_code,
            "short_description": short_desc,
            "full_description": desc,
            "bookformat": str(row.get('bookformat', '')) if row.get('bookformat') else None,
            "link": str(row.get('link', '')) if row.get('link') else None,
            "rank": rank,
            "reviews": int(row.get('reviews', 0)),
            "totalratings": int(row.get('totalratings', 0)),
            "isbn10": str(row.get('isbn10_clean', '')) if row.get('isbn10_clean') else None,
            "isbn13": str(row.get('isbn13_clean', '')) if row.get('isbn13_clean') else None
        }

    def _row_to_detail(self, row: Dict[str, Any], sim_score: Optional[float] = None, rerank_score: Optional[float] = None, rank: Optional[int] = None) -> Dict[str, Any]:
        summary = self._row_to_summary(row, rank=rank)
        summary.update({
            "similarity_score": sim_score,
            "rerank_score": rerank_score
        })
        return summary

    def find_exact_title_match(self, query: str) -> Optional[str]:
        self.load_data()
        q_norm = re.sub(r'[^\w\s]', '', query).strip().lower()
        if not q_norm:
            return None

        if q_norm in self.normalized_titles_map:
            return self.normalized_titles_map[q_norm]

        for title_norm, b_id in self.normalized_titles_map.items():
            if title_norm == q_norm or (len(q_norm) > 4 and title_norm.startswith(q_norm)):
                return b_id
        return None

    def find_fuzzy_title_suggestion(self, query: str, cutoff: float = 0.55) -> Optional[Tuple[str, str]]:
        self.load_data()
        q_norm = re.sub(r'[^\w\s]', '', query).strip().lower()
        if len(q_norm) < 3:
            return None

        if self.find_exact_title_match(query):
            return None

        all_titles = list(self.normalized_titles_map.keys())
        matches = difflib.get_close_matches(q_norm, all_titles, n=1, cutoff=cutoff)
        
        if matches:
            matched_norm = matches[0]
            b_id = self.normalized_titles_map[matched_norm]
            row = self.book_id_map.get(b_id)
            if row:
                return (str(row['title']), b_id)

        return None

    def get_books(self, page: int = 1, limit: int = 10, category: Optional[str] = None, sort_by: Optional[str] = None, order: str = "desc") -> Tuple[List[Dict[str, Any]], int]:
        self.load_data()
        filtered = self.df

        if category and category.strip():
            cat_clean = category.strip().lower()
            filtered = filtered[filtered['parsed_categories'].apply(lambda cats: any(cat_clean in c.lower() for c in cats))]

        if sort_by == "pages":
            ascending = (order == "asc")
            filtered = filtered.sort_values(by="pages", ascending=ascending)
        elif sort_by == "rating":
            ascending = (order == "asc")
            filtered = filtered.sort_values(by="rating", ascending=ascending)
        elif sort_by == "totalratings":
            ascending = (order == "asc")
            filtered = filtered.sort_values(by="totalratings", ascending=ascending)

        total = len(filtered)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paged_df = filtered.iloc[start_idx:end_idx]
        items = []
        for idx, (_, row) in enumerate(paged_df.iterrows(), start=start_idx + 1):
            items.append(self._row_to_summary(row.to_dict(), rank=idx))
        
        return items, total

    def get_book_by_id(self, book_id: str) -> Optional[Dict[str, Any]]:
        self.load_data()
        row = self.book_id_map.get(str(book_id))
        if not row:
            return None
        return self._row_to_detail(row)

    def get_top_rated(self, limit: int = 6) -> List[Dict[str, Any]]:
        """
        Buku Terpopuler: Diurutkan MURNI berdasarkan kolom totalratings terbanyak pada dataframe
        """
        self.load_data()
        top_df = self.df.sort_values(by="totalratings", ascending=False).head(limit)
        
        items = []
        for idx, (_, row) in enumerate(top_df.iterrows(), start=1):
            items.append(self._row_to_summary(row.to_dict(), rank=idx))
        return items

    def get_categories(self) -> List[Dict[str, Any]]:
        self.load_data()
        fixed_categories = [
            "Self Development",
            "Career Development",
            "Productivity",
            "Technology",
            "Psychology"
        ]
        res = []
        for cat in fixed_categories:
            count = len(self.df[self.df['parsed_categories'].apply(lambda cats: any(cat.lower() in c.lower() for c in cats))])
            res.append({"key": cat, "label": cat, "count": count})
        return res

book_repo = BookRepository()
