import sys
import os
from dotenv import load_dotenv
load_dotenv()

key = os.getenv("GOOGLE_API_KEY", "")
with open("test_gemini_result.txt", "w") as f:
    f.write(f"Key: {key[:15]}...\n")
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=key, temperature=0.3)
        r = llm.invoke("Say hello in one word")
        f.write(f"SUCCESS: {r.content}\n")
    except Exception as e:
        f.write(f"ERROR: {e}\n")
    f.write("DONE\n")
