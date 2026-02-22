import sys
import os

with open("diagnose_log.txt", "w") as f:
    f.write("Starting diagnosis\n")

def log(msg):
    try:
        with open("diagnose_log.txt", "a") as f:
            f.write(msg + "\n")
    except:
        pass

try:
    log("Importing agent...")
    import services.agent
    log("Agent OK")
except Exception as e:
    log(f"Agent FAIL: {e}")
    import traceback
    with open("diagnose_log.txt", "a") as f:
        traceback.print_exc(file=f)

try:
    log("Importing llm_factory...")
    import services.llm_factory
    log("LLM Factory OK")
except Exception as e:
    log(f"LLM Factory FAIL: {e}")
    import traceback
    with open("diagnose_log.txt", "a") as f:
        traceback.print_exc(file=f)

log("Finished")
