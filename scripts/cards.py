"""cards — render the repo's three 1000x750 cards from docs/cards/.

    python scripts/cards.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from shared.cards.render import main  # noqa: E402

if __name__ == "__main__":
    manifest = ROOT / "docs" / "cards" / "cards.json"
    out = ROOT / "docs" / "images" / "portfolio"
    sys.exit(main(["--manifest", str(manifest), "--outdir", str(out)]))
