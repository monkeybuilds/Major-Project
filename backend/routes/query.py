import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from models.document import Document
from models.chat import ChatSession, ChatMessage
from models.user import User
from auth.dependencies import get_current_user
from services.query_engine import ask_question

router = APIRouter(prefix="/query", tags=["Query"])


# ---------- Schemas ----------

class QueryRequest(BaseModel):
    question: str
    doc_ids: list[int]
    session_id: int | None = None
    model_provider: str = "gemini"  # For follow-up questions


class SourceInfo(BaseModel):
    doc_id: int
    page_number: int
    text_preview: str
    relevance_score: float


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceInfo]
    session_id: int


# ---------- Routes ----------

@router.post("/ask", response_model=QueryResponse)
def ask(
    payload: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ask a question with optional chat history context for follow-ups."""
    if not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty",
        )

    # Get or create chat session
    if payload.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == payload.session_id,
            ChatSession.user_id == current_user.id,
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        # Auto-create new session with the question as title
        title = payload.question[:80] + "..." if len(payload.question) > 80 else payload.question
        session = ChatSession(user_id=current_user.id, title=title)
        db.add(session)
        db.commit()
        db.refresh(session)

    # Get previous messages for follow-up context
    chat_history = []
    if payload.session_id:
        prev_messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).order_by(ChatMessage.created_at.asc()).limit(10).all()  # Last 10 messages for context
        for msg in prev_messages:
            chat_history.append({"role": msg.role, "content": msg.content})

    # Get document IDs
    if payload.doc_ids:
        docs = db.query(Document).filter(
            Document.id.in_(payload.doc_ids),
            Document.user_id == current_user.id,
            Document.status == "ready",
        ).all()
        doc_ids = [d.id for d in docs]
    else:
        docs = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.status == "ready",
        ).all()
        doc_ids = [d.id for d in docs]

    if not doc_ids:
        raise HTTPException(
            status_code=404,
            detail="No processed documents found. Please upload a document first.",
        )

    # Run RAG pipeline with chat history
    try:
        result = ask_question(
            payload.question,
            doc_ids,
            chat_history=chat_history,
            model_provider=payload.model_provider
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI query failed: {str(e)}",
        )

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.question,
    )
    db.add(user_msg)

    # Save AI message
    ai_msg = ChatMessage(
        session_id=session.id,
        role="ai",
        content=result["answer"],
        sources_json=json.dumps(result["sources"]),
    )
    db.add(ai_msg)
    db.commit()

    return QueryResponse(
        answer=result["answer"],
        sources=[SourceInfo(**s) for s in result["sources"]],
        session_id=session.id,
    )
