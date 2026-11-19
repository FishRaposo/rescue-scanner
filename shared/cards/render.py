"""render — the 1000x750 card renderer.

Cards are authored as HTML at 500x375 logical px and screenshotted at device
scale factor 2, yielding exactly 1000x750. A recorded clip box (x, y, w, h in
logical px) may crop the shot; final pixels are clip*w*scale x clip*h*scale and
must equal 1000x750. Boxes and arithmetic are written to the provenance README
beside the images so a re-run reproduces the set.

Usage:
    python render.py card.html --out card.png [--clip x,y,w,h]
    python render.py --manifest cards.json

Manifest: [{"html": "cover.html", "out": "cover.png", "clip": [0,0,500,375]}]

Requires: playwright (pip) with chromium installed.
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path

SCALE = 2
CARD_W, CARD_H = 500, 375  # logical px -> 1000x750 at dsf=2


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError(f"not a PNG: {path}")
    w, h = struct.unpack(">II", data[16:24])
    return w, h


def render_card(html: Path, out: Path, clip: tuple[int, int, int, int]) -> None:
    from playwright.sync_api import sync_playwright

    x, y, w, h = clip
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            ctx = browser.new_context(
                viewport={"width": max(w, CARD_W), "height": max(h, CARD_H)},
                device_scale_factor=SCALE,
            )
            page = ctx.new_page()
            page.goto(html.resolve().as_uri(), wait_until="networkidle")
            page.screenshot(
                path=str(out),
                clip={"x": x, "y": y, "width": w, "height": h},
            )
            ctx.close()
        finally:
            browser.close()

    got = png_size(out)
    want = (w * SCALE, h * SCALE)
    if got != want:
        raise ValueError(f"{out}: got {got[0]}x{got[1]}, want {want[0]}x{want[1]}")


def provenance_line(html: Path, out: Path, clip: tuple[int, int, int, int]) -> str:
    x, y, w, h = clip
    return (
        f"| {out.name} | {html.name} | {x},{y} | {w}x{h} logical "
        f"| x{SCALE} = {w * SCALE}x{h * SCALE} |"
    )


def write_provenance(out_dir: Path, rows: list[str]) -> None:
    readme = out_dir / "README.md"
    header = (
        "# Card provenance\n\n"
        "Rendered from HTML at device scale 2, cropped by recorded boxes.\n"
        "Reproduce: `python scripts/cards.py`.\n\n"
        "| image | source | clip origin | clip size | output |\n"
        "|---|---|---|---|---|\n"
    )
    readme.write_text(header + "\n".join(rows) + "\n", encoding="utf-8")


def parse_clip(text: str) -> tuple[int, int, int, int]:
    parts = [int(v) for v in text.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("clip must be x,y,w,h")
    return (parts[0], parts[1], parts[2], parts[3])


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description="Render 1000x750 cards from HTML")
    ap.add_argument("html", nargs="?", help="single card HTML file")
    ap.add_argument("--out", help="output PNG")
    ap.add_argument("--clip", type=parse_clip, default=(0, 0, CARD_W, CARD_H))
    ap.add_argument("--manifest", help="JSON list of {html,out,clip}")
    ap.add_argument("--outdir", default=".", help="output dir for manifest mode")
    args = ap.parse_args(argv)

    jobs: list[tuple[Path, Path, tuple[int, int, int, int]]] = []
    if args.manifest:
        manifest = Path(args.manifest)
        spec = json.loads(manifest.read_text(encoding="utf-8"))
        outdir = Path(args.outdir)
        outdir.mkdir(parents=True, exist_ok=True)
        for entry in spec:
            jobs.append(
                (
                    manifest.parent / entry["html"],
                    outdir / entry["out"],
                    tuple(entry.get("clip", [0, 0, CARD_W, CARD_H])),  # type: ignore[arg-type]
                )
            )
    elif args.html and args.out:
        jobs.append((Path(args.html), Path(args.out), args.clip))
    else:
        ap.error("give either --manifest or <html> --out <png>")

    rows: list[str] = []
    for html, out, clip in jobs:
        render_card(html, out, clip)
        rows.append(provenance_line(html, out, clip))
        print(f"rendered {out} ({clip[2] * SCALE}x{clip[3] * SCALE})")

    if args.manifest:
        write_provenance(Path(args.outdir), rows)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
