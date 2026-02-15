from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from models.document import Document
from models.user import User
from auth.dependencies import get_current_user
from utils.file_handler import save_upload_file, delete_upload_file
from services.pdf_extractor import extract_text_from_pdf, get_page_count
from services.chunking import chunk_text
from services.embeddings import generate_embeddings
from services.vector_store import store_vectors, delete_vectors

router = APIRouter(prefix="/documents", tags=["Documents"])


# ---------- Schemas ----------

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    upload_date: str
    page_count: int
    chunk_count: int
    status: str


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int


# ---------- Routes ----------

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF document, process it (extract, chunk, embed, store)."""
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported",
        )

    # Read and save file
    file_bytes = await file.read()
    unique_name, full_path = save_upload_file(file_bytes, file.filename)

    # Create document record
    doc = Document(
        user_id=current_user.id,
        filename=unique_name,
        original_name=file.filename,
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:
        # Extract text
        pages = extract_text_from_pdf(full_path)
        page_count = get_page_count(full_path)

        # Chunk text
        chunks = chunk_text(pages)

        # Generate embeddings
        texts = [c["text"] for c in chunks]
        embeddings = generate_embeddings(texts)

        # Store vectors
        store_vectors(doc.id, embeddings, chunks)

        # Update document record
        doc.page_count = page_count
        doc.chunk_count = len(chunks)
        doc.status = "ready"
        db.commit()
        db.refresh(doc)

    except Exception as e:
        doc.status = "error"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}",
        )

    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        original_name=doc.original_name,
        upload_date=str(doc.upload_date),
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        status=doc.status,
    )


@router.get("/", response_model=DocumentListResponse)
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents for the current user."""
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()
    return DocumentListResponse(
        documents=[
            DocumentResponse(
                id=d.id,
                filename=d.filename,
                original_name=d.original_name,
                upload_date=str(d.upload_date),
                page_count=d.page_count,
                chunk_count=d.chunk_count,
                status=d.status,
            )
            for d in docs
        ],
        total=len(docs),
    )


@router.delete("/{doc_id}", status_code=status.HTTP_200_OK)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document and its associated vectors."""
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id,
    ).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Delete vectors and file
    delete_vectors(doc.id)
    delete_upload_file(doc.filename)

    # Delete DB record
    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully"}
