from typing import List, Dict, Any, Tuple
from app.ml.model_loader import model_loader

class RerankService:
    def rerank(self, query: str, candidate_books: List[Dict[str, Any]]) -> List[Tuple[Dict[str, Any], float]]:
        """
        Reranks top-K candidate books using the Cross-Encoder model.
        Returns list of tuples: (book_detail_dict, rerank_score)
        """
        if not model_loader.cross_encoder:
            raise RuntimeError("Cross-Encoder model is not loaded.")

        if not candidate_books:
            return []

        # Prepare (query, document_text) pairs
        pairs = []
        for book in candidate_books:
            title = book.get('title', '')
            desc = book.get('full_description', '') or book.get('short_description', '')
            doc_text = f"Title: {title}. Description: {desc}"
            pairs.append([query, doc_text])

        # Predict scores
        scores = model_loader.cross_encoder.predict(pairs)

        # Pair candidates with scores and sort descending
        scored_candidates = []
        for book, score in zip(candidate_books, scores):
            scored_candidates.append((book, float(score)))

        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        return scored_candidates

rerank_service = RerankService()
