import sys
with open("diagnose_agent.txt", "w") as f:
    f.write("Starting Agent Diagnosis\n")

def log(msg):
    try:
        with open("diagnose_agent.txt", "a") as f:
            f.write(msg + "\n")
    except:
        pass

try:
    log("Importing duckduckgo_search...")
    from duckduckgo_search import DDGS
    log("DDGS OK")
except Exception as e:
    log(f"DDGS FAIL: {e}")

try:
    log("Importing crawler...")
    from services.crawler import scrape_url
    log("Crawler OK")
except Exception as e:
    log(f"Crawler FAIL: {e}")

try:
    log("Importing query_engine...")
    from services.query_engine import _get_llm
    log("Query Engine OK")
except Exception as e:
    log(f"Query Engine FAIL: {e}")
