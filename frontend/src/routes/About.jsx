import React, { useEffect, useState } from 'react';
import { Brain, Globe, Award, BookOpen, Layers, Target, CheckCircle2, BarChart3, HelpCircle } from 'lucide-react';
import { fetchEvaluationMetrics } from '../lib/apiClient';

export default function About() {
  const [metricsList, setMetricsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchEvaluationMetrics()
      .then((data) => {
        if (isMounted) setMetricsList(data || []);
      })
      .catch((err) => console.error("Failed to load metrics:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const mpnetRetrieval = metricsList.find(m => m.system_name === 'MPNET_RETRIEVAL') || {
    precision_at_5: 0.7660,
    precision_at_10: 0.7160,
    recall_at_5: 0.1223,
    recall_at_10: 0.2268,
    map_at_5: 0.7152,
    map_at_10: 0.6382,
    mrr_at_5: 0.8590,
    mrr_at_10: 0.8640,
    ndcg_at_5: 0.6207,
    ndcg_at_10: 0.5912,
    pooled_recall_at_50: 0.7771
  };

  return (
    <div className="min-h-screen py-12 bg-bg-base text-text-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-text-primary leading-tight">
            Sistem Rekomendasi Buku Non Fiksi Menggunakan Sentence-BERT + Cosine Similarity
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Sistem rekomendasi buku non-fiksi ini dirancang untuk membantu pembaca menemukan buku yang paling relevan dengan kebutuhan, permasalahan, atau topik yang dicari secara semantik. Dengan memanfaatkan kecerdasan buatan dan pemrosesan bahasa alami (NLP), sistem memetakan makna kalimat pengguna ke dalam ruang vektor untuk menghitung tingkat kemiripan kosinus (*Cosine Similarity*) secara presisi.
          </p>
        </div>

        {/* 4-Step Project Workflow Architecture */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-2xl text-text-primary text-center sm:text-left">
            Alur Kerja Projek & Arsitektur Rekomendasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-border shadow-soft space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-serif font-bold flex items-center justify-center text-base">
                1
              </div>
              <h3 className="font-serif font-bold text-sm text-text-primary">Query Input & Spellcheck</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Menerima kalimat masalah pengguna. Menguji match judul persis & pengoreksian ejaan typo (*"Mungkin maksud Anda"*).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-soft space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-serif font-bold flex items-center justify-center text-base">
                2
              </div>
              <h3 className="font-serif font-bold text-sm text-text-primary">Multilingual Vector Embeddings</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Model Bi-Encoder SBERT (`paraphrase-multilingual-mpnet-base-v2`) mengekstraksi vektor semantik dari 34+ bahasa dataset.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-soft space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-serif font-bold flex items-center justify-center text-base">
                3
              </div>
              <h3 className="font-serif font-bold text-sm text-text-primary">Cosine Similarity Retrieval</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Menghitung derajat kemiripan kosinus (*Cosine Similarity*) untuk mengambil top-50 kandidat buku paling relevan.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-border shadow-soft space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-serif font-bold flex items-center justify-center text-base">
                4
              </div>
              <h3 className="font-serif font-bold text-sm text-text-primary">Cross-Encoder Reranking (Opsional)</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Model Cross-Encoder (`mmarco-mMiniLMv2-L12-H384-v1`) memverifikasi pasangan query-buku untuk presisi pemeringkatan akhir.
              </p>
            </div>
          </div>
        </div>

        {/* Model Evaluation Metrics Section */}
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft space-y-8">
          <div className="flex items-center gap-3 border-b border-border/80 pb-4">
            <Award className="w-7 h-7 text-amber-600 shrink-0" />
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-text-primary">
                Hasil Evaluasi Model & Interpretasi Metrik (100 Benchmark Queries)
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Pengukuran performa sistem rekomendasi berdasarkan benchmark 100 query pengujian pada notebook skripsi.
              </p>
            </div>
          </div>

          {/* Core Metrics Cards (Top Highlight) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">MAP@5</span>
              <span className="text-xl font-bold font-serif text-amber-700">{mpnetRetrieval.map_at_5.toFixed(4)}</span>
              <span className="text-[9px] text-text-muted block mt-0.5">Mean Avg Precision</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">MAP@10</span>
              <span className="text-xl font-bold font-serif text-amber-700">{mpnetRetrieval.map_at_10.toFixed(4)}</span>
              <span className="text-[9px] text-text-muted block mt-0.5">Mean Avg Precision</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase block mb-0.5">Precision@5</span>
              <span className="text-xl font-bold font-serif text-slate-900">{mpnetRetrieval.precision_at_5.toFixed(4)}</span>
              <span className="text-[9px] text-text-muted block mt-0.5">Rasio Presisi Top-5</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase block mb-0.5">MRR@10</span>
              <span className="text-xl font-bold font-serif text-slate-900">{mpnetRetrieval.mrr_at_10.toFixed(4)}</span>
              <span className="text-[9px] text-text-muted block mt-0.5">Reciprocal Rank</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase block mb-0.5">NDCG@10</span>
              <span className="text-xl font-bold font-serif text-slate-900">{mpnetRetrieval.ndcg_at_10.toFixed(4)}</span>
              <span className="text-[9px] text-text-muted block mt-0.5">Position Gain</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase block mb-0.5">Recall@10</span>
              <span className="text-xl font-bold font-serif text-slate-900">{mpnetRetrieval.recall_at_10.toFixed(4)}</span>
              <span className="text-[9px] text-text-muted block mt-0.5">Cakupan Rekomendasi</span>
            </div>
          </div>

          {/* Detailed Metric Function & Interpretation Breakdown */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-base text-text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>Fungsi & Interpretasi Hasil Nilai Evaluasi Metrik</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* MAP Interpretation */}
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-1.5">
                <span className="font-bold text-amber-900 text-sm block">1. MAP (Mean Average Precision)</span>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Fungsi:</strong> Mengukur rata-rata kumulatif presisi pada setiap peringkat saat item relevan ditemukan.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Interpretasi Nilai (MAP@5 = {mpnetRetrieval.map_at_5.toFixed(4)}):</strong> Skor tinggi 0.7152 membuktikan bahwa sistem sangat konsisten menempatkan buku-buku yang paling sesuai pada peringkat teratas (Rank #1 - #5), bukan sekadar menemukannya di urutan bawah.
                </p>
              </div>

              {/* MRR Interpretation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-sm block">2. MRR (Mean Reciprocal Rank)</span>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Fungsi:</strong> Evaluasi seberapa cepat item relevan pertama muncul pada jajaran rekomendasi.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Interpretasi Nilai (MRR@10 = {mpnetRetrieval.mrr_at_10.toFixed(4)}):</strong> Nilai mendekati 1.0 (0.8640) membuktikan bahwa buku relevan pertama rata-rata berada pada Peringkat #1 atau #2 (1 / 0.8640 ≈ 1.15).
                </p>
              </div>

              {/* Precision & Recall Interpretation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-sm block">3. Precision@K & Recall@K</span>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Fungsi:</strong> Precision mengukur ketepatan dari Top-K rekomendasi. Recall mengukur porsi total item relevan yang berhasil terpanggil.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Interpretasi Nilai (Precision@5 = {mpnetRetrieval.precision_at_5.toFixed(4)}):</strong> Sebesar 76.6% dari 5 buku teratas yang direkomendasikan adalah buku yang benar-benar relevan dengan pencarian pengguna.
                </p>
              </div>

              {/* NDCG & Pooled Recall Interpretation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-sm block">4. NDCG@K & Pooled Recall@50</span>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Fungsi:</strong> NDCG menilai bobot kebenaran urutan rekomendasi. Pooled Recall@50 mengukur cakupan pencarian kandidat awal.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  <strong>Interpretasi Nilai (NDCG@10 = {mpnetRetrieval.ndcg_at_10.toFixed(4)}):</strong> Menunjukkan bahwa urutan ranking rekomendasi telah terbukti berbobot ideal dari teratas hingga terendah.
                </p>
              </div>
            </div>
          </div>

          {/* Benchmark Comparative Table */}
          {metricsList.length > 0 && (
            <div className="pt-4 border-t border-border/80">
              <h3 className="font-serif font-bold text-base text-text-primary mb-3">
                Tabel Perbandingan Performa 4 Konfigurasi Model
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="p-2.5 font-bold">Konfigurasi Model</th>
                      <th className="p-2.5 font-bold">Precision@5</th>
                      <th className="p-2.5 font-bold">Precision@10</th>
                      <th className="p-2.5 font-bold text-amber-700">MAP@5</th>
                      <th className="p-2.5 font-bold text-amber-700">MAP@10</th>
                      <th className="p-2.5 font-bold">MRR@10</th>
                      <th className="p-2.5 font-bold">NDCG@10</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {metricsList.map((m, idx) => (
                      <tr key={idx} className={m.system_name === 'MPNET_RETRIEVAL' ? 'bg-amber-50/50 font-semibold' : 'hover:bg-bg-base'}>
                        <td className="p-2.5 font-mono text-xs">
                          {m.system_name}
                          {m.system_name === 'MPNET_RETRIEVAL' && <span className="ml-2 text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-sans font-bold">Terpilih</span>}
                        </td>
                        <td className="p-2.5">{m.precision_at_5.toFixed(4)}</td>
                        <td className="p-2.5">{m.precision_at_10.toFixed(4)}</td>
                        <td className="p-2.5 text-amber-800">{m.map_at_5.toFixed(4)}</td>
                        <td className="p-2.5 text-amber-800">{m.map_at_10.toFixed(4)}</td>
                        <td className="p-2.5">{m.mrr_at_10.toFixed(4)}</td>
                        <td className="p-2.5">{m.ndcg_at_10.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-2xl text-text-primary">
            Fitur Utama Sistem Rekomendasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border">
              <Globe className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-text-primary">Cross-lingual support (34 Bahasa)</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Mendukung pencarian lintas 34 bahasa dalam dataset buku non-fiksi secara fleksibel dan akurat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border">
              <Brain className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-text-primary">Multilingual Semantic Search & Reranking</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Memahami konteks sinonim dan permasalahan pengguna tanpa bergantung pada kecocokan judul secara kaku.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
