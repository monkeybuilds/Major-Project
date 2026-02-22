import requests
import json
from langchain_ollama import ChatOllama

def check_ollama():
    print("Checking Ollama Status...")
    try:
        # 1. Check if running
        response = requests.get("http://localhost:11434/")
        if response.status_code == 200:
            print("✅ Ollama Service is RUNNING")
        else:
            print(f"❌ Ollama Service responded with {response.status_code}")
            return

        # 2. Check installed models
        print("\nChecking installed models...")
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = response.json().get("models", [])
            if models:
                print(f"✅ Found {len(models)} models:")
                for m in models:
                    print(f"   - {m['name']}")
            else:
                print("⚠️ No models found. You need to run 'ollama run llama3' in your terminal.")
        
        # 3. Test LangChain Integration if model exists
        if models:
            model_name = models[0]['name']
            print(f"\nTesting LangChain integration with '{model_name}'...")
            llm = ChatOllama(model=model_name, temperature=0)
            try:
                msg = llm.invoke("Say 'Hello from Local AI!'")
                print(f"✅ Model Response: {msg.content}")
            except Exception as e:
                print(f"❌ LangChain Verification Failed: {e}")

    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        print("Is Ollama running? Try running 'ollama serve' or opening the Ollama app.")

if __name__ == "__main__":
    check_ollama()
