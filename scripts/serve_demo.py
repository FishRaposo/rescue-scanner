"""serve_demo — serve the built `site/` directory for e2e and local checks.

    python scripts/serve_demo.py [--dir site] [--port 3111]
"""

from __future__ import annotations

import argparse
import functools
import http.server
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=str(ROOT / "site"))
    ap.add_argument("--port", type=int, default=3111)
    ap.add_argument("--base-path", default="", help="serve under /<base-path>/ as Pages does")
    args = ap.parse_args()

    base = "/" + args.base_path.strip("/") if args.base_path else ""

    class Handler(http.server.SimpleHTTPRequestHandler):
        def send_head(self):  # noqa: ANN202
            if base:
                path = self.path.split("?", 1)[0].split("#", 1)[0]
                if path == base:
                    self.path = base + "/" + self.path[len(path):]
                if not self.path.startswith(base + "/"):
                    self.send_error(404, "outside base path")
                    return None
                self.path = self.path[len(base):]
            return super().send_head()

    handler = functools.partial(Handler, directory=args.dir)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"serving {args.dir} on http://127.0.0.1:{args.port}{base}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
