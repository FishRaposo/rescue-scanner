"""pytest suite for the shared/auth seam — the role/tenant matrix every
consumer's tests extend."""

from __future__ import annotations

import pytest

from .audit import audit
from .authorize import Actor, PermissionDenied, Resource, authorize, require
from .session import create_session_token, read_session_token

OWNER = Actor("u-owner", "owner", "t1")
MEMBER = Actor("u-member", "member", "t1")
VIEWER = Actor("u-viewer", "viewer", "t1")
OUTSIDER = Actor("u-other", "owner", "t2")


def test_token_roundtrip_and_tamper():
    token = create_session_token("u1", "t1", "owner", secret="s", now=1000, ttl_seconds=60)
    payload = read_session_token(token, secret="s", now=1030)
    assert payload and payload["u"] == "u1" and payload["t"] == "t1"
    # Tampered payload or wrong secret → None
    assert read_session_token(token + "x", secret="s", now=1030) is None
    assert read_session_token(token, secret="other", now=1030) is None
    # Expired → None
    assert read_session_token(token, secret="s", now=2000) is None


def test_role_matrix():
    res = Resource("project", tenant_id="t1")
    assert authorize(OWNER, "admin", res)
    assert authorize(MEMBER, "write", res)
    assert not authorize(MEMBER, "admin", res)
    assert authorize(VIEWER, "read", res)
    assert not authorize(VIEWER, "write", res)


def test_no_membership_denies():
    res = Resource("project", tenant_id="t1")
    assert not authorize(OUTSIDER, "read", res)
    assert not authorize(None, "read", res)


def test_require_raises():
    res = Resource("project", tenant_id="t1")
    with pytest.raises(PermissionDenied):
        require(VIEWER, "write", res)
    assert require(OWNER, "admin", res) is OWNER


def test_audit_records_allow_and_deny(conn_for_audit):
    conn = conn_for_audit
    res = Resource("project", tenant_id="t1")
    audit(conn, OWNER, "write", res, "allow", "ok")
    audit(conn, OUTSIDER, "write", res, "deny", "cross-tenant")
    rows = list(conn.execute("SELECT actor_id, decision FROM audit_log ORDER BY id"))
    assert [(r["actor_id"], r["decision"]) for r in rows] == [
        ("u-owner", "allow"),
        ("u-other", "deny"),
    ]


@pytest.fixture
def conn_for_audit():
    from shared.db import connect  # consumer import path

    c = connect()
    yield c
    c.close()
