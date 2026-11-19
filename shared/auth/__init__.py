"""Local auth seam: signed session tokens, one authorize() decision point,
seeded users and an audit-log helper. Framework-agnostic — the backend starter
wires these to FastAPI."""

from .audit import audit, ensure_audit_table
from .authorize import Actor, PermissionDenied, Resource, authorize, require
from .session import create_session_token, read_session_token

__all__ = [
    "Actor",
    "Resource",
    "PermissionDenied",
    "authorize",
    "require",
    "audit",
    "ensure_audit_table",
    "create_session_token",
    "read_session_token",
]
