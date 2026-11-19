"""check_live — the demo/recorded-run acceptance check.

Verifies, in a real headless browser, against a served directory or a live URL:

1. the sample-data label renders ([data-sample-label] visible);
2. one deep link boots (--deep-link PATH, default "/");
3. zero requests leave the origin;
4. the console is clean (no console errors, no page errors).

Usage:
    python check_live.py --dir demo-out [--deep-link /items/item-0001/]
    python check_live.py --url https://fishraposo.github.io/<repo>/ [--deep-link /x/]

Exit 0 on PASS, 1 on FAIL. Requires: playwright (pip) with chromium installed.
"""

from __future__ import annotations

import argparse
import contextlib
import functools
import http.server
import sys
import threading
from pathlib import Path
from urllib.parse import urljoin, urlparse

CHECKS = ["sample label", "deep link boots", "zero off-origin", "clean console"]


@contextlib.contextmanager
def serve_dir(directory: str, base_path: str = ""):
    """Serve `directory` at /<base_path>/ — mirrors how Pages serves a repo
    site. Requests outside the base path 404."""
    base = "/" + base_path.strip("/") if base_path else ""

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

    handler = functools.partial(Handler, directory=directory)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}{base}/"
    finally:
        server.shutdown()
        thread.join(timeout=5)


def run_checks(base_url: str, deep_link: str) -> list[tuple[str, bool, str]]:
    from playwright.sync_api import sync_playwright

    off_origin: list[str] = []
    console_errors: list[str] = []
    results: list[tuple[str, bool, str]] = []
    origin = urlparse(base_url).netloc

    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page()

            def on_request(req) -> None:  # noqa: ANN001
                host = urlparse(req.url).netloc
                if host and host != origin:
                    off_origin.append(req.url)

            page.on("request", on_request)
            page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errors.append(str(e)))

            # 1 — sample label on the entry page
            page.goto(base_url, wait_until="networkidle")
            label = page.locator("[data-sample-label]")
            found = label.count() > 0 and label.first.is_visible()
            results.append(("sample label", found, "found" if found else "no [data-sample-label]"))

            # 2 — deep link boots (relative to the app's base path)
            deep_url = urljoin(base_url, deep_link.lstrip("/"))
            resp = page.goto(deep_url, wait_until="networkidle")
            body_ok = page.locator("body").inner_text().strip() != ""
            ok = bool(resp and resp.ok and body_ok)
            results.append(("deep link boots", ok, f"{deep_link} -> {resp.status if resp else 'no response'}"))

            # 3 — zero off-origin
            results.append((
                "zero off-origin",
                len(off_origin) == 0,
                "clean" if not off_origin else f"{len(off_origin)}: {off_origin[:3]}",
            ))

            # 4 — clean console
            results.append((
                "clean console",
                len(console_errors) == 0,
                "clean" if not console_errors else "; ".join(console_errors[:3]),
            ))
        finally:
            browser.close()
    return results


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description="Demo/recorded-run acceptance check")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--dir", help="serve this directory locally and check it")
    src.add_argument("--url", help="check this live URL")
    ap.add_argument("--deep-link", default="", help="deep path that must boot")
    ap.add_argument(
        "--base-path",
        default="",
        help="serve --dir under this base path (as Pages would)",
    )
    args = ap.parse_args(argv)

    if args.dir and not Path(args.dir).is_dir():
        print(f"FAIL  no such directory: {args.dir}")
        return 1

    if args.dir:
        with serve_dir(args.dir, args.base_path) as base:
            results = run_checks(base, args.deep_link)
    else:
        results = run_checks(args.url, args.deep_link)

    failed = 0
    for name, passed, detail in results:
        print(f"{'PASS' if passed else 'FAIL'}  {name:<18} {detail}")
        failed += 0 if passed else 1
    print(f"check_live: {'PASS' if failed == 0 else 'FAIL'} ({len(results) - failed}/{len(results)})")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
