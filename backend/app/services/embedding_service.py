import numpy as np
from typing import List, Tuple
from app.ml.model_loader import model_loader

class EmbeddingService:
    def encode_query(self, query: str) -> np.ndarray:
        if not model_loader.bi_encoder:
            raise RuntimeError("Bi-Encoder model is not loaded.")
        
        # Encode query
        embedding = model_loader.bi_encoder.encode(query, convert_to_numpy=True, normalize_embeddings=True)
        return embedding

    def search_similar(self, query: str, top_k: int = 50) -> List[Tuple[int, float]]:
        """
        Calculates cosine similarity between query vector and precomputed corpus embeddings.
        Returns list of tuples: (corpus_index, cosine_similarity_score)
        """
        if model_loader.embeddings is None:
            raise RuntimeError("Corpus embeddings matrix is not loaded.")

        query_vec = self.encode_query(query)
        
        # Cosine similarity: (N, D) dot (D,) -> (N,) because both vectors are normalized
        similarities = np.dot(model_loader.embeddings, query_vec)
        
        # Top-K indices
        top_k_indices = np.argsort(similarities)[::-1][:top_k]
        
        results = [(int(idx), float(similarities[idx])) for idx in top_k_indices]
        return results

embedding_service = EmbeddingService()
