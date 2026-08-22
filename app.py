import os
import sys

# Ensure stdout logs are unbuffered so they stream real-time to Hugging Face logs
os.environ["PYTHONUNBUFFERED"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

import importlib.util

try:
    import gradio as gr
except ImportError:
    gr = None

try:
    import spaces
except ImportError:
    class spaces:
        @staticmethod
        def GPU(func):
            return func

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

# 2. Import FastAPI root app & services
from app.main import app as fastapi_app
from app.services.book_repository import book_repo
from app.ml.model_loader import model_loader
from app.services.recommend_service import recommend_service

# 3. Pre-load Book Repository and ML Models into memory
print("Pre-loading Book Repository and ML Models into memory...", flush=True)
book_repo.load_data()
model_loader.load_all()

# 4. Configure CORS Middleware on FastAPI root app to allow Vercel domain requests
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. ZeroGPU decorated function following official HF ZeroGPU specification
@spaces.GPU
def predict_search(query: str):
    if not query or not query.strip():
        return "Masukkan kata kunci pencarian..."
    results, total, time_sec, reranked, suggestion, suggestion_id, exact = recommend_service.search_books(
        query=query.strip(),
        top_k=5
    )
    titles = [f"{b.get('rank', 1)}. {b.get('title')} ({b.get('author')}) - Score: {b.get('similarity_score', 0)}" for b in results]
    return f"Ditemukan {total} buku (Waktu inferensi: {time_sec}s):\n\n" + "\n".join(titles)

# 6. Create Gradio Blocks interface if Gradio is available
if gr is not None:
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

    # 7. Mount Gradio interface onto root FastAPI app under /status
    app = gr.mount_gradio_app(fastapi_app, demo, path="/status")

    # 8. Launch Gradio server loop to keep container running 24/7 without port conflict
    demo.launch()
else:
    app = fastapi_app
