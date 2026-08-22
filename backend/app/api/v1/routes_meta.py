from fastapi import APIRouter
from app.models.schemas import CategoryItem, LanguageItem
from app.services.book_repository import book_repo

router = APIRouter(prefix="/meta", tags=["Metadata"])

@router.get("/categories", response_model=list[CategoryItem])
def get_categories():
    return book_repo.get_categories()

@router.get("/languages", response_model=list[LanguageItem])
def get_languages():
    return [
        {"code": "en", "label": "Inggris (English)"},
        {"code": "id", "label": "Indonesia"},
        {"code": "all", "label": "Semua Bahasa"}
    ]
