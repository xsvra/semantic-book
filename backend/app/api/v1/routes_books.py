import math
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import BookListResponse, BookDetail, BookSummary
from app.services.book_repository import book_repo

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("", response_model=BookListResponse)
def get_books(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None, description="sort by pages or rating"),
    order: str = Query("desc", pattern="^(asc|desc)$")
):
    items, total = book_repo.get_books(
        page=page,
        limit=limit,
        category=category,
        sort_by=sort_by,
        order=order
    )
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    return BookListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/top-rated", response_model=list[BookSummary])
def get_top_rated_books(limit: int = Query(100, ge=1, le=100)):
    return book_repo.get_top_rated(limit=limit)

@router.get("/{book_id}", response_model=BookDetail)
def get_book_detail(book_id: str):
    book = book_repo.get_book_by_id(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
