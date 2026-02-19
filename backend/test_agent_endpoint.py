import requests
import json

URL = "http://localhost:8000/agent/research"

payload = {
    "query": "What is the latest version of React?"
}

try:
    print(f"Testing Agent Research: {URL}")
    response = requests.post(URL, json=payload, timeout=60) # Longer timeout for agent
    
    if response.status_code == 200:
        data = response.json()
        print("Agent Success!")
        print("Answer:", data.get("answer"))
        print("Sources:", len(data.get("sources", [])))
        for s in data.get("sources", []):
            print(f"- {s['title']} ({s['url']})")
    else:
        print(f"Agent Failed: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Error: {e}")
