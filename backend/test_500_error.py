"""Test 500 error"""
import requests
import json
import traceback

print("Testing /tools/predict endpoint...")
try:
    response = requests.post(
        'http://127.0.0.1:8000/tools/predict',
        json={'symbols': ['AAPL'], 'horizon': 'intraday'},
        timeout=30
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        data = response.json()
        print(f"Response JSON:")
        print(json.dumps(data, indent=2)[:1000])
    except:
        print(f"Response Text: {response.text[:500]}")
        
except requests.exceptions.Timeout:
    print("[ERROR] Request timed out")
except requests.exceptions.ConnectionError:
    print("[ERROR] Connection error - server might be down")
except Exception as e:
    print(f"[ERROR] Exception: {e}")
    traceback.print_exc()




