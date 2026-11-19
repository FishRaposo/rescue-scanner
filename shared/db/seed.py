"""Deterministic seeding: run seed callables in a fixed order, each in a
transaction, and only once (tracked in `seed_runs`)."""

from __future__ import annotations

import sqlite3
from collections.abc import Callable

DDL = """
CREATE TABLE IF NOT EXISTS seed_runs (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
)
"""


def seed(conn: sqlite3.Connection, seeds: dict[str, Callable[[sqlite3.Connection], None]]) -> list[str]:
    """Run each named seeder once, in dict order. Returns names run this call.

    Seeders must be deterministic: stable ids and timestamps come from the
    fixture builders, never from the clock. Re-running is a no-op.
    """
    conn.execute(DDL)
    done = {row["name"] for row in conn.execute("SELECT name FROM seed_runs")}
    ran: list[str] = []
    for name, fn in seeds.items():
        if name in done:
            continue
        with conn:
            fn(conn)
            conn.execute("INSERT INTO seed_runs (name) VALUES (?)", (name,))
        ran.append(name)
    return ran
