"""check_live — repo-side entry point; implementation in shared/demo."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from shared.demo.check_live import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
