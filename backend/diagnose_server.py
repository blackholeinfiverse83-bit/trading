"""
Server Diagnostic Script
Checks for common issues that prevent the server from starting
"""

import sys
import os
from pathlib import Path

print("="*80)
print("SERVER DIAGNOSTIC TOOL")
print("="*80)
print()

errors = []
warnings = []

# Check 1: Python version
print("[1/10] Checking Python version...")
try:
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        errors.append(f"Python 3.8+ required. Found: {version.major}.{version.minor}")
    else:
        print(f"  [OK] Python {version.major}.{version.minor}.{version.micro}")
except Exception as e:
    errors.append(f"Could not check Python version: {e}")

# Check 2: Required directories
print("\n[2/10] Checking required directories...")
required_dirs = ['data', 'data/cache', 'data/features', 'data/logs', 'models']
for dir_path in required_dirs:
    path = Path(dir_path)
    if not path.exists():
        try:
            path.mkdir(parents=True, exist_ok=True)
            print(f"  [OK] Created: {dir_path}")
        except Exception as e:
            errors.append(f"Cannot create directory {dir_path}: {e}")
    else:
        print(f"  [OK] Exists: {dir_path}")

# Check 3: Core dependencies
print("\n[3/10] Checking core dependencies...")
core_deps = ['fastapi', 'uvicorn', 'pydantic', 'psutil']
for dep in core_deps:
    try:
        __import__(dep)
        print(f"  [OK] {dep}")
    except ImportError:
        errors.append(f"Missing dependency: {dep}")

# Check 4: ML dependencies
print("\n[4/10] Checking ML dependencies...")
ml_deps = ['pandas', 'numpy', 'yfinance', 'sklearn', 'lightgbm', 'xgboost', 'torch']
for dep in ml_deps:
    try:
        if dep == 'sklearn':
            __import__('sklearn')
        elif dep == 'torch':
            __import__('torch')
        else:
            __import__(dep)
        print(f"  [OK] {dep}")
    except ImportError:
        warnings.append(f"Missing ML dependency: {dep} (may cause prediction errors)")

# Check 5: Required files
print("\n[5/10] Checking required files...")
required_files = [
    'api_server.py',
    'config.py',
    'auth.py',
    'rate_limiter.py',
    'validators.py',
    'core/mcp_adapter.py',
    'stock_analysis_complete.py'
]
for file_path in required_files:
    path = Path(file_path)
    if path.exists():
        print(f"  [OK] {file_path}")
    else:
        errors.append(f"Missing file: {file_path}")

# Check 6: Import test
print("\n[6/10] Testing imports...")
try:
    import config
    print("  [OK] config")
except Exception as e:
    errors.append(f"Cannot import config: {e}")

try:
    from auth import authenticate_user
    print("  [OK] auth")
except Exception as e:
    errors.append(f"Cannot import auth: {e}")

try:
    from rate_limiter import check_rate_limit
    print("  [OK] rate_limiter")
except Exception as e:
    errors.append(f"Cannot import rate_limiter: {e}")

try:
    from validators import validate_symbols
    print("  [OK] validators")
except Exception as e:
    errors.append(f"Cannot import validators: {e}")

# Check 7: MCP Adapter import (may fail, that's OK)
print("\n[7/10] Testing MCP Adapter import...")
try:
    from core.mcp_adapter import MCPAdapter
    print("  [OK] MCPAdapter class found")
except Exception as e:
    warnings.append(f"Cannot import MCPAdapter: {e} (will be initialized on first request)")

# Check 8: Port availability
print("\n[8/10] Checking port 8000...")
try:
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 8000))
    sock.close()
    if result == 0:
        warnings.append("Port 8000 is already in use. Stop other servers or change UVICORN_PORT in .env")
    else:
        print("  [OK] Port 8000 is available")
except Exception as e:
    warnings.append(f"Could not check port: {e}")

# Check 9: Environment variables
print("\n[9/10] Checking configuration...")
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("  [OK] .env file loaded (if exists)")
except Exception as e:
    warnings.append(f"Could not load .env: {e}")

# Check 10: File permissions
print("\n[10/10] Checking file permissions...")
test_file = Path("data/logs/test_write.tmp")
try:
    test_file.parent.mkdir(parents=True, exist_ok=True)
    test_file.write_text("test")
    test_file.unlink()
    print("  [OK] Write permissions OK")
except Exception as e:
    errors.append(f"Cannot write to data/logs: {e}")

# Summary
print("\n" + "="*80)
print("DIAGNOSTIC SUMMARY")
print("="*80)

if errors:
    print("\n[ERROR] ERRORS (must fix):")
    for i, error in enumerate(errors, 1):
        print(f"  {i}. {error}")
    print("\n[WARNING] Server will NOT start until errors are fixed!")
else:
    print("\n[OK] No critical errors found!")

if warnings:
    print("\n[WARNING] WARNINGS (may cause issues):")
    for i, warning in enumerate(warnings, 1):
        print(f"  {i}. {warning}")

if not errors:
    print("\n" + "="*80)
    print("[OK] Server should start successfully!")
    print("="*80)
    print("\nTo start the server:")
    print("  python api_server.py")
    print("\nOr use the startup script:")
    print("  START_ALL_SERVERS.bat")
else:
    print("\n" + "="*80)
    print("[ERROR] Fix errors before starting the server")
    print("="*80)

print()

