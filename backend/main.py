from contextlib import asynccontextmanager



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import init_db
from routes.auth import router as auth_router
from routes.documents import router as documents_router
from routes.query import router as query_router
from routes.chat import router as chat_router
from routes.analytics import router as analytics_router
from routes.agent import router as agent_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise database tables on startup."""
    init_db()
    yield


app = FastAPI(
    title="Gyan Vault API",
    description="AI-powered document management and intelligent query system with chat history, summarization, and multi-format support",
    version="2.0.0",
    lifespan=lifespan,
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
app.include_router(chat_router)
app.include_router(analytics_router)
app.include_router(agent_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "Gyan Vault API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
