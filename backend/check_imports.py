
try:
    print("Checking llm_factory...")
    from services.llm_factory import get_llm
    print("llm_factory OK")

    print("Checking agent...")
    from services.agent import ResearchAgent
    print("agent OK")

    print("Checking routes...")
    from routes import documents, query, agent
    print("routes OK")

    print("ALL CHECKS PASSED")

except Exception as e:
    print(f"IMPORT ERROR: {e}")
    import traceback
    traceback.print_exc()
