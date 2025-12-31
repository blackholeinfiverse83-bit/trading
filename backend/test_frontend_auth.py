"""Test if frontend authentication is working"""
import requests
import json

print("="*60)
print("FRONTEND AUTHENTICATION TEST")
print("="*60)

# Test 1: Check if login works
print("\n1. Testing Login...")
try:
    login_response = requests.post('http://127.0.0.1:8000/auth/login', 
                                   json={'username': 'admin', 'password': 'admin123'})
    if login_response.status_code == 200:
        login_data = login_response.json()
        token = login_data.get('token')
        print(f"   [OK] Login successful")
        print(f"   Token: {token[:50]}..." if token else "   [ERROR] No token received")
    else:
        print(f"   [ERROR] Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        exit(1)
except Exception as e:
    print(f"   [ERROR] Login exception: {e}")
    exit(1)

# Test 2: Test scan_all WITHOUT token (should fail)
print("\n2. Testing scan_all WITHOUT token (should fail)...")
try:
    scan_response = requests.post('http://127.0.0.1:8000/tools/scan_all',
                                 json={'symbols': ['AAPL'], 'horizon': 'intraday', 'min_confidence': 0.3},
                                 timeout=10)
    if scan_response.status_code == 401:
        print(f"   [OK] Correctly rejected (401 Unauthorized)")
    else:
        print(f"   [WARNING] Unexpected status: {scan_response.status_code}")
        print(f"   Response: {scan_response.text[:200]}")
except Exception as e:
    print(f"   [ERROR] Exception: {e}")

# Test 3: Test scan_all WITH token (should work)
print("\n3. Testing scan_all WITH token...")
try:
    headers = {'Authorization': f'Bearer {token}'}
    scan_response = requests.post('http://127.0.0.1:8000/tools/scan_all',
                                 json={'symbols': ['AAPL'], 'horizon': 'intraday', 'min_confidence': 0.3},
                                 headers=headers,
                                 timeout=180)
    if scan_response.status_code == 200:
        scan_data = scan_response.json()
        metadata = scan_data.get('metadata', {})
        print(f"   [OK] Request successful (200)")
        print(f"   Predictions generated: {metadata.get('predictions_generated', 0)}")
        print(f"   Shortlist count: {metadata.get('shortlist_count', 0)}")
        
        if metadata.get('predictions_generated', 0) == 0:
            all_predictions = scan_data.get('all_predictions', [])
            if all_predictions:
                first_pred = all_predictions[0]
                if 'error' in first_pred:
                    print(f"   [INFO] First prediction has error: {first_pred.get('error')}")
                else:
                    print(f"   [OK] First prediction OK: {first_pred.get('symbol')}")
            else:
                print(f"   [INFO] No predictions in response (models may need training)")
    else:
        print(f"   [ERROR] Request failed: {scan_response.status_code}")
        print(f"   Response: {scan_response.text[:300]}")
except Exception as e:
    print(f"   [ERROR] Exception: {e}")

# Test 4: Test predict WITHOUT token (should work - no auth required)
print("\n4. Testing predict WITHOUT token (should work)...")
try:
    predict_response = requests.post('http://127.0.0.1:8000/tools/predict',
                                    json={'symbols': ['AAPL'], 'horizon': 'intraday'},
                                    timeout=180)
    if predict_response.status_code == 200:
        predict_data = predict_response.json()
        predictions = predict_data.get('predictions', [])
        print(f"   [OK] Request successful (200)")
        print(f"   Predictions count: {len(predictions)}")
        if predictions:
            first_pred = predictions[0]
            if 'error' in first_pred:
                print(f"   [INFO] First prediction has error: {first_pred.get('error')}")
            else:
                print(f"   [OK] First prediction OK: {first_pred.get('symbol')}")
    else:
        print(f"   [ERROR] Request failed: {predict_response.status_code}")
        print(f"   Response: {predict_response.text[:300]}")
except Exception as e:
    print(f"   [ERROR] Exception: {e}")

print("\n" + "="*60)
print("TEST COMPLETE")
print("="*60)
print("\nRECOMMENDATION:")
print("If scan_all requires auth but predict works without auth,")
print("the frontend should use /tools/predict instead of /tools/scan_all")
print("for the dashboard, OR ensure user is logged in first.")



