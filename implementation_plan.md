# Implementation Plan: Website Sistem Rekomendasi Buku Non-Fiksi

## 1. Ringkasan Proyek

Website ini adalah wadah implementasi (front-end + back-end serving) dari model sistem rekomendasi buku non-fiksi berbasis **Sentence-BERT + Cosine Similarity**, dengan dukungan **cross-lingual search** (Indonesia–Inggris) dan **semantic search** (bukan sekadar keyword matching).

**Tujuan produk:**
- Membuktikan hasil model rekomendasi dalam bentuk aplikasi web yang bisa dipakai user nyata (pembaca buku non-fiksi).
- UX ramah pembaca: tenang, tidak ramai, fokus ke konten buku, tipografi nyaman dibaca lama.
- Performa terasa cepat lewat skeleton loading dan pagination, bukan infinite dump data.

**Stack:**
| Layer | Teknologi | Peran |
|---|---|---|
| Frontend | React (Vite) + TailwindCSS | UI, state, animasi |
| Backend | FastAPI | REST API, serving model, query dataset |
| Model | Sentence-BERT (SBERT) + Cosine Similarity | Semantic & cross-lingual recommendation |
| Data | Dataset buku non-fiksi (5 subkategori) | Sumber metadata & embedding |

---

## 2. Design System

### 2.1 Prinsip UX
Target user adalah pembaca buku non-fiksi (self-development, produktivitas, psikologi, dsb) — audiens yang menghargai **ketenangan visual**, **kejelasan informasi**, dan **kecepatan menemukan buku yang relevan**. Desain mengikuti pendekatan "reading-first": banyak whitespace, kontras teks tinggi, minim elemen dekoratif yang mengganggu.

### 2.2 Palet Warna
Tema "warm neutral + calm accent" — terinspirasi dari nuansa perpustakaan/kertas, bukan tema tech-startup yang dingin.

```
--color-bg-base:      #FAF7F2   /* warm off-white, seperti kertas buku */
--color-bg-surface:   #FFFFFF   /* card, modal */
--color-bg-muted:     #F1ECE3   /* section alternatif, skeleton base */

--color-text-primary: #2B2620   /* hampir hitam, warm dark brown-grey */
--color-text-secondary:#6B6255  /* deskripsi, metadata sekunder */
--color-text-muted:   #A39A8A   /* placeholder, label kecil */

--color-accent:       #A85D3B   /* terracotta — CTA, highlight, active state */
--color-accent-hover: #8F4A2C
--color-accent-soft:  #F1E1D6   /* badge, chip kategori */

--color-success:      #4C7A5E   /* rating tinggi, badge positif */
--color-border:       #E7E0D4
--color-focus-ring:   #C98A63
```

Alasan: terracotta/warm brown terasa "buku lama & bersahabat", bukan biru korporat generik. Warna ini juga cukup dipakai untuk cross-language cue (mis. badge bahasa) tanpa perlu warna tambahan yang riuh.

### 2.3 Tipografi
- **Heading font:** `Fraunces` atau `Lora` (serif, karakter "buku", tetap modern) — dipakai untuk judul buku & headline.
- **Body font:** `Inter` atau `Plus Jakarta Sans` (sans-serif, sangat mudah dibaca di layar, mendukung karakter Latin extended untuk konten dwi-bahasa ID/EN).
- Skala tipografi (Tailwind `text-*` custom scale):

```
text-display: 2.75rem / 1.1   (Hero headline)
text-h1:      2rem / 1.2
text-h2:      1.5rem / 1.3
text-h3:      1.125rem / 1.4
text-body:    1rem / 1.6
text-small:   0.875rem / 1.5
text-caption: 0.75rem / 1.4
```

Body line-height dibuat agak lega (1.6) karena target user sering membaca deskripsi buku panjang.

### 2.4 Style & Motion Guidelines
- **Border radius:** konsisten `rounded-2xl` (16px) untuk card, `rounded-full` untuk badge/button pill — kesan lembut, ramah.
- **Shadow:** soft, low-opacity (`shadow-[0_4px_20px_rgba(43,38,32,0.06)]`), hindari shadow tajam ala Material.
- **Motion:** gunakan `framer-motion` untuk scroll-reveal (fade + translateY 24px → 0), durasi 400–500ms, easing `ease-out`. Jangan overuse — hanya di transisi antar section dan saat card muncul pertama kali.
- **Spacing rhythm:** section vertical padding besar (`py-20 md:py-28`) supaya halaman terasa "bernapas", bukan padat.

---

## 3. Arsitektur Informasi & Navigasi

```
Navbar (sticky, transparan di hero → solid saat scroll)
├── Home        (/)
├── Books        (/books)
└── About        (/about)
```

Navbar juga menampung search bar ringkas (opsional, redirect ke `/books?q=...`) agar search bisa diakses dari semua halaman, sementara search bar utama tetap di Hero section Home.

---

## 4. Struktur Folder Proyek

```
semantic-book/                           # folder root project (sudah ada, dipakai as-is)
│   GoodReads_100k_books.csv             # raw dataset awal (sumber, sebelum cleaning)
│   output_interactive_hybrid.md
│   sistem_rekomendasi_buku.ipynb        # notebook eksperimen & training model
│
├── config/
│   ├── deployment_config.json           # dibaca backend: path model, path artifact, threshold
│   └── evaluation_metrics.json          # hasil evaluasi model (lampiran BAB IV skripsi)
│
├── data/
│   ├── books_catalog.csv                # dataset final siap pakai
│   ├── books_catalog.parquet            # versi parquet — dipakai backend (load lebih cepat dari CSV)
│   ├── book_order_manifest.csv          # mapping urutan/index baris ↔ book_id (penting agar index embedding sinkron dgn katalog)
│   ├── mpnet_embeddings.npy             # embedding buku hasil precompute bi-encoder (mpnet)
│   └── title_search_index.json          # index tambahan untuk lexical/title matching (fallback/hybrid)
│
├── models/
│   ├── multilingual_mpnet/              # BI-ENCODER — encode query & buku ke vector utk retrieval awal
│   │   ├── 1_Pooling/config.json
│   │   ├── config.json
│   │   ├── config_sentence_transformers.json
│   │   ├── model.safetensors
│   │   ├── modules.json
│   │   ├── sentence_bert_config.json
│   │   ├── tokenizer.json
│   │   └── tokenizer_config.json
│   │
│   └── multilingual_cross_encoder/      # CROSS-ENCODER — rerank top-K kandidat hasil bi-encoder
│       ├── config.json
│       ├── config_sentence_transformers.json
│       ├── model.safetensors
│       ├── modules.json
│       ├── sentence_bert_config.json
│       ├── tokenizer.json
│       └── tokenizer_config.json
│
├── backend/                            # BARU — ditambahkan sebagai bagian implementasi web
│   ├── app/
│   │   ├── main.py                # entrypoint FastAPI
│   │   ├── core/
│   │   │   ├── config.py          # baca ../config/deployment_config.json (path model & artifact)
│   │   │   └── logging.py
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── routes_books.py
│   │   │       ├── routes_recommend.py
│   │   │       └── routes_search.py
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── embedding_service.py   # load multilingual_mpnet, encode query → vector
│   │   │   ├── rerank_service.py      # load multilingual_cross_encoder, rerank top-K kandidat
│   │   │   ├── recommend_service.py   # orkestrasi: cosine similarity (retrieve) → cross-encoder (rerank)
│   │   │   └── book_repository.py     # akses ../data/books_catalog.parquet + book_order_manifest.csv
│   │   └── ml/
│   │       └── model_loader.py        # load & cache kedua model (mpnet + cross-encoder) saat startup, singleton
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                           # BARU — ditambahkan sebagai bagian implementasi web
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── routes/
│   │   │   ├── Home.jsx
│   │   │   ├── Books.jsx
│   │   │   └── About.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── home/
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── TopRatedCarousel.jsx
│   │   │   │   └── RecommendationGrid.jsx
│   │   │   ├── books/
│   │   │   │   ├── FilterBar.jsx
│   │   │   │   ├── BookGrid.jsx
│   │   │   │   └── Pagination.jsx
│   │   │   ├── book/
│   │   │   │   ├── BookCard.jsx
│   │   │   │   ├── BookCardSkeleton.jsx
│   │   │   │   └── BookDetailModal.jsx
│   │   │   └── ui/                    # button, badge, chip, input primitives
│   │   ├── hooks/
│   │   │   ├── useBooks.js
│   │   │   ├── useRecommendations.js
│   │   │   └── useDebounce.js
│   │   ├── lib/
│   │   │   └── apiClient.js           # axios/fetch wrapper + React Query setup
│   │   ├── styles/
│   │   │   └── tailwind.css
│   │   └── constants/
│   │       └── categories.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── package.json
│
└── implementation_plan.md
```

---

## 5. Backend (FastAPI) — Desain & Best Practice

### 5.1 Prinsip
- **Layered architecture**: routes → services → repository/model, agar logic model gampang diuji terpisah dari HTTP layer.
- **Arsitektur retrieval dua tahap** (sesuai artifact yang sudah ada di `models/`, root project `semantic-book/`):
  1. **Retrieval** — query di-encode pakai bi-encoder `multilingual_mpnet`, dibandingkan (cosine similarity) terhadap `mpnet_embeddings.npy` untuk ambil top-K kandidat (mis. top-50) secara cepat.
  2. **Rerank** — top-K kandidat tadi dipasangkan ulang dengan query lalu dinilai oleh `multilingual_cross_encoder` untuk urutan akhir yang lebih presisi, baru dipotong sesuai `limit`/pagination yang diminta frontend.
  - Pola ini dipilih karena cross-encoder jauh lebih akurat tapi mahal secara komputasi bila dijalankan ke seluruh dataset — sehingga hanya dijalankan ke kandidat hasil penyaringan bi-encoder, bukan ke seluruh katalog.
- **Async I/O** untuk endpoint yang tidak murni CPU-bound; inferensi kedua model tetap sync tapi dijalankan lewat `run_in_threadpool` agar tidak blocking event loop.
- **Kedua model dimuat sekali saat startup** (`lifespan` context di `model_loader.py`) — jangan reload `multilingual_mpnet`/`multilingual_cross_encoder` per-request.
- **Embedding buku sudah precompute** (`mpnet_embeddings.npy`, hasil notebook `sistem_rekomendasi_buku.ipynb`) — backend tinggal load, tidak menghitung ulang. Pastikan urutan baris `mpnet_embeddings.npy` selalu disinkronkan dengan `book_order_manifest.csv` agar index vector ↔ book_id tidak meleset.
- **Baca `books_catalog.parquet`** (bukan `.csv`) di `book_repository.py` untuk performa load yang lebih baik; `books_catalog.csv` & `GoodReads_100k_books.csv` cukup jadi arsip/sumber awal.
- **`title_search_index.json`** dimanfaatkan sebagai fallback lexical search (mis. saat query sangat pendek/persis judul) yang bisa dikombinasikan (hybrid) dengan hasil semantic search, opsional sesuai kebutuhan evaluasi skripsi.
- **`deployment_config.json`** jadi single source of truth untuk path model/artifact yang dibaca `core/config.py`, agar tidak hardcode path di kode.
- **Validasi ketat** dengan Pydantic schemas untuk request & response (auto-generate OpenAPI docs untuk dokumentasi skripsi).
- **CORS** diaktifkan untuk origin frontend (dev: `localhost:5173`, prod: domain deploy).
- **Pagination di level backend**, bukan frontend, agar payload ringan.

### 5.2 Endpoint Utama

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/books` | List semua buku, support `page`, `limit`, `sort_by=pages`, `order=asc/desc`, `language`, `category` |
| GET | `/api/v1/books/{book_id}` | Detail lengkap satu buku |
| GET | `/api/v1/books/top-rated` | Top 5–6 buku rating tertinggi (untuk carousel Home) |
| POST | `/api/v1/search` | Semantic + cross-lingual search berdasarkan query bebas teks |
| GET | `/api/v1/recommend` | Rekomendasi umum/personalized untuk grid Home, support `page`, `limit=10` |
| GET | `/api/v1/recommend/{book_id}/similar` | (opsional) buku serupa dari satu buku tertentu |
| GET | `/api/v1/meta/languages` | Daftar kode bahasa unik untuk populate filter |
| GET | `/api/v1/meta/categories` | Daftar 5 kategori tetap |

### 5.3 Contoh Response Schema (ringkas)

```python
class BookSummary(BaseModel):
    id: str
    title: str
    author: str
    cover_url: str | None
    rating: float
    pages: int
    language_code: str
    category: str
    short_description: str  # dipotong ~120 karakter untuk card

class BookDetail(BookSummary):
    full_description: str
    publisher: str | None
    published_year: int | None
    isbn: str | None
    similarity_score: float | None  # jika hasil dari recommend/search
```

### 5.4 Alur Semantic & Cross-Lingual Search (Retrieve → Rerank)
1. User input query (ID atau EN) → dikirim ke `/api/v1/search`.
2. **Retrieval (bi-encoder)**: `embedding_service.py` encode query pakai `multilingual_mpnet`, hitung cosine similarity terhadap `mpnet_embeddings.npy`, ambil top-K kandidat (mis. top-50) — tahap ini murah secara komputasi karena embedding buku sudah precompute.
3. **Mapping index**: index vektor hasil similarity dicocokkan ke `book_id` lewat `book_order_manifest.csv`, lalu metadata lengkap kandidat diambil dari `books_catalog.parquet`.
4. **Rerank (cross-encoder)**: `rerank_service.py` memasangkan query dengan teks (judul+deskripsi) tiap kandidat top-K, dinilai `multilingual_cross_encoder`, lalu diurutkan ulang berdasarkan skor rerank — tahap ini yang menentukan urutan akhir karena cross-encoder biasanya lebih akurat menilai relevansi pasangan query-dokumen dibanding cosine similarity murni.
5. Ambil top-N hasil rerank sesuai pagination, response menyertakan `similarity_score` (skor dari cross-encoder) agar bisa ditampilkan sebagai indikator relevansi di UI (opsional, mis. label "98% match").
6. *(Opsional hybrid)* Jika query sangat pendek/mirip judul persis, `title_search_index.json` bisa dipakai sebagai sinyal tambahan sebelum tahap rerank.

---

## 6. Frontend (React + TailwindCSS) — Desain & Best Practice

### 6.1 Prinsip
- **Vite** sebagai build tool (lebih cepat dari CRA).
- **React Query (TanStack Query)** untuk data fetching, caching, dan otomatis menangani state loading/error — pas untuk skeleton loading dan pagination.
- **Component-driven**: pisahkan `ui/` primitives (Button, Badge, Chip) dari komponen domain (BookCard, FilterBar).
- **Accessibility**: semua modal pakai focus-trap + `aria-modal`, image pakai `alt`, warna kontras minimal WCAG AA.
- **Responsive-first**: grid buku adaptif — mobile 1 kolom, tablet 2–3 kolom, desktop 4–5 kolom.

### 6.2 State & Data Flow
- `useBooks(filters, page)` → query `/api/v1/books` dengan React Query, key mencakup filter+page agar cache per kombinasi.
- `useRecommendations(page)` → query `/api/v1/recommend`.
- Filter state disimpan di URL query params (`?sort=pages&order=asc&lang=en&category=psychology&page=2`) agar shareable & browser back/forward berfungsi natural.
- Debounce search input (300ms) sebelum memanggil API.

---

## 7. Detail Halaman

### 7.1 Home (`/`)

**Section 1 — Hero**
- Headline: kalimat yang berbicara ke pembaca, menonjolkan manfaat, bukan fitur teknis. Contoh arah copy:
  - Headline: "Temukan buku non-fiksi yang benar-benar cocok dengan cara berpikirmu."
  - Sub-headline: "Cari dalam Bahasa Indonesia atau Inggris — sistem kami memahami makna di balik kata-katamu, bukan sekadar mencocokkan judul." (menyampaikan cross-lingual + semantic search dengan bahasa awam, tanpa jargon "SBERT/cosine similarity" di UI).
- Search bar besar, rounded-full, dengan placeholder yang mencontohkan query natural, mis. *"cara mengelola waktu saat kerja dari rumah..."*
- Di bawah search bar: 2 badge kecil non-intrusive: "🌐 Cross-lingual search" dan "🧠 Semantic matching" sebagai penguat kepercayaan tanpa mendominasi hero.

**Section 2 — Top Rated (horizontal scroll)**
- Heading: "Paling Dipercaya Pembaca" atau "Rating Tertinggi".
- 5–6 `BookCard` dalam container `overflow-x-auto` dengan `scroll-snap-x`, drag/scroll horizontal (bisa pakai `embla-carousel-react` untuk kontrol lebih baik + dot indicator opsional).
- Card di section ini versi ringkas (cover, judul, author, rating badge).

**Section 3 — Rekomendasi Sistem (grid + scroll animation)**
- Heading: "Rekomendasi Untukmu" / "Mungkin Kamu Suka".
- Grid 10 buku (`grid-cols-2 md:grid-cols-4 lg:grid-cols-5`), tiap card fade-up saat masuk viewport (`framer-motion` + `whileInView`, stagger ringan antar card ~50ms).
- Pagination di bawah grid (numbered atau "Muat Lebih Banyak" — rekomendasi: numbered pagination agar konsisten dengan halaman Books).

### 7.2 Books (`/books`)

- **FilterBar** (sticky di bawah navbar saat scroll, collapsible di mobile):
  1. Sort by halaman: dropdown/toggle "Halaman: Terendah → Tertinggi" / "Tertinggi → Terendah".
  2. Filter bahasa: dropdown multi-select berdasarkan kode bahasa dari `/api/v1/meta/languages`.
  3. Filter kategori: chip group (single/multi-select) — Self Development, Career Development, Productivity, Technology, Psychology.
  - Tampilkan active filter sebagai removable chips di atas grid + tombol "Reset filter".
- **Grid**: maksimal 20 card per halaman, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`.
- **Pagination**: numbered dengan prev/next, scroll-to-top halus saat ganti halaman.
- Saat filter berubah → tampilkan skeleton grid (20 skeleton card) selagi fetch.

### 7.3 About (`/about`)

- Section naratif: latar belakang sistem, ringkasan cara kerja (bahasa awam: "menggunakan AI untuk memahami makna deskripsi buku"), cakupan 5 kategori non-fiksi, penjelasan singkat cross-lingual support.
- Bisa tambahkan mini "How it works" 3-step visual (Cari → Sistem memahami makna → Rekomendasi relevan) untuk memperkuat kepercayaan user terhadap sistem tanpa perlu detail teknis model.
- Kredit/konteks: dapat mencantumkan bahwa ini adalah implementasi tugas akhir (opsional, sesuai kebutuhan skripsi).

---

## 8. Komponen Kunci — Spesifikasi

### 8.1 BookCard (tampilan grid awal)
Menampilkan metadata inti saja agar cepat dipindai user:
- Cover buku (aspect-ratio tetap, `object-cover`)
- Judul (max 2 baris, `line-clamp-2`)
- Author
- Rating (bintang + angka)
- Badge kategori (chip warna `accent-soft`)
- Badge bahasa (kode singkat, mis. "EN" / "ID")
- Klik di mana saja pada card → buka `BookDetailModal`

### 8.2 BookDetailModal (pop-up saat card diklik)
Menampilkan informasi lengkap:
- Cover besar + judul + author + publisher + tahun terbit
- Rating lengkap, jumlah halaman, kode bahasa, kategori
- Deskripsi lengkap (full, tidak dipotong)
- (Opsional) `similarity_score` jika modal dibuka dari hasil rekomendasi/search
- Tombol close (X) + close on backdrop click + close on `Esc`
- Animasi masuk: scale 0.95→1 + fade, durasi singkat (~200ms)

### 8.3 Skeleton Loading
- `BookCardSkeleton`: shape placeholder mengikuti struktur BookCard persis (cover block, 2 baris judul, 1 baris author, badge) memakai `bg-[--color-bg-muted]` dengan animasi `animate-pulse`.
- Dipakai di: grid Home section 3, grid Books, carousel top-rated, dan saat modal detail sedang fetch data tambahan (jika detail di-fetch terpisah dari summary).
- Jumlah skeleton yang dirender = jumlah item yang diharapkan (10 di Home, 20 di Books, 5–6 di carousel) agar tidak ada layout shift saat data asli masuk.

---

## 9. Roadmap Implementasi (Bertahap)

| Fase | Fokus | Output |
|---|---|---|
| 1 | Setup project (Vite+Tailwind, FastAPI skeleton), integrasi model SBERT + precompute embedding dataset | Backend bisa serve `/books` dan `/recommend` dengan data dummy/nyata |
| 2 | Bangun design system (warna, font, komponen UI primitive) di Tailwind config | Storybook-like preview komponen dasar (Button, Badge, Card) |
| 3 | Halaman Books (grid, filter, pagination, skeleton) — paling straightforward untuk validasi API | Halaman Books fungsional penuh |
| 4 | Halaman Home (Hero, carousel top-rated, grid rekomendasi + animasi scroll + pagination) | Halaman Home fungsional penuh |
| 5 | BookDetailModal + integrasi klik dari semua entry point (Home, Books) | Modal detail konsisten di semua halaman |
| 6 | Halaman About + copywriting final | Seluruh navigasi lengkap |
| 7 | Polish UX: responsive check, aksesibilitas, loading states, error states, empty states | Siap untuk demo/pengujian skripsi |
| 8 | (Opsional) Deployment: frontend ke Vercel/Netlify, backend ke Railway/Render/VPS | Live demo untuk sidang |

---

## 10. Hal Non-Fungsional yang Perlu Diperhatikan

- **Error & empty states**: sediakan tampilan ramah saat search tidak menemukan hasil ("Belum ada buku yang cocok, coba kata kunci lain") — bukan halaman kosong/error mentah.
- **Loading UX**: skeleton lebih baik daripada spinner untuk konten grid, agar tidak terasa "melompat" saat data masuk.
- **Responsiveness**: uji di breakpoint mobile (375px), tablet (768px), desktop (1280px+).
- **Performance**: lazy-load gambar cover (`loading="lazy"`), pertimbangkan image CDN/resize jika dataset punya URL cover besar.
- **Dokumentasi API**: manfaatkan Swagger UI otomatis dari FastAPI (`/docs`) sebagai bahan lampiran skripsi.
