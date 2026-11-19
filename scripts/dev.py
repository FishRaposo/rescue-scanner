"""dev — the one-command local run for a web repo.

Seeds the SQLite database, starts the FastAPI backend and the Next.js dev
server, and prints the local URL. Cross-platform; Ctrl+C stops both.

    python scripts/dev.py [--backend-port 8000] [--frontend-port 3000] [--check]
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NPM = "npm.cmd" if os.name == "nt" else "npm"


def wait_for(url: str, timeout: float = 60.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2):
                return True
        except Exception:
            time.sleep(0.5)
    return False


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend-port", type=int, default=8000)
    ap.add_argument("--frontend-port", type=int, default=3000)
    ap.add_argument("--check", action="store_true", help="verify env and exit")
    args = ap.parse_args(argv)

    for tool in ("python", "node", "npm"):
        if not shutil.which(tool):
            print(f"missing: {tool}", file=sys.stderr)
            return 1
    if args.check:
        print("env ok: python, node, npm on PATH")
        return 0

    # Seed storage (idempotent migrate + seed).
    init = subprocess.run(
        [sys.executable, "-c", "from backend.main import init_storage; init_storage()"],
        cwd=ROOT,
    )
    if init.returncode != 0:
        print("storage init failed", file=sys.stderr)
        return 1

    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app",
         "--port", str(args.backend_port)],
        cwd=ROOT,
    )
    frontend = subprocess.Popen(
        [NPM, "run", "dev", "--", "--port", str(args.frontend_port)],
        cwd=ROOT,
    )
    try:
        ok = wait_for(f"http://127.0.0.1:{args.backend_port}/api/health")
        print(f"backend:  http://localhost:{args.backend_port}/api ({'up' if ok else 'starting'})")
        print(f"frontend: http://localhost:{args.frontend_port}")
        backend.wait()
    except KeyboardInterrupt:
        pass
    finally:
        for proc in (frontend, backend):
            proc.terminate()
            try:
                proc.wait(timeout=8)
            except subprocess.TimeoutExpired:
                proc.kill()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
