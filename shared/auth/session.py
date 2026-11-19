"""Signed local session tokens — HMAC-SHA256, standard library only.

Token format: base64url(payload_json) + "." + hex(hmac_sha256(secret, payload_b64)).
Payload: {"u": user_id, "t": tenant_id, "r": role, "exp": unix_ts}.

Local seeded credentials only — there is no signup, no password check at this
layer. A tampered or expired token reads as `None`, never as a partial user.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

COOKIE_NAME = "session"
DEFAULT_TTL = 8 * 3600
# Development-only default; every repo documents it and never deploys with it.
DEV_SECRET = "local-dev-secret-not-for-production"


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _unb64(text: str) -> bytes:
    pad = "=" * (-len(text) % 4)
    return base64.urlsafe_b64decode(text + pad)


def _sign(payload_b64: str, secret: str) -> str:
    return hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()


def create_session_token(
    user_id: str,
    tenant_id: str | None,
    role: str,
    *,
    secret: str = DEV_SECRET,
    ttl_seconds: int = DEFAULT_TTL,
    now: int | None = None,
) -> str:
    issued = int(time.time()) if now is None else now
    payload = {"u": user_id, "t": tenant_id, "r": role, "exp": issued + ttl_seconds}
    body = _b64(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode())
    return f"{body}.{_sign(body, secret)}"


def read_session_token(
    token: str,
    *,
    secret: str = DEV_SECRET,
    now: int | None = None,
) -> dict[str, str | int | None] | None:
    """Verify signature and expiry. Returns the payload or `None`."""
    if not token or "." not in token:
        return None
    body, sig = token.rsplit(".", 1)
    if not hmac.compare_digest(sig, _sign(body, secret)):
        return None
    try:
        payload = json.loads(_unb64(body))
    except (ValueError, json.JSONDecodeError):
        return None
    exp = payload.get("exp")
    if not isinstance(exp, int):
        return None
    current = int(time.time()) if now is None else now
    if current >= exp:
        return None
    return payload
