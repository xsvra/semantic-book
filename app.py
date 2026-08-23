import os
import sys

# Ensure stdout logs are unbuffered so they stream real-time to Hugging Face logs
os.environ["PYTHONUNBUFFERED"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

import importlib.util
import gradio as gr
import spaces
from fastapi.middleware.cors import CORSMiddleware

# 1. Register 'app/' directory as a Python package to prevent module name collision
app_dir = os.path.join(os.path.dirname(__file__), "app")
init_file = os.path.join(app_dir, "__init__.py")
if not os.path.exists(init_file):
    with open(init_file, "w") as f:
        pass

spec = importlib.util.spec_from_file_location("app", init_file, submodule_search_locations=[app_dir])
app_pkg = importlib.util.module_from_spec(spec)
sys.modules["app"] = app_pkg
spec.loader.exec_module(app_pkg)

# 2. Import services & FastAPI routers directly
from app.services.book_repository import book_repo
from app.ml.model_loader import model_loader
from app.services.recommend_service import recommend_service
from app.utils.query_validator import validate_search_query
from app.api.v1.routes_books import router as books_router
from app.api.v1.routes_recommend import router as recommend_router
from app.api.v1.routes_search import router as search_router
from app.api.v1.routes_meta import router as meta_router

# 3. Pre-load Book Repository and ML Models ONCE into memory
print("Pre-loading Book Repository and ML Models into memory...", flush=True)
book_repo.load_data()
model_loader.load_all()

# 4. ZeroGPU decorated function following official HF ZeroGPU specification
@spaces.GPU
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

# 5. Create Gradio Blocks interface
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

# 6. Configure CORS Middleware on Gradio's single underlying FastAPI app
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 7. Include FastAPI REST API routers directly into Gradio's single underlying FastAPI app
demo.app.include_router(books_router, prefix="/api/v1")
demo.app.include_router(recommend_router, prefix="/api/v1")
demo.app.include_router(search_router, prefix="/api/v1")
demo.app.include_router(meta_router, prefix="/api/v1")

# Export app instance for ASGI servers if imported
app = demo.app

# 8. Launch Gradio server loop to keep Hugging Face Space running 24/7
demo.launch(server_name="0.0.0.0", server_port=7860)
