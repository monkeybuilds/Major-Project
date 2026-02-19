import requests
import time

API_URL = "http://localhost:8000"

def test_crawl():
    # Login first
    login_payload = {"username": "user@example.com", "password": "password123"}
    # Wait, the auth endpoint needs OAuth2 form data usually, or JSON?
    # backend/routes/auth.py uses LoginRequest(BaseModel) -> JSON body.
    # Payload: email, password.
    
    # Actually, I can use the existing token if I knew it. 
    # Or just use the 'test_login.py' logic if I had one.
    # I'll try to login with the user created in Phase 1.
    
    session = requests.Session()
    try:
        # Login
        resp = session.post(f"{API_URL}/auth/login", json={"email": "savita@example.com", "password": "password123"})
        if resp.status_code != 200:
            print(f"Login failed: {resp.text}")
            # Try sign up if login fails
            resp = session.post(f"{API_URL}/auth/signup", json={"full_name": "Test User", "email": "testcrawler@example.com", "password": "password123"})
            if resp.status_code == 201:
                print("Signed up new user")
                token = resp.json()["access_token"]
            else:
                # Try login with testcrawler
                resp = session.post(f"{API_URL}/auth/login", json={"email": "testcrawler@example.com", "password": "password123"})
                if resp.status_code == 200:
                   token = resp.json()["access_token"]
                else:
                   print("Could not get token")
                   return
        else:
            token = resp.json()["access_token"]
            
        headers = {"Authorization": f"Bearer {token}"}
        
        # Crawl
        print("Sending crawl request...")
        crawl_payload = {"url": "https://example.com"}
        resp = session.post(f"{API_URL}/documents/crawl", json=crawl_payload, headers=headers)
        
        if resp.status_code == 201:
            print("Crawl Success!")
            doc = resp.json()
            print(f"ID: {doc['id']}")
            print(f"Title: {doc.get('original_name')}")
            print(f"Status: {doc['status']}")
            
            with open("crawl_result.txt", "w") as f:
                f.write("CRAWL SUCCESS\n")
                f.write(str(doc))
        else:
            print(f"Crawl Failed: {resp.status_code} {resp.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_crawl()
