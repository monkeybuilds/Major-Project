from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import init_db
from routes.auth import router as auth_router
from routes.documents import router as documents_router
from routes.query import router as query_router

app = FastAPI(
    title="Gyan Vault API",
    description="AI-powered document management and intelligent query system",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(query_router)


@app.on_event("startup")
def on_startup():
    """Initialise database tables on startup."""
    init_db()


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "Gyan Vault API",
        "status": "running",
        "docs": "/docs",
    }
