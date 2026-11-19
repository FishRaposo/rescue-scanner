"""Tenant-scoped repository helper. Repositories always take a
tenant/workspace scope where the domain has one — callers cannot list another
tenant's rows through this class."""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass, field
from typing import Any


@dataclass
class Repository:
    """Thin, parameterized CRUD over one table.

    `tenant_column` scopes every read/write to a tenant; `for_tenant` returns a
    bound copy so a handler holds exactly one scope. Table/column names come
    from code, never user input — only values are parameterized.
    """

    conn: sqlite3.Connection
    table: str
    tenant_column: str | None = None
    _tenant: Any = field(default=None, repr=False)

    def for_tenant(self, tenant_id: Any) -> "Repository":
        if self.tenant_column is None:
            raise ValueError(f"{self.table} has no tenant column")
        return Repository(self.conn, self.table, self.tenant_column, tenant_id)

    def _scope(self, where: dict[str, Any] | None) -> tuple[str, list[Any]]:
        clauses: list[str] = []
        values: list[Any] = []
        if self.tenant_column is not None and self._tenant is not None:
            clauses.append(f"{self.tenant_column} = ?")
            values.append(self._tenant)
        for col, val in (where or {}).items():
            clauses.append(f"{col} = ?")
            values.append(val)
        sql = " AND ".join(clauses) if clauses else "1=1"
        return sql, values

    def insert(self, row: dict[str, Any]) -> int:
        data = dict(row)
        if self.tenant_column is not None and self._tenant is not None:
            data[self.tenant_column] = self._tenant
        cols = ", ".join(data)
        marks = ", ".join("?" for _ in data)
        cur = self.conn.execute(
            f"INSERT INTO {self.table} ({cols}) VALUES ({marks})", list(data.values())
        )
        return int(cur.lastrowid or 0)

    def get(self, where: dict[str, Any]) -> sqlite3.Row | None:
        sql, values = self._scope(where)
        return self.conn.execute(
            f"SELECT * FROM {self.table} WHERE {sql} LIMIT 1", values
        ).fetchone()

    def list(
        self,
        where: dict[str, Any] | None = None,
        *,
        order_by: str | None = None,
        limit: int = 100,
    ) -> list[sqlite3.Row]:
        sql, values = self._scope(where)
        order = f" ORDER BY {order_by}" if order_by else ""
        return list(
            self.conn.execute(
                f"SELECT * FROM {self.table} WHERE {sql}{order} LIMIT ?",
                [*values, limit],
            )
        )

    def update(self, where: dict[str, Any], changes: dict[str, Any]) -> int:
        sql, values = self._scope(where)
        sets = ", ".join(f"{c} = ?" for c in changes)
        cur = self.conn.execute(
            f"UPDATE {self.table} SET {sets} WHERE {sql}",
            [*changes.values(), *values],
        )
        return cur.rowcount

    def delete(self, where: dict[str, Any]) -> int:
        sql, values = self._scope(where)
        cur = self.conn.execute(f"DELETE FROM {self.table} WHERE {sql}", values)
        return cur.rowcount

    def count(self, where: dict[str, Any] | None = None) -> int:
        sql, values = self._scope(where)
        row = self.conn.execute(
            f"SELECT COUNT(*) AS n FROM {self.table} WHERE {sql}", values
        ).fetchone()
        return int(row["n"])
