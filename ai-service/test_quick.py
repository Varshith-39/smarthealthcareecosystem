import httpx
import json

def test():
    client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=120.0)
    
    # 1. Health
    r = client.get("/health")
    print("Health:", r.status_code, r.json().get("status"), r.json().get("model"))
    
    # 2. Chat
    payload = {
        "message": "Explain what blood pressure means in simple terms.",
        "language": "English",
        "simple_language": True
    }
    r = client.post("/api/chat", json=payload)
    print("Chat status:", r.status_code)
    data = r.json()
    reply = data.get("reply", "")
    safe_reply = reply.encode("ascii", errors="replace").decode("ascii")
    print("Reply preview:", safe_reply[:250])
    print("Model used:", data.get("model_used"))

if __name__ == "__main__":
    test()
