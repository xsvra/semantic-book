import os
import json
from pathlib import Path

# Base directory detection (handles local dev & Hugging Face deployment)
_file_path = Path(__file__).resolve()
_possible_1 = _file_path.parent.parent.parent        # /home/user/app (HF deployment)
_possible_2 = _file_path.parent.parent.parent.parent # root folder (local dev)

if (_possible_1 / "data").exists():
    BASE_DIR = _possible_1
elif (_possible_2 / "data").exists():
    BASE_DIR = _possible_2
else:
    BASE_DIR = _possible_1


CONFIG_PATH = BASE_DIR / "config" / "deployment_config.json"

class Settings:
    def __init__(self):
        if CONFIG_PATH.exists():
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {}

        self.APP_NAME: str = data.get("application_name", "Nonfiction Book Recommendation System")
        self.CATALOG_PATH: Path = BASE_DIR / data.get("catalog_file", "data/books_catalog.parquet")
        self.MANIFEST_PATH: Path = BASE_DIR / "data" / "book_order_manifest.csv"
        self.EMBEDDING_PATH: Path = BASE_DIR / data.get("embedding_file", "data/mpnet_embeddings.npy")
        self.TITLE_INDEX_PATH: Path = BASE_DIR / data.get("title_index_file", "data/title_search_index.json")
        
        self.EMBEDDING_MODEL_LOCAL: Path = BASE_DIR / data.get("embedding_model_local_path", "models/multilingual_mpnet")
        self.EMBEDDING_MODEL_NAME: str = data.get("embedding_model_name", "sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
        
        self.RERANKER_MODEL_LOCAL: Path = BASE_DIR / data.get("reranker_model_local_path", "models/multilingual_cross_encoder")
        self.RERANKER_MODEL_NAME: str = data.get("reranker_model_name", "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1")
        
        self.DEFAULT_USE_RERANKER: bool = data.get("default_use_reranker", False)
        self.TOP_K_CANDIDATES: int = data.get("top_k_candidates", 50)
        self.DEFAULT_PAGE_SIZE: int = data.get("default_page_size", 10)
        self.MAXIMUM_PAGE_SIZE: int = data.get("maximum_page_size", 20)
        self.EMBEDDING_NORMALIZED: bool = data.get("embedding_normalized", True)

settings = Settings()
