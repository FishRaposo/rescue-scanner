"""build_demo — static Pages demo for a web repo.

Runs `next build` with the demo adapter and base path, then copies the export
into `site/` with `.nojekyll`. The demo never calls a backend or model.

    python scripts/build_demo.py [--base-path <repo>]
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"
SITE = ROOT / "site"


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-path", default=ROOT.name, help="Pages base path (repo name)")
    args = ap.parse_args(argv)

    env = dict(os.environ)
    env["NEXT_PUBLIC_DEMO_MODE"] = "true"
    env["NEXT_PUBLIC_BASE_PATH"] = args.base_path

    npm = "npm.cmd" if os.name == "nt" else "npm"
    res = subprocess.run([npm, "run", "build"], cwd=ROOT, env=env)
    if res.returncode != 0:
        return res.returncode

    out = FRONTEND / "out"
    if not out.exists():
        print(f"missing export dir {out}", file=sys.stderr)
        return 1

    if SITE.exists():
        shutil.rmtree(SITE)
    shutil.copytree(out, SITE)
    (SITE / ".nojekyll").write_text("", encoding="utf-8")
    print(f"demo export at {SITE} (basePath /{args.base_path})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
