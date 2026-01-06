#!/usr/bin/env python3
"""
Endpoint Verification Script
Verifies all backend endpoints are working correctly and returning fresh data
"""

import requests
import json
from datetime import datetime
import time

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, method, endpoint, payload=None):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"Method: {method} {endpoint}")
    if payload:
        print(f"Payload: {json.dumps(payload, indent=2)}")
    print('='*60)
    
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=30)
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", json=payload, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds():.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ SUCCESS - Endpoint is working")
            print(f"Response Preview: {json.dumps(data, indent=2)[:500]}...")
            return True
        else:
            print(f"✗ FAILED - Status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except requests.exceptions.Timeout:
        print("✗ FAILED - Request timeout")
        return False
    except Exception as e:
        print(f"✗ FAILED - {str(e)}")
        return False

def main():
    """Run all endpoint tests"""
    print("\n" + "="*60)
    print("MULTI-ASSET TRADING DASHBOARD - ENDPOINT VERIFICATION")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Backend URL: {BASE_URL}")
    
    results = []
    
    # Test 1: Health Check
    results.append(("Health Check", test_endpoint(
        "Health Check",
        "GET",
        "/tools/health"
    )))
    
    # Test 2: API Info
    results.append(("API Info", test_endpoint(
        "API Information",
        "GET",
        "/"
    )))
    
    # Test 3: Rate Limit Status
    results.append(("Rate Limit Status", test_endpoint(
        "Rate Limit Status",
        "GET",
        "/auth/status"
    )))
    
    # Test 4: Predict Endpoint with AAPL
    results.append(("Predict AAPL", test_endpoint(
        "Predict Endpoint (AAPL)",
        "POST",
        "/tools/predict",
        {
            "symbols": ["AAPL"],
            "horizon": "intraday"
        }
    )))
    
    time.sleep(2)
    
    # Test 5: Predict Multiple Symbols
    results.append(("Predict Multiple", test_endpoint(
        "Predict Multiple Symbols",
        "POST",
        "/tools/predict",
        {
            "symbols": ["AAPL", "GOOGL", "MSFT"],
            "horizon": "intraday"
        }
    )))
    
    time.sleep(2)
    
    # Test 6: Scan All Endpoint
    results.append(("Scan All", test_endpoint(
        "Scan All Stocks",
        "POST",
        "/tools/scan_all",
        {
            "symbols": ["AAPL", "GOOGL"],
            "horizon": "intraday",
            "min_confidence": 0.3
        }
    )))
    
    time.sleep(2)
    
    # Test 7: Analyze Endpoint
    results.append(("Analyze", test_endpoint(
        "Analyze with Risk Parameters",
        "POST",
        "/tools/analyze",
        {
            "symbols": ["AAPL"],
            "horizon": "intraday",
            "stop_loss_pct": 2.0,
            "capital_risk_pct": 1.0
        }
    )))
    
    time.sleep(2)
    
    # Test 8: Fetch Data Endpoint
    results.append(("Fetch Data", test_endpoint(
        "Fetch Batch Data",
        "POST",
        "/tools/fetch_data",
        {
            "symbols": ["AAPL", "GOOGL"],
            "horizon": "intraday"
        }
    )))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL ENDPOINTS WORKING PERFECTLY!")
    else:
        print(f"\n⚠️  {total - passed} endpoint(s) need attention")
    
    print("\nVerification completed at:", datetime.now().isoformat())

if __name__ == "__main__":
    main()
