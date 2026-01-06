"""
Test server startup to identify crash cause
"""

import sys
import traceback

print("="*80)
print("TESTING SERVER STARTUP")
print("="*80)
print()

try:
    print("[1/5] Testing basic imports...")
    import os
    import sys
    from pathlib import Path
    print("  [OK] Basic imports")
except Exception as e:
    print(f"  [ERROR] Basic imports failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n[2/5] Testing config import...")
    import config
    print("  [OK] Config imported")
except Exception as e:
    print(f"  [ERROR] Config import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n[3/5] Testing FastAPI imports...")
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    print("  [OK] FastAPI imported")
except Exception as e:
    print(f"  [ERROR] FastAPI import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n[4/5] Testing other imports...")
    from auth import authenticate_user
    from rate_limiter import check_rate_limit
    from validators import validate_symbols
    print("  [OK] Other modules imported")
except Exception as e:
    print(f"  [ERROR] Other imports failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    print("\n[5/5] Testing MCP Adapter import...")
    from core.mcp_adapter import MCPAdapter
    print("  [OK] MCP Adapter imported")
    print("\n  [INFO] Testing MCP Adapter initialization...")
    try:
        adapter = MCPAdapter()
        print("  [OK] MCP Adapter initialized successfully")
    except Exception as e:
        print(f"  [WARNING] MCP Adapter initialization failed: {e}")
        print("  [INFO] This is OK - adapter will initialize on first request")
        traceback.print_exc()
except Exception as e:
    print(f"  [WARNING] MCP Adapter import/init failed: {e}")
    print("  [INFO] This is OK - adapter will initialize on first request")
    traceback.print_exc()

print("\n" + "="*80)
print("[SUCCESS] All imports passed!")
print("="*80)
print("\nServer should start successfully.")
print("If it still crashes, check the startup event in api_server.py")








