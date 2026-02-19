from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func
from pydantic import BaseModel
from database.connection import get_db
from models.document import Document
from models.chat import ChatSession, ChatMessage
from models.user import User
from auth.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ---------- Schemas ----------

class StatsResponse(BaseModel):
    total_documents: int
    ready_documents: int
    total_pages: int
    total_chunks: int
    total_queries: int
    total_chat_sessions: int


class ActivityItem(BaseModel):
    type: str  # "upload" or "query"
    title: str
    date: str


class ActivityResponse(BaseModel):
    recent_activity: list[ActivityItem]


# ---------- Routes ----------

@router.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregated stats for the current user."""
    docs = db.query(Document).filter(Document.user_id == current_user.id).all()
    total_docs = len(docs)
    ready_docs = len([d for d in docs if d.status == "ready"])
    total_pages = sum(d.page_count for d in docs)
    total_chunks = sum(d.chunk_count for d in docs)

    total_queries = db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatMessage.role == "user",
    ).count()

    total_sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).count()

    return StatsResponse(
        total_documents=total_docs,
        ready_documents=ready_docs,
        total_pages=total_pages,
        total_chunks=total_chunks,
        total_queries=total_queries,
        total_chat_sessions=total_sessions,
    )


@router.get("/activity", response_model=ActivityResponse)
def get_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent activity (uploads and queries)."""
    activity = []

    # Recent uploads
    recent_docs = db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.upload_date.desc()).limit(10).all()

    for doc in recent_docs:
        activity.append(ActivityItem(
            type="upload",
            title=f"Uploaded {doc.original_name}",
            date=str(doc.upload_date),
        ))

    # Recent queries
    recent_queries = db.query(ChatMessage).join(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatMessage.role == "user",
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()

    for msg in recent_queries:
        activity.append(ActivityItem(
            type="query",
            title=f"Asked: {msg.content[:60]}..." if len(msg.content) > 60 else f"Asked: {msg.content}",
            date=str(msg.created_at),
        ))

    # Sort by date descending
    activity.sort(key=lambda x: x.date, reverse=True)
    return ActivityResponse(recent_activity=activity[:15])
