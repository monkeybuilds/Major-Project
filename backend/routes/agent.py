from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.agent import ResearchAgent

router = APIRouter(prefix="/agent", tags=["Agent"])

class ResearchRequest(BaseModel):
    query: str

@router.post("/research")
def research(request: ResearchRequest):
    """
    Perform deep research using web search and scraping.
    """
    try:
        agent = ResearchAgent()
        result = agent.research(request.query)
        if not result["sources"] and "answer" in result:
             # If no sources found but answer exists (error message), might want to return 200 with that answer
             pass
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
