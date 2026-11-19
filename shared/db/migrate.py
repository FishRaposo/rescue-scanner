"""Ordered SQL-file migrations: `NNNN_name.sql`, applied once, recorded."""

from __future__ import annotations

import re
import sqlite3
from pathlib import Path

MIGRATION_RE = re.compile(r"^(\d+)_[a-z0-9_]+\.sql$")

DDL = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
)
"""


class MigrationError(Exception):
    pass


def _files(migrations_dir: str | Path) -> list[tuple[int, str, Path]]:
    found: list[tuple[int, str, Path]] = []
    for path in sorted(Path(migrations_dir).glob("*.sql")):
        m = MIGRATION_RE.match(path.name)
        if not m:
            raise MigrationError(f"bad migration filename: {path.name} (want NNNN_name.sql)")
        found.append((int(m.group(1)), path.name, path))
    versions = [v for v, _, _ in found]
    if len(versions) != len(set(versions)):
        raise MigrationError("duplicate migration version")
    return found


def migrate(conn: sqlite3.Connection, migrations_dir: str | Path) -> list[str]:
    """Apply unapplied migrations in order inside one transaction each.

    Returns the names applied this run (empty on a clean re-run — idempotent).
    """
    conn.execute(DDL)
    applied = {
        row["version"] for row in conn.execute("SELECT version FROM schema_migrations")
    }
    ran: list[str] = []
    for version, name, path in _files(migrations_dir):
        if version in applied:
            continue
        sql = path.read_text(encoding="utf-8")
        try:
            # executescript implicitly commits before running, so a `with conn:`
            # wrapper would not protect the script. Wrap the script itself in an
            # explicit transaction; on failure the open transaction rolls back.
            conn.executescript(f"BEGIN;\n{sql}\nCOMMIT;")
            conn.execute(
                "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
                (version, name),
            )
        except sqlite3.Error as e:
            conn.rollback()
            raise MigrationError(f"migration {name} failed: {e}") from e
        ran.append(name)
    return ran


def migration_status(
    conn: sqlite3.Connection, migrations_dir: str | Path
) -> list[dict[str, object]]:
    """Every migration file with its applied state, for status output."""
    applied = {
        row["version"] for row in conn.execute("SELECT version FROM schema_migrations")
    } if _table_exists(conn, "schema_migrations") else set()
    return [
        {"version": v, "name": n, "applied": v in applied}
        for v, n, _ in _files(migrations_dir)
    ]


def _table_exists(conn: sqlite3.Connection, name: str) -> bool:
    row = conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,)
    ).fetchone()
    return row is not None
