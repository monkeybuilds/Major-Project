import sys
with open("diagnose_llm.txt", "w") as f:
    f.write("Starting LLM Diagnosis\n")

def log(msg):
    try:
        with open("diagnose_llm.txt", "a") as f:
            f.write(msg + "\n")
    except:
        pass

try:
    log("Importing langchain_google_genai...")
    from langchain_google_genai import ChatGoogleGenerativeAI
    log("Google OK")
except Exception as e:
    log(f"Google FAIL: {e}")

try:
    log("Importing langchain_openai...")
    from langchain_openai import ChatOpenAI
    log("OpenAI OK")
except Exception as e:
    log(f"OpenAI FAIL: {e}")

try:
    log("Importing langchain_anthropic...")
    from langchain_anthropic import ChatAnthropic
    log("Anthropic OK")
except Exception as e:
    log(f"Anthropic FAIL: {e}")
