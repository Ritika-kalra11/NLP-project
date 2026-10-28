#!/usr/bin/env python
"""
ResearchAI - One-Click Application Launcher
Starts the unified FastAPI + React UI server and opens the web application in your default browser.
"""

import sys
import time
import webbrowser
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"

def main():
    print("=" * 65)
    print("    Starting ResearchAI - AI Research Paper Companion")
    print("=" * 65)
    print("\n[1/2] Initializing ResearchAI Core Server...")
    print(f"      Working Directory: {BACKEND_DIR}")
    print("      Unified UI & API:  http://localhost:8000")
    print("      API Documentation: http://localhost:8000/docs")

    # Launch browser after a short delay
    def open_browser():
        time.sleep(2.5)
        print("\n[2/2] Opening ResearchAI in your web browser...")
        webbrowser.open("http://localhost:8000")

    import threading
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()

    print("\n" + "=" * 65)
    print("  Application is active! Keep this terminal open while using.")
    print("  To stop the application, press Ctrl + C.")
    print("=" * 65 + "\n")

    # Start uvicorn directly in current process
    try:
        import uvicorn
        # Add backend to path so app can be imported
        if str(BACKEND_DIR) not in sys.path:
            sys.path.insert(0, str(BACKEND_DIR))
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False, app_dir=str(BACKEND_DIR))
    except KeyboardInterrupt:
        print("\nResearchAI server shut down gracefully.")
    except Exception as e:
        print(f"\nError running server: {e}")
        # Fallback to subprocess
        subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"], cwd=str(BACKEND_DIR))

if __name__ == "__main__":
    main()
