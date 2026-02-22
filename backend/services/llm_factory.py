from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from config import GOOGLE_API_KEY, LLM_MODEL_NAME
import os

def get_llm(model_provider: str = "gemini", model_name: str | None = None):
    """
    Factory to get LLM instance based on provider.
    Providers: 'gemini', 'openai', 'anthropic'
    """
    if model_provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not set in environment.")
        return ChatOpenAI(
            model=model_name or "gpt-4o",
            api_key=api_key,
            temperature=0.3
        )
    
    elif model_provider == "anthropic":
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set in environment.")
        return ChatAnthropic(
            model=model_name or "claude-3-5-sonnet-20240620",
            api_key=api_key,
            temperature=0.3
        )
    
    
    elif model_provider == "ollama":
        from langchain_ollama import ChatOllama
        # Default to llama3 if not specified, but user should ideally have it installed
        return ChatOllama(
            model=model_name or "llama3",
            temperature=0.3,
            base_url="http://localhost:11434" 
        )

    else:
        # Default Gemini
        if not GOOGLE_API_KEY:
             raise ValueError("GOOGLE_API_KEY not set.")
        return ChatGoogleGenerativeAI(
            model=model_name or LLM_MODEL_NAME,
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3,
        )
