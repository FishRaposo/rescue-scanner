"""FTS5 helpers. Optional per repo — a consumer enables it explicitly."""

from __future__ import annotations

import sqlite3
from collections.abc import Sequence


def create_fts(
    conn: sqlite3.Connection,
    table: str,
    columns: Sequence[str],
    *,
    content_table: str | None = None,
) -> None:
    """Create an FTS5 table. With `content_table`, it indexes that table's
    rows (external content mode); otherwise it is standalone."""
    cols = ", ".join(columns)
    if content_table is None:
        conn.execute(f"CREATE VIRTUAL TABLE IF NOT EXISTS {table} USING fts5({cols})")
    else:
        conn.execute(
            f"CREATE VIRTUAL TABLE IF NOT EXISTS {table} "
            f"USING fts5({cols}, content='{content_table}')"
        )


def fts_search(
    conn: sqlite3.Connection,
    table: str,
    match: str,
    *,
    limit: int = 20,
) -> list[sqlite3.Row]:
    """MATCH query with a rowid + rank, best match first."""
    return list(
        conn.execute(
            f"SELECT rowid, * FROM {table} WHERE {table} MATCH ? ORDER BY rank LIMIT ?",
            (match, limit),
        )
    )
