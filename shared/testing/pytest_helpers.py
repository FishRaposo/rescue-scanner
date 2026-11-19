"""Shared pytest helpers for consumer backends. A repo's conftest.py wires
them to its own migrations dir and app factory:

    from shared.testing.pytest_helpers import migrated_conn, api_client

    @pytest.fixture
    def conn(tmp_path):
        yield from migrated_conn(tmp_path, "backend/migrations")

    @pytest.fixture
    def client():
        from backend.main import create_app
        return api_client(create_app())
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from collections.abc import Iterator


def migrated_conn(
    tmp_path: Path, migrations_dir: str | Path
) -> Iterator[sqlite3.Connection]:
    """A file-backed connection migrated to the repo's schema, closed after."""
    from shared.db import connect, migrate

    conn = connect(tmp_path / "test.db")
    migrate(conn, migrations_dir)
    yield conn
    conn.close()


def api_client(app):  # noqa: ANN001, ANN201 — FastAPI TestClient, dep is consumer-side
    from fastapi.testclient import TestClient

    return TestClient(app)
