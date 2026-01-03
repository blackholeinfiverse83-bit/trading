"""
Server Watchdog - Auto-restart server if it crashes
Keeps the server running even if it encounters errors
"""

import subprocess
import sys
import time
import os
from pathlib import Path

# Change to backend directory
backend_dir = Path(__file__).parent
os.chdir(backend_dir)

print("="*80)
print("SERVER WATCHDOG - Auto-Restart Enabled")
print("="*80)
print(f"Working directory: {backend_dir}")
print("Server will automatically restart if it crashes")
print("Press Ctrl+C to stop the watchdog")
print("="*80)
print()

restart_count = 0
max_restarts_per_hour = 10
restart_times = []

while True:
    try:
        restart_count += 1
        current_time = time.time()
        
        # Clean old restart times (older than 1 hour)
        restart_times = [t for t in restart_times if current_time - t < 3600]
        
        if len(restart_times) >= max_restarts_per_hour:
            print(f"\n[ERROR] Too many restarts ({len(restart_times)}) in the last hour!")
            print("Stopping watchdog to prevent infinite restart loop.")
            print("Please check the server logs for errors:")
            print(f"  {backend_dir / 'data' / 'logs' / 'api_server.log'}")
            sys.exit(1)
        
        restart_times.append(current_time)
        
        print(f"\n[{restart_count}] Starting server...")
        print("-" * 80)
        
        # Check if port is already in use and kill the process if needed
        import socket
        import psutil
        
        port_check = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        port_in_use = port_check.connect_ex(('127.0.0.1', 8000)) == 0
        port_check.close()
        
        if port_in_use:
            print("[WARNING] Port 8000 is already in use!")
            print("[INFO] Attempting to find and kill the process using port 8000...")
            
            try:
                # Find process using port 8000
                for conn in psutil.net_connections(kind='inet'):
                    if conn.laddr.port == 8000 and conn.status == psutil.CONN_LISTEN:
                        pid = conn.pid
                        if pid:
                            print(f"[INFO] Found process {pid} using port 8000. Killing it...")
                            try:
                                proc = psutil.Process(pid)
                                proc.terminate()
                                # Wait a bit for graceful shutdown
                                try:
                                    proc.wait(timeout=3)
                                    print(f"[OK] Process {pid} terminated gracefully")
                                except psutil.TimeoutExpired:
                                    # Force kill if it didn't terminate
                                    proc.kill()
                                    print(f"[OK] Process {pid} force killed")
                                time.sleep(2)  # Wait for port to be released
                            except psutil.NoSuchProcess:
                                print(f"[INFO] Process {pid} already terminated")
                            except psutil.AccessDenied:
                                print(f"[ERROR] Cannot kill process {pid} - access denied. Please run as administrator or kill manually.")
                            break
            except Exception as e:
                print(f"[WARNING] Could not automatically kill process: {e}")
                print("[INFO] Please stop the existing server manually.")
                print("[INFO] Waiting 10 seconds before next attempt...")
                time.sleep(10)
                continue
            
            # Check again after killing
            time.sleep(2)
            port_check2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            port_still_in_use = port_check2.connect_ex(('127.0.0.1', 8000)) == 0
            port_check2.close()
            
            if port_still_in_use:
                print("[ERROR] Port 8000 is still in use after attempting to kill process.")
                print("[INFO] Please stop the existing server manually.")
                print("[INFO] Waiting 10 seconds before next attempt...")
                time.sleep(10)
                continue
            else:
                print("[OK] Port 8000 is now free. Starting server...")
        
        # Start the server with environment variables for rate limits
        env = os.environ.copy()
        env['RATE_LIMIT_PER_MINUTE'] = '500'
        env['RATE_LIMIT_PER_HOUR'] = '10000'
        
        process = subprocess.Popen(
            [sys.executable, "api_server.py"],
            cwd=str(backend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,  # Combine stderr with stdout
            text=True,
            bufsize=1,
            universal_newlines=True,
            env=env  # Pass environment variables
        )
        
        # Stream output in real-time
        try:
            for line in process.stdout:
                print(line, end='')
                sys.stdout.flush()
        except KeyboardInterrupt:
            print("\n\n[INFO] Watchdog stopped by user (Ctrl+C)")
            process.terminate()
            try:
                process.wait(timeout=5)
            except:
                process.kill()
            sys.exit(0)
        except Exception as e:
            print(f"\n[ERROR] Error reading server output: {e}")
            # Continue to check return code
        
        # Wait for process to finish
        return_code = process.wait()
        
        if return_code == 0:
            print("\n[INFO] Server stopped normally (exit code 0)")
            print("Watchdog will not restart (server was stopped intentionally)")
            break
        else:
            print(f"\n[WARNING] Server crashed with exit code {return_code}")
            print(f"[INFO] Restarting in 5 seconds... (Restart #{restart_count})")
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\n\n[INFO] Watchdog stopped by user (Ctrl+C)")
        if 'process' in locals():
            process.terminate()
            try:
                process.wait(timeout=5)
            except:
                process.kill()
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] Watchdog error: {e}")
        print("[INFO] Restarting in 10 seconds...")
        time.sleep(10)
