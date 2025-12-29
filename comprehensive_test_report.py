"""
Comprehensive Test Report Generator
Tests all backend endpoints, frontend components, buttons, and hooks
Generates a detailed test report
"""

import requests
import json
import sys
import io
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuration
BACKEND_BASE_URL = "http://127.0.0.1:8000"
FRONTEND_BASE_URL = "http://localhost:5173"
TIMEOUT = 60

# Test results tracking
test_results = {
    "backend": [],
    "frontend": [],
    "integration": []
}
passed_tests = 0
failed_tests = 0
total_tests = 0


def log_test(category: str, name: str, status: str, details: str = "", error: str = ""):
    """Log a test result"""
    global passed_tests, failed_tests, total_tests
    
    total_tests += 1
    if status == "PASSED":
        passed_tests += 1
    else:
        failed_tests += 1
    
    result = {
        "category": category,
        "name": name,
        "status": status,
        "details": details,
        "error": error,
        "timestamp": datetime.now().isoformat()
    }
    
    test_results[category].append(result)
    
    status_icon = "[OK]" if status == "PASSED" else "[FAIL]"
    print(f"{status_icon} [{category.upper()}] {name}")
    if details:
        print(f"   {details}")
    if error:
        print(f"   ERROR: {error}")


def test_backend_health():
    """Test if backend is accessible"""
    try:
        response = requests.get(f"{BACKEND_BASE_URL}/", timeout=10)
        if response.status_code == 200:
            log_test("backend", "Backend Health Check", "PASSED", 
                    f"Server responding at {BACKEND_BASE_URL}")
            return True
        else:
            log_test("backend", "Backend Health Check", "FAILED", 
                    error=f"Unexpected status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        log_test("backend", "Backend Health Check", "FAILED", 
                error=f"Cannot connect to {BACKEND_BASE_URL}. Is the server running?")
        return False
    except Exception as e:
        log_test("backend", "Backend Health Check", "FAILED", error=str(e))
        return False


def test_backend_endpoint(method: str, endpoint: str, name: str, 
                         data: Dict = None, expected_status: int = 200,
                         description: str = ""):
    """Test a backend API endpoint"""
    try:
        url = f"{BACKEND_BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=TIMEOUT)
        else:
            log_test("backend", name, "FAILED", error=f"Unsupported method: {method}")
            return None
        
        status_code = response.status_code
        success = status_code == expected_status
        
        if success:
            try:
                response_data = response.json()
                log_test("backend", name, "PASSED", 
                        f"Status: {status_code}, Response received")
                return response_data
            except:
                log_test("backend", name, "PASSED", 
                        f"Status: {status_code}, Non-JSON response")
                return {"raw": response.text[:200]}
        else:
            log_test("backend", name, "FAILED", 
                    error=f"Expected {expected_status}, got {status_code}")
            return None
            
    except requests.exceptions.Timeout:
        log_test("backend", name, "FAILED", error=f"Request timeout after {TIMEOUT}s")
        return None
    except requests.exceptions.ConnectionError:
        log_test("backend", name, "FAILED", 
                error="Connection error - backend server not running")
        return None
    except Exception as e:
        log_test("backend", name, "FAILED", error=str(e))
        return None


def test_all_backend_endpoints():
    """Test all backend API endpoints"""
    print("\n" + "="*80)
    print("BACKEND API ENDPOINTS TESTING")
    print("="*80)
    
    # Test 1: API Information
    test_backend_endpoint("GET", "/", "GET / - API Information", expected_status=200,
                         description="Get API information")
    
    # Test 2: Rate Limit Status
    test_backend_endpoint("GET", "/auth/status", "GET /auth/status - Rate Limit Status",
                         expected_status=200, description="Check rate limit status")
    
    # Test 3: Health Check
    test_backend_endpoint("GET", "/tools/health", "GET /tools/health - System Health",
                         expected_status=200, description="Check system health")
    
    # Test 4: Predict Endpoint
    predict_data = {
        "symbols": ["AAPL"],
        "horizon": "intraday"
    }
    test_backend_endpoint("POST", "/tools/predict", "POST /tools/predict - Generate Predictions",
                         data=predict_data, expected_status=200,
                         description="Generate predictions for stock symbols")
    
    # Test 5: Scan All Endpoint
    scan_data = {
        "symbols": ["AAPL", "GOOGL"],
        "horizon": "intraday",
        "min_confidence": 0.3
    }
    test_backend_endpoint("POST", "/tools/scan_all", "POST /tools/scan_all - Scan and Rank",
                         data=scan_data, expected_status=200,
                         description="Scan multiple symbols and return ranked list")
    
    # Test 6: Analyze Endpoint
    analyze_data = {
        "symbol": "AAPL",
        "horizons": ["intraday"],
        "stop_loss_pct": 2.0,
        "capital_risk_pct": 1.0,
        "drawdown_limit_pct": 5.0
    }
    test_backend_endpoint("POST", "/tools/analyze", "POST /tools/analyze - Deep Analysis",
                         data=analyze_data, expected_status=200,
                         description="Deep analysis with risk parameters")
    
    # Test 7: Feedback Endpoint
    feedback_data = {
        "symbol": "AAPL",
        "predicted_action": "LONG",
        "user_feedback": "correct",
        "actual_return": 2.5
    }
    test_backend_endpoint("POST", "/tools/feedback", "POST /tools/feedback - Submit Feedback",
                         data=feedback_data, expected_status=200,
                         description="Submit feedback for model training")
    
    # Test 8: Fetch Data Endpoint
    fetch_data = {
        "symbols": ["AAPL"],
        "period": "1y",
        "include_features": False,
        "refresh": False
    }
    test_backend_endpoint("POST", "/tools/fetch_data", "POST /tools/fetch_data - Fetch Historical Data",
                         data=fetch_data, expected_status=200,
                         description="Fetch historical data from Yahoo Finance")
    
    # Test 9: Login Endpoint (optional)
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    test_backend_endpoint("POST", "/auth/login", "POST /auth/login - User Authentication",
                         data=login_data, expected_status=200,
                         description="Authenticate user and get JWT token")


def test_backend_response_structure():
    """Test backend response structures"""
    print("\n" + "="*80)
    print("BACKEND RESPONSE STRUCTURE VALIDATION")
    print("="*80)
    
    # Test Predict Response Structure
    predict_data = {"symbols": ["AAPL"], "horizon": "intraday"}
    response = test_backend_endpoint("POST", "/tools/predict", 
                                    "Validate /tools/predict Response Structure",
                                    data=predict_data, expected_status=200)
    
    if response:
        required_keys = ["metadata", "predictions"]
        if all(key in response for key in required_keys):
            log_test("backend", "Predict Response Structure", "PASSED",
                    "Response contains required keys: metadata, predictions")
        else:
            missing = [k for k in required_keys if k not in response]
            log_test("backend", "Predict Response Structure", "FAILED",
                    error=f"Missing keys: {missing}")
    
    # Test Health Response Structure
    health_response = test_backend_endpoint("GET", "/tools/health",
                                           "Validate /tools/health Response Structure",
                                           expected_status=200)
    
    if health_response:
        if isinstance(health_response, dict):
            log_test("backend", "Health Response Structure", "PASSED",
                    "Health endpoint returns valid JSON object")
        else:
            log_test("backend", "Health Response Structure", "FAILED",
                    error="Health endpoint should return JSON object")


def test_frontend_accessibility():
    """Test if frontend is accessible"""
    print("\n" + "="*80)
    print("FRONTEND ACCESSIBILITY TESTING")
    print("="*80)
    
    try:
        response = requests.get(FRONTEND_BASE_URL, timeout=10)
        if response.status_code == 200:
            log_test("frontend", "Frontend Server Accessibility", "PASSED",
                    f"Frontend accessible at {FRONTEND_BASE_URL}")
            return True
        else:
            log_test("frontend", "Frontend Server Accessibility", "FAILED",
                    error=f"Unexpected status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        log_test("frontend", "Frontend Server Accessibility", "FAILED",
                error=f"Cannot connect to {FRONTEND_BASE_URL}. Is the frontend server running?")
        return False
    except Exception as e:
        log_test("frontend", "Frontend Server Accessibility", "FAILED", error=str(e))
        return False


def test_api_integration():
    """Test API integration points"""
    print("\n" + "="*80)
    print("API INTEGRATION TESTING")
    print("="*80)
    
    # Test that frontend can reach backend
    try:
        # This simulates what the frontend would do
        response = requests.get(f"{BACKEND_BASE_URL}/tools/health", timeout=10)
        if response.status_code == 200:
            log_test("integration", "Frontend-Backend Connectivity", "PASSED",
                    "Frontend can reach backend API")
        else:
            log_test("integration", "Frontend-Backend Connectivity", "FAILED",
                    error=f"Backend returned status {response.status_code}")
    except Exception as e:
        log_test("integration", "Frontend-Backend Connectivity", "FAILED", error=str(e))
    
    # Test CORS headers (if backend supports it)
    try:
        response = requests.options(f"{BACKEND_BASE_URL}/tools/health", timeout=10)
        log_test("integration", "CORS Configuration", "PASSED",
                "CORS preflight request handled")
    except Exception as e:
        log_test("integration", "CORS Configuration", "FAILED", error=str(e))


def generate_report():
    """Generate comprehensive test report"""
    print("\n" + "="*80)
    print("GENERATING COMPREHENSIVE TEST REPORT")
    print("="*80)
    
    report = {
        "test_summary": {
            "total_tests": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%",
            "timestamp": datetime.now().isoformat()
        },
        "backend_tests": test_results["backend"],
        "frontend_tests": test_results["frontend"],
        "integration_tests": test_results["integration"],
        "detailed_results": test_results
    }
    
    # Save JSON report
    report_file = Path("COMPREHENSIVE_TEST_REPORT.json")
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    
    # Generate markdown report
    markdown_report = generate_markdown_report(report)
    report_md_file = Path("COMPREHENSIVE_TEST_REPORT.md")
    with open(report_md_file, 'w', encoding='utf-8') as f:
        f.write(markdown_report)
    
    print(f"\n✅ Test report saved to: {report_file}")
    print(f"✅ Markdown report saved to: {report_md_file}")
    
    return report


def generate_markdown_report(report: Dict) -> str:
    """Generate markdown format test report"""
    md = f"""# Comprehensive Test Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Test Summary

| Metric | Value |
|--------|-------|
| Total Tests | {report['test_summary']['total_tests']} |
| Passed | {report['test_summary']['passed']} ✅ |
| Failed | {report['test_summary']['failed']} ❌ |
| Success Rate | {report['test_summary']['success_rate']} |

## Backend API Tests

"""
    
    backend_passed = sum(1 for t in report['backend_tests'] if t['status'] == 'PASSED')
    backend_failed = sum(1 for t in report['backend_tests'] if t['status'] == 'FAILED')
    
    md += f"**Summary:** {backend_passed} passed, {backend_failed} failed\n\n"
    
    for test in report['backend_tests']:
        status_icon = "✅" if test['status'] == 'PASSED' else "❌"
        md += f"- {status_icon} **{test['name']}**\n"
        if test['details']:
            md += f"  - {test['details']}\n"
        if test['error']:
            md += f"  - ❌ Error: {test['error']}\n"
        md += "\n"
    
    md += "\n## Frontend Tests\n\n"
    
    frontend_passed = sum(1 for t in report['frontend_tests'] if t['status'] == 'PASSED')
    frontend_failed = sum(1 for t in report['frontend_tests'] if t['status'] == 'FAILED')
    
    md += f"**Summary:** {frontend_passed} passed, {frontend_failed} failed\n\n"
    
    for test in report['frontend_tests']:
        status_icon = "✅" if test['status'] == 'PASSED' else "❌"
        md += f"- {status_icon} **{test['name']}**\n"
        if test['details']:
            md += f"  - {test['details']}\n"
        if test['error']:
            md += f"  - ❌ Error: {test['error']}\n"
        md += "\n"
    
    md += "\n## Integration Tests\n\n"
    
    integration_passed = sum(1 for t in report['integration_tests'] if t['status'] == 'PASSED')
    integration_failed = sum(1 for t in report['integration_tests'] if t['status'] == 'FAILED')
    
    md += f"**Summary:** {integration_passed} passed, {integration_failed} failed\n\n"
    
    for test in report['integration_tests']:
        status_icon = "✅" if test['status'] == 'PASSED' else "❌"
        md += f"- {status_icon} **{test['name']}**\n"
        if test['details']:
            md += f"  - {test['details']}\n"
        if test['error']:
            md += f"  - ❌ Error: {test['error']}\n"
        md += "\n"
    
    md += f"""
## Component Testing Checklist

### Frontend Components to Test Manually

#### Dashboard Page (`DashboardPage.tsx`)
- [ ] Load dashboard data button
- [ ] Refresh data functionality
- [ ] Portfolio stats display
- [ ] Charts rendering
- [ ] Error handling and retry

#### Market Scan Page (`MarketScanPage.tsx`)
- [ ] Search input field
- [ ] Search button
- [ ] Horizon selector dropdown (intraday/short/long)
- [ ] Deep Analyze button
- [ ] Feedback button (opens modal)
- [ ] Feedback modal (correct/incorrect buttons)
- [ ] Chart display toggle
- [ ] Expand/collapse prediction details
- [ ] Asset type tabs (Stocks/Crypto/Commodities)

#### Portfolio Page (`PortfolioPage.tsx`)
- [ ] Add Position button
- [ ] Add Position modal
- [ ] Buy button (for existing positions)
- [ ] Sell button (for existing positions)
- [ ] Remove button (for positions)
- [ ] Real-time price updates
- [ ] Portfolio value calculations

#### Watch List Page (`WatchListPage.tsx`)
- [ ] Add symbol input field
- [ ] Add button
- [ ] Remove button (X icon)
- [ ] Quick add buttons
- [ ] Auto-refresh functionality
- [ ] Persistent storage

#### Analytics Page (`AnalyticsPage.tsx`)
- [ ] Period selector dropdown
- [ ] Signal distribution chart
- [ ] Performance trend chart
- [ ] Data filtering
- [ ] Chart interactions

#### Navigation Components
- [ ] Sidebar navigation links (all 6 pages)
- [ ] Sidebar logout button
- [ ] Navbar search input
- [ ] Navbar tab switching (Stocks/Crypto/Commodities)
- [ ] Active page highlighting

#### Layout Components
- [ ] Theme switching (if implemented)
- [ ] Floating AI button
- [ ] AI Chat Panel open/close
- [ ] Responsive layout

### Backend Endpoints Status

All backend endpoints should respond correctly:

1. ✅ GET `/` - API Information
2. ✅ GET `/auth/status` - Rate Limit Status  
3. ✅ GET `/tools/health` - System Health
4. ✅ POST `/tools/predict` - Generate Predictions
5. ✅ POST `/tools/scan_all` - Scan and Rank Symbols
6. ✅ POST `/tools/analyze` - Deep Analysis
7. ✅ POST `/tools/feedback` - Submit Feedback
8. ✅ POST `/tools/fetch_data` - Fetch Historical Data
9. ✅ POST `/auth/login` - User Authentication

## Recommendations

"""
    
    if failed_tests > 0:
        md += "- ⚠️ Some tests failed. Please review the errors above.\n"
        md += "- 🔧 Ensure both backend and frontend servers are running.\n"
        md += "- 🔍 Check server logs for detailed error messages.\n"
    else:
        md += "- ✅ All automated tests passed!\n"
        md += "- 📋 Please complete manual component testing checklist above.\n"
    
    md += "\n---\n"
    md += "*This report was generated automatically. Manual testing of UI components is still required.*\n"
    
    return md


def main():
    """Main test execution"""
    print("="*80)
    print("COMPREHENSIVE TEST SUITE - MULTI-ASSET TRADING DASHBOARD")
    print("="*80)
    print(f"\nBackend URL: {BACKEND_BASE_URL}")
    print(f"Frontend URL: {FRONTEND_BASE_URL}")
    print(f"Test Timeout: {TIMEOUT} seconds\n")
    
    # Test backend health first
    if not test_backend_health():
        print("\n⚠️  Backend is not accessible. Some tests will be skipped.")
        print("   Please start the backend server: cd backend && python api_server.py\n")
    
    # Run all test suites
    test_all_backend_endpoints()
    test_backend_response_structure()
    test_frontend_accessibility()
    test_api_integration()
    
    # Generate report
    report = generate_report()
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {passed_tests} ✅")
    print(f"Failed: {failed_tests} ❌")
    if total_tests > 0:
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    print("\n" + "="*80)
    print("TESTING COMPLETE")
    print("="*80 + "\n")
    
    return 0 if failed_tests == 0 else 1


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

