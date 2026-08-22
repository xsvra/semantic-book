import math
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.models.schemas import SearchRequest, SearchResponse
from app.services.recommend_service import recommend_service
from app.utils.query_validator import validate_search_query

router = APIRouter(prefix="/search", tags=["Search"])

@router.post("", response_model=SearchResponse)
async def search_books(req: SearchRequest):
    is_valid, error_msg = validate_search_query(req.query)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)


    results, total, inference_time, used_reranker, did_you_mean, did_you_mean_book_id, is_exact_match = await run_in_threadpool(
        recommend_service.search_books,
        query=req.query.strip(),
        use_reranker=req.use_reranker or False,
        top_k=req.top_k or 50,
        category=req.category,
        page=req.page or 1,
        limit=req.limit or 10
    )

    total_pages = math.ceil(total / (req.limit or 10)) if (req.limit or 10) > 0 else 0

    return SearchResponse(
        query=req.query,
        results=results,
        total=total,
        page=req.page or 1,
        limit=req.limit or 10,
        total_pages=total_pages,
        inference_time_seconds=inference_time,
        used_reranker=used_reranker,
        did_you_mean=did_you_mean,
        did_you_mean_book_id=did_you_mean_book_id,
        is_exact_match=is_exact_match
    )
