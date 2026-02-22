from services.embeddings import generate_single_embedding
from services.search import HybridRetriever
from services.llm_factory import get_llm
from config import GOOGLE_API_KEY, LLM_MODEL_NAME

_retriever = HybridRetriever()


def ask_question(question: str, doc_ids: list[int], chat_history: list[dict] | None = None, model_provider: str = "gemini") -> dict:
    """
    RAG pipeline with follow-up support:
    1. Retrieve relevant chunks using Hybrid Search (Vector + BM25)
    2. Include chat history for follow-up context
    3. Feed to Gemini LLM
    4. Return answer with sources
    """
    results = _retriever.search(question, doc_ids, top_k=5)

    if not results:
        return {
            "answer": "I couldn't find any relevant information in your documents. Please upload documents first or try a different question.",
            "sources": [],
        }

    # Build context from retrieved chunks
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

    # Build chat history string for follow-up context
    history_str = ""
    if chat_history:
        history_parts = []
        for msg in chat_history[-6:]:  # Last 6 messages (3 exchanges)
            role = "User" if msg["role"] == "user" else "Assistant"
            history_parts.append(f"{role}: {msg['content']}")
        history_str = "\n".join(history_parts)

    prompt = f"""You are Gyan Vault, an AI assistant that answers questions based on document context.
Answer the user's question accurately using ONLY the information from the context below.
If the context does not contain enough information, say so clearly.
Always reference which source/page the information came from.

Context from documents:
{context}
"""

    if history_str:
        prompt += f"""
Previous conversation (for follow-up context):
{history_str}
"""

    prompt += f"""
Question: {question}

Answer:"""


    llm = get_llm(model_provider=model_provider)
    response = llm.invoke(prompt)

    return {
        "answer": response.content,
        "sources": sources,
    }
