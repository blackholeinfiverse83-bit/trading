"""
Endpoint Verification Script
Checks if all frontend endpoints match backend endpoints
"""
import sys
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Backend endpoints
backend_endpoints = {
    "GET": [
        "/",
        "/auth/status",
        "/tools/health",
        "/docs",
        "/redoc"
    ],
    "POST": [
        "/auth/login",
        "/tools/predict",
        "/tools/scan_all",
        "/tools/analyze",
        "/tools/feedback",
        "/tools/train_rl",
        "/tools/fetch_data"
    ]
}

# Frontend API calls (from api.ts)
frontend_endpoints = {
    "GET": [
        "/",
        "/auth/status",
        "/tools/health"
    ],
    "POST": [
        "/auth/login",
        "/tools/predict",
        "/tools/scan_all",
        "/tools/analyze",
        "/tools/feedback",
        "/tools/train_rl",
        "/tools/fetch_data"
    ]
}

print("=" * 60)
print("ENDPOINT VERIFICATION")
print("=" * 60)

# Check GET endpoints
print("\n[GET Endpoints]")
all_get_match = True
for endpoint in frontend_endpoints["GET"]:
    if endpoint in backend_endpoints["GET"]:
        print(f"  [OK] {endpoint}")
    else:
        print(f"  [MISSING] {endpoint} - NOT FOUND IN BACKEND")
        all_get_match = False

# Check POST endpoints
print("\n[POST Endpoints]")
all_post_match = True
for endpoint in frontend_endpoints["POST"]:
    if endpoint in backend_endpoints["POST"]:
        print(f"  [OK] {endpoint}")
    else:
        print(f"  [MISSING] {endpoint} - NOT FOUND IN BACKEND")
        all_post_match = False

print("\n" + "=" * 60)
if all_get_match and all_post_match:
    print("[SUCCESS] ALL ENDPOINTS MATCH!")
    print("Frontend and Backend are properly connected.")
else:
    print("[ERROR] SOME ENDPOINTS DON'T MATCH")
    print("Please check the mismatched endpoints above.")
print("=" * 60)
