import os
import sys

# Ensure stdout logs are unbuffered so they stream real-time to Hugging Face logs
os.environ["PYTHONUNBUFFERED"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

import importlib
import gradio as gr
import spaces

# 1. Add current working directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# 2. Import services & FastAPI routers
from app.services.book_repository import book_repo
from app.ml.model_loader import model_loader
from app.services.recommend_service import recommend_service
from app.utils.query_validator import validate_search_query
from app.api.v1.routes_books import router as books_router
from app.api.v1.routes_recommend import router as recommend_router
from app.api.v1.routes_search import router as search_router
from app.api.v1.routes_meta import router as meta_router

# 3. Explicitly load models and embeddings at startup
print("Pre-loading Book Repository and ML Models into memory...", flush=True)
book_repo.load_data()
model_loader.load_all()

# 4. ZeroGPU decorated function for HF ZeroGPU static AST analyzer
@spaces.GPU(duration=60)
def predict_search(query: str):
    is_valid, err_msg = validate_search_query(query)
    if not is_valid:
        return f"⚠️ Validasi Gagal: {err_msg}"

    results, total, time_sec, reranked, suggestion, suggestion_id, exact = recommend_service.search_books(
        query=query.strip(),
        top_k=5
    )
    titles = [f"{b.get('rank', 1)}. {b.get('title')} ({b.get('author')}) - Score: {b.get('similarity_score', 0)}" for b in results]
    return f"Ditemukan {total} buku (Waktu inferensi: {time_sec}s):\n\n" + "\n".join(titles)

# 5. Create Gradio Blocks UI
with gr.Blocks(title="Nonfiction Book Recommendation System API") as demo:
    gr.Markdown("""
    # 📚 Nonfiction Book Recommendation System API
    ### Status: **ONLINE 🟢**
    
    * **API Docs (Swagger):** [/docs](/docs)
    * **Search Endpoint:** `/api/v1/search`
    * **Recommendation Endpoint:** `/api/v1/recommend`
    * **Books Catalog:** `/api/v1/books`
    """)
    with gr.Row():
        input_text = gr.Textbox(label="Coba Search Buku", placeholder="Ketik topik atau judul buku...")
        output_text = gr.Textbox(label="Hasil Rekomendasi API")
    search_btn = gr.Button("Cari Rekomendasi")
    search_btn.click(fn=predict_search, inputs=input_text, outputs=output_text)

# 6. Include all REST API routers into Gradio's underlying FastAPI app (demo.app)
demo.app.include_router(books_router, prefix="/api/v1")
demo.app.include_router(recommend_router, prefix="/api/v1")
demo.app.include_router(search_router, prefix="/api/v1")
demo.app.include_router(meta_router, prefix="/api/v1")

# Export app reference for ASGI
app = demo.app

# 7. Launch Gradio queue so HF Space Node.js runner stays alive 24/7
if __name__ == "__main__":
    demo.queue().launch(server_name="0.0.0.0", server_port=7860)