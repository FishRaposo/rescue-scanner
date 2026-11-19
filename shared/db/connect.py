"""One connection helper: row access, foreign keys on, WAL for file DBs."""

from __future__ import annotations

import sqlite3
from pathlib import Path


def connect(path: str | Path = ":memory:") -> sqlite3.Connection:
    """Open a SQLite connection with the repo's standard pragmas.

    `path` is a filesystem path or `":memory:"`. Foreign keys are always on;
    file databases use WAL so a crashed write never wedges the next launch.
    """
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    if str(path) != ":memory:":
        conn.execute("PRAGMA journal_mode = WAL")
    return conn
