"""Audit-log helper: one table for allow/deny and billing events."""

from __future__ import annotations

import sqlite3

DDL = """
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    actor_id TEXT NOT NULL,
    role TEXT NOT NULL,
    actor_tenant TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_tenant TEXT,
    decision TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT ''
)
"""


def ensure_audit_table(conn: sqlite3.Connection) -> None:
    conn.execute(DDL)


def audit(
    conn: sqlite3.Connection,
    actor: "object",
    action: str,
    resource: "object",
    decision: str,
    detail: str = "",
    *,
    ts: str | None = None,
) -> int:
    """Record one allow/deny/billing event. `decision` is 'allow' or 'deny'
    (a billing event may use its own verb). Returns the row id."""
    ensure_audit_table(conn)
    actor_id = getattr(actor, "user_id", "anonymous") if actor else "anonymous"
    role = getattr(actor, "role", "none") if actor else "none"
    actor_tenant = getattr(actor, "tenant_id", None) if actor else None
    resource_type = getattr(resource, "type", "unknown")
    resource_tenant = getattr(resource, "tenant_id", None)
    if ts is None:
        cur = conn.execute(
            "INSERT INTO audit_log (actor_id, role, actor_tenant, action, "
            "resource_type, resource_tenant, decision, detail) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (actor_id, role, actor_tenant, action, resource_type,
             resource_tenant, decision, detail),
        )
    else:
        cur = conn.execute(
            "INSERT INTO audit_log (ts, actor_id, role, actor_tenant, action, "
            "resource_type, resource_tenant, decision, detail) "
            "VALUES (?,?,?,?,?,?,?,?,?)",
            (ts, actor_id, role, actor_tenant, action, resource_type,
             resource_tenant, decision, detail),
        )
    return int(cur.lastrowid or 0)
