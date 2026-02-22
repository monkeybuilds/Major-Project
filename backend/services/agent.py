from duckduckgo_search import DDGS
from services.crawler import scrape_url

from config import LLM_MODEL_NAME

class ResearchAgent:
    def __init__(self):
        self.ddgs = DDGS()

    def research(self, query: str, model_provider: str = "gemini") -> dict:
        """
        Perform deep research on a query:
        1. Search web for top results
        2. Scrape content from top 3 URLs
        3. Synthesize answer using LLM
        """
        # 1. Search
        try:
            results = self.ddgs.text(query, max_results=3)
        except Exception:
            # Fallback if rate limited or error
            return {"answer": "I couldn't search the web right now. Please try again later.", "sources": []}

        if not results:
             return {"answer": "No search results found.", "sources": []}

        # 2. Scrape & Accumulate Context
        context_parts = []
        sources = []
        
        for r in results:
            url = r["href"]
            title = r["title"]
            try:
                # Use existing crawler service, but with shorter timeout to be fast
                scraped = scrape_url(url)
                text = scraped["text"][:3000] # Limit context per page
                
                context_parts.append(f"Title: {title}\nURL: {url}\nContent:\n{text}\n")
                sources.append({"title": title, "url": url})
            except Exception:
                continue

        if not context_parts:
             return {"answer": "I found search results but couldn't read the content of the websites.", "sources": []}

        combined_context = "\n---\n".join(context_parts)

        # 3. Synthesize
        prompt = f"""You are a Deep Internet Research Agent. Answer the user's question based on the web search results below.
You must be comprehensive, detailed, and write in a professional yet engaging tone.
If the results don't fully answer the question, say so clearly.

CITE YOUR SOURCES in the text using inline markers like [Source Title] or [1].
Format your response using beautiful markdown (headings, bullet points, bolding).

Web Search Results Context:
{combined_context}

Question: {query}

Answer:"""

        from services.llm_factory import get_llm
        llm = get_llm(model_provider=model_provider) 
        response = llm.invoke(prompt)
        
        # Ensure sources are unique and formatted correctly for the UI
        unique_sources = []
        seen_urls = set()
        for src in sources:
            if src['url'] not in seen_urls:
                seen_urls.add(src['url'])
                unique_sources.append(src)
                
        return {
            "answer": response.content,
            "sources": unique_sources
        }
