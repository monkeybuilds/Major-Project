from services.embeddings import generate_single_embedding
from services.vector_store import search_all_user_docs
from config import GOOGLE_API_KEY, LLM_MODEL_NAME

# Lazy-loaded LLM
_llm = None


def _get_llm():
    """Get or initialise the Gemini LLM."""
    global _llm
    if _llm is None:
        if not GOOGLE_API_KEY:
            raise RuntimeError(
                "GOOGLE_API_KEY not set. Please set the environment variable to use the query engine."
            )
        from langchain_google_genai import ChatGoogleGenerativeAI
        _llm = ChatGoogleGenerativeAI(
            model=LLM_MODEL_NAME,
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3,
        )
    return _llm


def ask_question(question: str, doc_ids: list[int]) -> dict:
    """
    RAG pipeline:
    1. Embed the question
    2. Retrieve relevant chunks from the user's documents
    3. Feed context + question to Gemini LLM
    4. Return the answer with source references
    """
    # Step 1 — Embed the query
    query_embedding = generate_single_embedding(question)

    # Step 2 — Retrieve relevant chunks
    results = search_all_user_docs(doc_ids, query_embedding, top_k=5)

    if not results:
        return {
            "answer": "I couldn't find any relevant information in your documents. Please upload documents first or try a different question.",
            "sources": [],
        }

    # Step 3 — Build context
    context_parts = []
    sources = []
    for i, r in enumerate(results):
        context_parts.append(f"[Source {i+1}, Page {r['page_number']}]:\n{r['text']}")
        sources.append({
            "doc_id": r["doc_id"],
            "page_number": r["page_number"],
            "text_preview": r["text"][:150] + "..." if len(r["text"]) > 150 else r["text"],
            "relevance_score": round(r["score"], 4),
        })

    context = "\n\n".join(context_parts)

    prompt = f"""You are Gyan Vault, an AI assistant that answers questions based on the provided document context. 
Answer the user's question accurately using ONLY the information from the context below.
If the context does not contain enough information to answer, say so clearly.
Always reference which source/page the information came from.

Context:
{context}

Question: {question}

Answer:"""

    # Step 4 — Get LLM response
    llm = _get_llm()
    response = llm.invoke(prompt)

    return {
        "answer": response.content,
        "sources": sources,
    }
