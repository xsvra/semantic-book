import os
import torch
import numpy as np
from typing import Optional
from sentence_transformers import SentenceTransformer, CrossEncoder
from app.core.config import settings

class ModelLoader:
    _instance = None

    def __init__(self):
        self.bi_encoder: Optional[SentenceTransformer] = None
        self.cross_encoder: Optional[CrossEncoder] = None
        self.embeddings: Optional[np.ndarray] = None
        # Use CPU mode for stable deployment without CUDA ZeroGPU initialization intercept
        self.device: str = "cpu"
        self.is_loaded = False


    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelLoader()
        return cls._instance

    def load_all(self):
        if self.is_loaded:
            return

        print(f"Loading Models on device: {self.device}...", flush=True)

        # 1. Load Bi-Encoder (SBERT)
        bi_path = str(settings.EMBEDDING_MODEL_LOCAL)
        if os.path.exists(bi_path):
            print(f"Loading Bi-Encoder from local directory: {bi_path}", flush=True)
            self.bi_encoder = SentenceTransformer(bi_path, device=self.device)
        else:
            print(f"Local model not found. Downloading Bi-Encoder from HF: {settings.EMBEDDING_MODEL_NAME}", flush=True)
            self.bi_encoder = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, device=self.device)

        # 2. Load Cross-Encoder (Reranker)
        cross_path = str(settings.RERANKER_MODEL_LOCAL)
        if os.path.exists(cross_path):
            print(f"Loading Cross-Encoder from local directory: {cross_path}", flush=True)
            self.cross_encoder = CrossEncoder(cross_path, device=self.device)
        else:
            print(f"Local model not found. Downloading Cross-Encoder from HF: {settings.RERANKER_MODEL_NAME}", flush=True)
            self.cross_encoder = CrossEncoder(settings.RERANKER_MODEL_NAME, device=self.device)

        # 3. Load precomputed embeddings
        if settings.EMBEDDING_PATH.exists():
            print(f"Loading precomputed embeddings from {settings.EMBEDDING_PATH}...", flush=True)
            self.embeddings = np.load(settings.EMBEDDING_PATH)
            # Normalize embeddings if configured and not already normalized
            if settings.EMBEDDING_NORMALIZED:
                norms = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
                norms[norms == 0] = 1e-10
                self.embeddings = self.embeddings / norms
            print(f"Loaded embeddings matrix shape: {self.embeddings.shape}", flush=True)
        else:
            print(f"WARNING: Precomputed embeddings not found at {settings.EMBEDDING_PATH}", flush=True)

        self.is_loaded = True
        print("All Models and Embeddings successfully loaded into memory!", flush=True)

model_loader = ModelLoader.get_instance()


