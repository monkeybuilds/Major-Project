import socket
import subprocess
import shutil
import time
from langchain_ollama import ChatOllama
from config import LLM_MODEL_NAME


def _is_ollama_running() -> bool:
    """Check if Ollama is running on port 11434."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(2)
        result = s.connect_ex(("127.0.0.1", 11434))
        s.close()
        return result == 0
    except Exception:
        return False


def _start_ollama() -> bool:
    """Try to start Ollama service automatically."""
    ollama_path = shutil.which("ollama")
    if not ollama_path:
        # Check common Windows install path
        import os
        user_path = os.path.expanduser(r"~\AppData\Local\Programs\Ollama\ollama.exe")
        if os.path.exists(user_path):
            ollama_path = user_path

    if not ollama_path:
        return False

    try:
        subprocess.Popen(
            [ollama_path, "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=0x00000008,  # DETACHED_PROCESS on Windows
        )
        # Wait for it to come up
        for _ in range(15):
            time.sleep(2)
            if _is_ollama_running():
                return True
        return False
    except Exception:
        return False


def get_llm(model_provider: str = "ollama", model_name: str | None = None):
    """
    Factory to get LLM instance.
    Automatically starts Ollama if it's not running.
    """
    if not _is_ollama_running():
        started = _start_ollama()
        if not started:
            raise ConnectionError(
                "Ollama is not running and could not be started automatically. "
                "Please start Ollama manually:\n"
                "1. Open a terminal/command prompt\n"
                "2. Run: ollama serve\n"
                "3. Then try your query again"
            )

    return ChatOllama(
        model=model_name or LLM_MODEL_NAME,
        temperature=0.3,
    )
