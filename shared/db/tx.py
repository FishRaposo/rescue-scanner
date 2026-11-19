"""Transaction helper with rollback, for code paths that must be all-or-nothing."""

from __future__ import annotations

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager


@contextmanager
def transaction(conn: sqlite3.Connection) -> Iterator[sqlite3.Connection]:
    """Commit on success, roll back on any exception.

    Nested use is not supported — callers compose at one boundary (usually a
    route handler or a command).
    """
    try:
        yield conn
        conn.commit()
    except BaseException:
        conn.rollback()
        raise
