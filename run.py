
import subprocess
import sys
import time
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

backend_process = None
frontend_process = None


def stop_processes():
    print("\nStopping PharmaRCA AI...")

    for process in [backend_process, frontend_process]:
        if process and process.poll() is None:
            process.terminate()

    for process in [backend_process, frontend_process]:
        if process and process.poll() is None:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()

    print("PharmaRCA AI stopped.")


def main():
    global backend_process, frontend_process

    python_exe = BACKEND_DIR / "venv" / "Scripts" / "python.exe"

    if not python_exe.exists():
        print("Backend virtual environment not found.")
        print("Please create backend/venv first.")
        return

    if not (FRONTEND_DIR / "node_modules").exists():
        print("Frontend dependencies not found.")
        print("Run npm install inside the frontend folder.")
        return

    print("=" * 50)
    print("       PHARMARCA AI - STARTING")
    print("=" * 50)

    try:
        backend_process = subprocess.Popen(
            [
                str(python_exe),
                "-m", "uvicorn",
                "app.main:app",
                "--reload"
            ],
            cwd=BACKEND_DIR
        )

        frontend_process = subprocess.Popen(
            ["npm.cmd", "run", "dev"],
            cwd=FRONTEND_DIR
        )

        print("\nBackend:  http://127.0.0.1:8000")
        print("Frontend: http://localhost:5174")
        print("API Docs: http://127.0.0.1:8000/docs")
        print("\nPress Ctrl+C to stop both servers.")

        while True:
            if backend_process.poll() is not None:
                print("Backend process stopped.")
                break

            if frontend_process.poll() is not None:
                print("Frontend process stopped.")
                break

            time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutdown requested.")

    finally:
        stop_processes()


if __name__ == "__main__":
    main()
