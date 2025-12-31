"""Quick test to verify server is running"""
import urllib.request
import json

try:
    response = urllib.request.urlopen('http://127.0.0.1:8000/', timeout=5)
    data = json.loads(response.read().decode())
    
    print("=" * 60)
    print("[OK] BACKEND SERVER IS RUNNING")
    print("=" * 60)
    print(f"API: {data['name']}")
    print(f"Version: {data['version']}")
    print(f"Auth Status: {data['auth_status']}")
    print(f"Rate Limits: {data['rate_limits']['per_minute']}/min, {data['rate_limits']['per_hour']}/hour")
    print(f"\nDocumentation:")
    print(f"   Swagger UI: http://127.0.0.1:8000/docs")
    print(f"   ReDoc: http://127.0.0.1:8000/redoc")
    print("=" * 60)
    
except Exception as e:
    print(f"[ERROR] Server not responding: {e}")

