from duckduckgo_search import DDGS
from services.crawler import scrape_url

from config import LLM_MODEL_NAME

class ResearchAgent:
    def __init__(self):
        self.ddgs = DDGS()

    def research(self, query: str, model_provider: str = "gemini") -> dict:
        """
        Perform deep research on a query:
        1. Search web for top results (Fallback to direct Wikipedia search if DDGS hangs)
        2. Scrape content
        3. Synthesize answer using LLM
        """
        # 1. Search (with aggressive timeout/fallback due to DDGS hanging issues)
        results = []
        try:
            results = self.ddgs.text(query, max_results=2)
        except Exception:
            pass
            
        if getattr(results, '__iter__', None) is None:
             results = []
             
        # Fallback if DDGS failed to return a list fast enough
        if not results:
            print("DDGS failed or hung, falling back to Wikipedia direct search...")
            try:
                import requests
                # Very simple direct wikipedia query as fallback
                wiki_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={query}&limit=2&namespace=0&format=json"
                res = requests.get(wiki_url, timeout=5).json()
                if len(res) > 3 and res[3]:
                    for i in range(len(res[3])):
                         results.append({"title": res[1][i], "href": res[3][i]})
            except Exception as e:
                print(f"Fallback search failed: {e}")

        # 2. Scrape & Accumulate Context
        context_parts = []
        sources = []
        
        for r in results:
            url = r.get("href")
            title = r.get("title")
            if not url: continue
            
            try:
                # Use existing crawler service, but with shorter timeout to be fast
                scraped = scrape_url(url)
                text = scraped.get("text", "")[:3000] # Limit context per page
                
                context_parts.append(f"Title: {title}\nURL: {url}\nContent:\n{text}\n")
                sources.append({"title": title, "url": url})
            except Exception as e:
                print(f"Failed to scrape {url}: {e}")
                continue

        combined_context = "\n---\n".join(context_parts)
        if not combined_context:
            combined_context = "No direct web context could be retrieved. Answer based on your internal knowledge."

        # 3. Synthesize
        prompt = f"""You are a Deep Internet Research Agent. Answer the user's question.
You must be comprehensive, detailed, and write in a professional yet engaging tone.

If web context is provided, CITE YOUR SOURCES in the text using inline markers like [Source Title] or [1].
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
