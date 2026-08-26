import axios from 'axios';

// Vite otomatis memilih URL yang tepat tergantung mode (dev vs prod)
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : 'https://xsvra-semantic-book-backend.hf.space/api/v1')
).replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchBooks = async ({ page = 1, limit = 10, category = null, sort_by = null, order = 'desc' }) => {
  const params = { page, limit, order };
  if (category) params.category = category;
  if (sort_by) params.sort_by = sort_by;

  const res = await apiClient.get('/books', { params });
  return res.data;
};

export const fetchTopRated = async (limit = 20) => {
  const res = await apiClient.get('/books/top-rated', { params: { limit } });
  return res.data;
};

export const fetchTopRatedBooks = fetchTopRated;

export const fetchBookById = async (id) => {
  const res = await apiClient.get(`/books/${id}`);
  return res.data;
};

export const searchSemanticBooks = async ({ query, use_reranker = false, category = null, page = 1, limit = 10 }) => {
  const res = await apiClient.post('/search', {
    query,
    use_reranker,
    top_k: 50,
    category: category || null,
    page,
    limit,
  });
  return res.data;
};

export const fetchRecommendations = async ({ page = 1, limit = 10, category = null }) => {
  const params = { page, limit };
  if (category) params.category = category;
  const res = await apiClient.get('/recommend', { params });
  return res.data;
};

export const fetchCategories = async () => {
  const res = await apiClient.get('/meta/categories');
  return res.data;
};

export const fetchLanguages = async () => {
  const res = await apiClient.get('/meta/languages');
  return res.data;
};

export const fetchEvaluationMetrics = async () => {
  const res = await apiClient.get('/meta/metrics');
  return res.data;
};
