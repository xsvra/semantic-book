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

# 2. Import app subpackage modules cleanly using importlib to prevent app.py name collision
main_module = importlib.import_module("app.main")
fastapi_app = main_module.app

repo_module = importlib.import_module("app.services.book_repository")
book_repo = repo_module.book_repo

model_module = importlib.import_module("app.ml.model_loader")
model_loader = model_module.model_loader

recommend_module = importlib.import_module("app.services.recommend_service")
recommend_service = recommend_module.recommend_service

validator_module = importlib.import_module("app.utils.query_validator")
validate_search_query = validator_module.validate_search_query

# 3. Top-level ZeroGPU decorated function for HF ZeroGPU static AST analyzer
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

# 4. Create Gradio Blocks interface
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

# 5. Mount Gradio interface onto root FastAPI app under /
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

# 6. Launch Uvicorn server loop on port 7860 to keep Hugging Face Space running 24/7
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
