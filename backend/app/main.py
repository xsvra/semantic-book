from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services.book_repository import book_repo
from app.ml.model_loader import model_loader

from app.api.v1.routes_books import router as books_router
from app.api.v1.routes_recommend import router as recommend_router
from app.api.v1.routes_search import router as search_router
from app.api.v1.routes_meta import router as meta_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up FastAPI application...")
    # Pre-load repository & models if not already loaded
    if not book_repo.books:
        book_repo.load_data()
    if not model_loader.bi_encoder:
        model_loader.load_all()
    yield
    print("Shutting down application...")


app = FastAPI(
    title=settings.APP_NAME,
    description="REST API Serving untuk Sistem Rekomendasi Buku Non-Fiksi berbasis Sentence-BERT (Bi-Encoder) & Cross-Encoder",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(books_router, prefix="/api/v1")
app.include_router(recommend_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")
app.include_router(meta_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
