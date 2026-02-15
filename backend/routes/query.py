from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from models.document import Document
from models.user import User
from auth.dependencies import get_current_user
from services.query_engine import ask_question

router = APIRouter(prefix="/query", tags=["Query"])


# ---------- Schemas ----------

class QueryRequest(BaseModel):
    question: str
    doc_ids: list[int] | None = None  # None means search all user docs


class SourceInfo(BaseModel):
    doc_id: int
    page_number: int
    text_preview: str
    relevance_score: float


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceInfo]


# ---------- Routes ----------

@router.post("/ask", response_model=QueryResponse)
def ask(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ask a question and get an AI-generated answer from your documents."""
    if not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty",
        )

    # Get relevant document IDs
    if payload.doc_ids:
        # Verify user owns these docs
        docs = db.query(Document).filter(
            Document.id.in_(payload.doc_ids),
            Document.user_id == current_user.id,
            Document.status == "ready",
        ).all()
        doc_ids = [d.id for d in docs]
    else:
        # Search all user's ready documents
        docs = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.status == "ready",
        ).all()
        doc_ids = [d.id for d in docs]

    if not doc_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No processed documents found. Please upload a document first.",
        )

    # Run RAG pipeline
    result = ask_question(payload.question, doc_ids)

    return QueryResponse(
        answer=result["answer"],
        sources=[SourceInfo(**s) for s in result["sources"]],
    )
