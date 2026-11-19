"""verify — the repo's full verification chain, one command.

    python scripts/verify.py          # unit + typecheck + lint + pytest + demo build
    python scripts/verify.py --ci     # same, CI wording
    python scripts/verify.py --e2e    # plus Playwright e2e against the built demo
    python scripts/verify.py --quick  # pytest + unit only

Fails loudly and never turns a skip into a pass.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"

NPM = "npm.cmd" if os.name == "nt" else "npm"
NPX = "npx.cmd" if os.name == "nt" else "npx"


def run(name: str, cmd: list[str], cwd: Path = ROOT) -> bool:
    print(f"--- {name}: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd)
    if res.returncode != 0:
        print(f"FAIL {name}")
        return False
    print(f"PASS {name}")
    return True


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ci", action="store_true")
    ap.add_argument("--e2e", action="store_true")
    ap.add_argument("--quick", action="store_true")
    args = ap.parse_args(argv)

    is_web = FRONTEND.exists()
    steps: list[tuple[str, list[str], Path]] = []

    if is_web:
        steps += [
            ("typecheck", [NPM, "run", "typecheck"], ROOT),
            ("lint", [NPM, "run", "lint"], ROOT),
            ("unit", [NPM, "run", "unit"], ROOT),
        ]
    has_backend = (ROOT / "backend").exists()
    if is_web and has_backend:
        steps.append(("pytest", [sys.executable, "-m", "pytest"], ROOT))
    elif not is_web:
        steps.append(("unittest", [sys.executable, "-m", "unittest", "discover", "-s", "tests", "-v"], ROOT))
    if is_web and not args.quick:
        steps.append(("build", [NPM, "run", "build"], ROOT))
        steps.append(("demo-export", [sys.executable, "scripts/build_demo.py"], ROOT))
    if args.e2e and is_web:
        steps.append(("e2e", [NPX, "playwright", "test"], ROOT))

    failed = []
    for name, cmd, cwd in steps:
        if not run(name, cmd, cwd):
            failed.append(name)

    print(f"verify: {'PASS' if not failed else 'FAIL'} ({len(steps) - len(failed)}/{len(steps)})")
    if failed:
        print("failed: " + ", ".join(failed))
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
