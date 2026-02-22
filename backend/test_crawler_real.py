import requests
import json
import time

def test_crawl():
    url = "http://localhost:8000/documents/crawl"
    payload = {"url": "https://example.com"}
    
    with open("test_result.txt", "w") as f:
        f.write(f"Testing crawl with {payload}...\n")
        try:
            response = requests.post(url, json=payload, timeout=20)
            f.write(f"Status: {response.status_code}\n")
            if response.status_code == 201:
                f.write("Crawl SUCCESS!\n")
                f.write(json.dumps(response.json(), indent=2))
            else:
                f.write("Crawl FAILED!\n")
                f.write(response.text)
        except Exception as e:
            f.write(f"Exception: {e}\n")

if __name__ == "__main__":
    test_crawl()
