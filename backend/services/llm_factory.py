from langchain_ollama import ChatOllama
from config import LLM_MODEL_NAME


def get_llm(model_provider: str = "ollama", model_name: str | None = None):
    """
    Factory to get LLM instance.
    For the 100% offline Academic System, this strictly uses local Ollama.
    """
    return ChatOllama(
        model=model_name or LLM_MODEL_NAME,  # e.g., 'phi3' or 'llama3.2'
        temperature=0.3,
    )
