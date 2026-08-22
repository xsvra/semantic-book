import math
from typing import Optional
from fastapi import APIRouter, Query
from app.models.schemas import RecommendationResponse
from app.services.book_repository import book_repo

router = APIRouter(prefix="/recommend", tags=["Recommend"])

@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None)
):
    items, total = book_repo.get_books(
        page=page,
        limit=limit,
        category=category,
        sort_by="rating",
        order="desc"
    )
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    return RecommendationResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )
