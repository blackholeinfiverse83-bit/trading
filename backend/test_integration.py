#!/usr/bin/env python3
"""
Backend Integration Test Script
Tests the API endpoints to ensure they work correctly with the frontend
"""

import requests
import json
import sys
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(method: str, endpoint: str, data: Dict[Any, Any] = None, headers: Dict[str, str] = None) -> Dict[str, Any]:
    """Test an API endpoint and return the result"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        else:
            return {"success": False, "error": f"Unsupported method: {method}"}
        
        return {
            "success": response.status_code < 400,
            "status_code": response.status_code,
            "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        }
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Connection refused - backend not running"}
    except requests.exceptions.Timeout:
        return {"success": False, "error": "Request timeout"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    print("=" * 60)
    print("Backend Integration Test")
    print("=" * 60)
    
    # Test 1: Check if backend is running
    print("\\n1. Testing backend connection...")
    result = test_endpoint("GET", "/")
    if not result["success"]:
        print(f"❌ Backend not accessible: {result.get('error', 'Unknown error')}")
        print("\\nPlease start the backend server first:")
        print("  cd backend")
        print("  python api_server.py")
        sys.exit(1)
    
    print("✅ Backend is running")
    auth_status = result["data"].get("auth_status", "unknown")
    print(f"   Authentication: {auth_status}")
    
    # Test 2: Check health endpoint
    print("\\n2. Testing health endpoint...")
    result = test_endpoint("GET", "/tools/health")
    if result["success"]:
        print("✅ Health endpoint working")
    else:
        print(f"❌ Health endpoint failed: {result.get('error', 'Unknown error')}")
    
    # Test 3: Test authentication (if enabled)
    token = None
    if auth_status == "enabled":
        print("\\n3. Testing authentication...")
        login_data = {"username": "admin", "password": "admin123"}
        result = test_endpoint("POST", "/auth/login", login_data)
        if result["success"] and result["data"].get("success"):
            token = result["data"].get("token")
            print("✅ Authentication working")
            print(f"   Token: {token[:20]}..." if token else "   No token received")
        else:
            print(f"❌ Authentication failed: {result.get('error', 'Unknown error')}")
            print("   Check admin credentials in backend/.env")
    else:
        print("\\n3. Authentication disabled - skipping login test")
    
    # Test 4: Test prediction endpoint
    print("\\n4. Testing prediction endpoint...")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    predict_data = {
        "symbols": ["AAPL"],
        "horizon": "intraday"
    }
    result = test_endpoint("POST", "/tools/predict", predict_data, headers)
    if result["success"]:
        print("✅ Prediction endpoint working")
        predictions = result["data"].get("predictions", [])
        print(f"   Received {len(predictions)} predictions")
    else:
        print(f"❌ Prediction endpoint failed: {result.get('error', 'Unknown error')}")
        if result.get("status_code") == 401:
            print("   Authentication required - check frontend login")
    
    # Test 5: Test rate limiting status
    print("\\n5. Testing rate limit status...")
    result = test_endpoint("GET", "/auth/status")
    if result["success"]:
        print("✅ Rate limit status working")
        rate_info = result["data"]
        print(f"   Requests remaining: {rate_info.get('requests_remaining', 'N/A')}")
    else:
        print(f"❌ Rate limit status failed: {result.get('error', 'Unknown error')}")
    
    print("\\n" + "=" * 60)
    print("Integration test completed!")
    print("\\nIf all tests passed, your backend is ready for frontend integration.")
    print("\\nFrontend configuration:")
    print("  - API URL: http://127.0.0.1:8000")
    print(f"  - Authentication: {'Required' if auth_status == 'enabled' else 'Disabled'}")
    if auth_status == "enabled":
        print("  - Login: admin / admin123")
    print("=" * 60)

if __name__ == "__main__":
    main()