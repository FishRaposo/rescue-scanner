"""pytest suite for the shared/db seam — runs inside each consumer repo too."""

from __future__ import annotations

import sqlite3

import pytest

from . import connect, migrate, migration_status, seed, transaction
from .repo import Repository


@pytest.fixture
def conn() -> sqlite3.Connection:
    c = connect()
    yield c
    c.close()


@pytest.fixture
def migrations(tmp_path):
    d = tmp_path / "migrations"
    d.mkdir()
    (d / "0001_items.sql").write_text(
        "CREATE TABLE items (id INTEGER PRIMARY KEY, tenant_id TEXT NOT NULL, title TEXT);"
    )
    (d / "0002_notes.sql").write_text(
        "CREATE TABLE notes (id INTEGER PRIMARY KEY, body TEXT);"
    )
    return d


def test_migrate_applies_in_order_and_is_idempotent(conn, migrations):
    assert migrate(conn, migrations) == ["0001_items.sql", "0002_notes.sql"]
    assert migrate(conn, migrations) == []
    status = migration_status(conn, migrations)
    assert [s["applied"] for s in status] == [True, True]


def test_migration_failure_rolls_back(conn, tmp_path):
    d = tmp_path / "migrations"
    d.mkdir()
    (d / "0001_bad.sql").write_text("CREATE TABLE t (x);\nTHIS IS NOT SQL;")
    with pytest.raises(Exception):
        migrate(conn, d)
    assert not conn.execute(
        "SELECT 1 FROM sqlite_master WHERE name='t'"
    ).fetchone()


def test_transaction_rolls_back_on_error(conn, migrations):
    migrate(conn, migrations)
    with pytest.raises(RuntimeError):
        with transaction(conn) as c:
            c.execute("INSERT INTO items (tenant_id, title) VALUES ('t1', 'x')")
            raise RuntimeError("boom")
    assert conn.execute("SELECT COUNT(*) AS n FROM items").fetchone()["n"] == 0


def test_seed_runs_once(conn):
    calls: list[str] = []
    ran = seed(conn, {"s1": lambda c: calls.append("s1")})
    assert ran == ["s1"] and calls == ["s1"]
    assert seed(conn, {"s1": lambda c: calls.append("again")}) == []
    assert calls == ["s1"]


def test_repository_scopes_to_tenant(conn, migrations):
    migrate(conn, migrations)
    repo = Repository(conn, "items", tenant_column="tenant_id").for_tenant("t1")
    repo.insert({"title": "mine"})
    Repository(conn, "items", tenant_column="tenant_id").for_tenant("t2").insert(
        {"title": "theirs"}
    )
    mine = repo.list()
    assert [r["title"] for r in mine] == ["mine"]
    assert repo.count() == 1
    # The other tenant's row is invisible through this scope.
    assert repo.get({"title": "theirs"}) is None
