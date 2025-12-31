"""Diagnose why predictions are failing"""
import requests
import json

# Login
print("1. Testing authentication...")
login_response = requests.post('http://127.0.0.1:8000/auth/login', 
                              json={'username': 'admin', 'password': 'admin123'})
if login_response.status_code == 200:
    token = login_response.json().get('token')
    print(f"   [OK] Login successful")
else:
    print(f"   [ERROR] Login failed: {login_response.status_code}")
    exit(1)

headers = {'Authorization': f'Bearer {token}'}

# Check health
print("\n2. Checking backend health...")
health_response = requests.get('http://127.0.0.1:8000/tools/health', headers=headers)
if health_response.status_code == 200:
    health = health_response.json()
    print(f"   Status: {health.get('status')}")
    print(f"   MCP Adapter: {health.get('mcp_adapter', {}).get('status')}")
    print(f"   Models Available: {health.get('models', {}).get('total_trained', 0)}")
else:
    print(f"   ✗ Health check failed: {health_response.status_code}")

# Test predict
print("\n3. Testing predict endpoint...")
predict_response = requests.post('http://127.0.0.1:8000/tools/predict',
                                 json={'symbols': ['AAPL'], 'horizon': 'intraday'},
                                 headers=headers,
                                 timeout=180)
if predict_response.status_code == 200:
    predict_data = predict_response.json()
    predictions = predict_data.get('predictions', [])
    print(f"   Predictions returned: {len(predictions)}")
    if predictions:
        pred = predictions[0]
        if 'error' in pred:
            print(f"   [ERROR] Prediction has error: {pred.get('error')}")
        else:
            print(f"   [OK] Prediction successful: {pred.get('symbol')} - {pred.get('action')}")
            print(f"     Confidence: {pred.get('confidence', 0):.4f}")
    else:
        print(f"   [ERROR] No predictions returned")
else:
    print(f"   [ERROR] Predict failed: {predict_response.status_code}")
    print(f"   Response: {predict_response.text[:200]}")

# Test scan_all
print("\n4. Testing scan_all endpoint...")
scan_response = requests.post('http://127.0.0.1:8000/tools/scan_all',
                              json={'symbols': ['AAPL'], 'horizon': 'intraday', 'min_confidence': 0.3},
                              headers=headers,
                              timeout=180)
if scan_response.status_code == 200:
    scan_data = scan_response.json()
    metadata = scan_data.get('metadata', {})
    print(f"   Total scanned: {metadata.get('total_scanned', 0)}")
    print(f"   Predictions generated: {metadata.get('predictions_generated', 0)}")
    print(f"   Shortlist count: {metadata.get('shortlist_count', 0)}")
    
    all_predictions = scan_data.get('all_predictions', [])
    if all_predictions:
        pred = all_predictions[0]
        if 'error' in pred:
            print(f"   [ERROR] First prediction has error: {pred.get('error')}")
        else:
            print(f"   [OK] First prediction OK: {pred.get('symbol')}")
    else:
        print(f"   [ERROR] No predictions in all_predictions")
else:
    print(f"   [ERROR] Scan failed: {scan_response.status_code}")

print("\n" + "="*60)
print("DIAGNOSIS COMPLETE")
print("="*60)

