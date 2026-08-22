import time
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from app.services.embedding_service import embedding_service
from app.services.rerank_service import rerank_service
from app.services.book_repository import book_repo
from app.ml.model_loader import model_loader

class RecommendService:
    def search_books(
        self,
        query: str,
        use_reranker: bool = False,
        top_k: int = 50,
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[Dict[str, Any]], int, float, bool, Optional[str], Optional[str], bool]:
        """
        Orchestrates 3 search needs:
        1. Exact Title Match check
        2. Typo Spelling Correction check ("Mungkin maksud Anda")
        3. Semantic Retrieval (SBERT + Cosine Similarity) + Cross-Encoder Reranker
        Returns (items, total_count, inference_time_seconds, used_reranker, did_you_mean, did_you_mean_book_id, is_exact_match)
        """
        start_time = time.time()
        
        did_you_mean = None
        did_you_mean_book_id = None
        is_exact_match = False

        # 1. Check for exact title match
        exact_b_id = book_repo.find_exact_title_match(query)
        
        # 2. Check for typo / spelling correction if not exact match
        if not exact_b_id:
            suggestion = book_repo.find_fuzzy_title_suggestion(query)
            if suggestion:
                did_you_mean, did_you_mean_book_id = suggestion

        # 3. Retrieve top candidates via embedding service
        if exact_b_id and exact_b_id in book_repo.book_id_to_index:
            # Use exact book's embedding vector as query vector to retrieve similar books!
            exact_idx = book_repo.book_id_to_index[exact_b_id]
            exact_vector = model_loader.embeddings[exact_idx]
            similarities = np.dot(model_loader.embeddings, exact_vector)
            top_k_indices = np.argsort(similarities)[::-1][:top_k]
            top_candidates = [(int(idx), float(similarities[idx])) for idx in top_k_indices]
            is_exact_match = True
        else:
            top_candidates = embedding_service.search_similar(query, top_k=top_k)

        # Map index -> metadata detail
        candidate_details = []
        for idx, score in top_candidates:
            b_id = book_repo.index_to_book_id.get(idx)
            if b_id:
                b_detail = book_repo.get_book_by_id(b_id)
                if b_detail:
                    b_detail['similarity_score'] = round(score, 4)
                    candidate_details.append(b_detail)

        # Apply category filter if requested
        if category and category.strip():
            cat_clean = category.strip().lower()
            candidate_details = [
                b for b in candidate_details
                if any(cat_clean in c.lower() for c in b.get('categories', []))
            ]

        used_rerank = False
        final_results = candidate_details

        # 4. Rerank step if requested and not exact match (keep exact match at #1)
        if use_reranker and candidate_details and not is_exact_match:
            reranked = rerank_service.rerank(query, candidate_details)
            final_results = []
            for b_detail, r_score in reranked:
                b_detail['rerank_score'] = round(r_score, 4)
                final_results.append(b_detail)
            used_rerank = True

        # Assign ranks #1, #2, #3...
        for rank_idx, b_detail in enumerate(final_results, start=1):
            b_detail['rank'] = rank_idx

        total_count = len(final_results)

        # 5. Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged_results = final_results[start_idx:end_idx]

        inference_time = round(time.time() - start_time, 4)

        return (
            paged_results,
            total_count,
            inference_time,
            used_rerank,
            did_you_mean,
            did_you_mean_book_id,
            is_exact_match
        )

recommend_service = RecommendService()
