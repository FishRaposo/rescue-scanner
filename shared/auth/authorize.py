"""The one authorization seam: authorize(actor, action, resource).

Role and tenant checks are not scattered through handlers — every route,
tool call and UI-visible action goes through this function. A missing
membership denies; an action the role doesn't hold denies; a resource in a
different tenant denies. The rule table is injectable per app.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Actor:
    user_id: str
    role: str
    tenant_id: str | None = None


@dataclass(frozen=True)
class Resource:
    type: str
    tenant_id: str | None = None
    owner_id: str | None = None
    attrs: dict[str, Any] = field(default_factory=dict)


class PermissionDenied(Exception):
    pass


# Default matrix; each app may pass its own to authorize().
DEFAULT_RULES: dict[str, set[str]] = {
    "owner": {"read", "write", "admin", "billing"},
    "member": {"read", "write"},
    "viewer": {"read"},
}


def authorize(
    actor: Actor | None,
    action: str,
    resource: Resource,
    *,
    rules: dict[str, set[str]] | None = None,
) -> bool:
    """True only when the actor's role holds `action` AND the actor belongs to
    the resource's tenant. No actor or no membership → deny."""
    if actor is None:
        return False
    matrix = rules if rules is not None else DEFAULT_RULES
    if action not in matrix.get(actor.role, set()):
        return False
    if resource.tenant_id is not None and actor.tenant_id != resource.tenant_id:
        return False
    return True


def require(
    actor: Actor | None,
    action: str,
    resource: Resource,
    *,
    rules: dict[str, set[str]] | None = None,
) -> Actor:
    """authorize() or raise PermissionDenied. Returns the actor for chaining."""
    if not authorize(actor, action, resource, rules=rules):
        raise PermissionDenied(f"{action} on {resource.type} denied")
    assert actor is not None
    return actor
