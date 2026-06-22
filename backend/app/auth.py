from dataclasses import dataclass
from functools import lru_cache
from uuid import UUID

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from .config import Settings, get_settings


bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    user_id: UUID
    token: str
    email: str | None = None


@dataclass(frozen=True)
class TenantContext:
    user: CurrentUser
    org_id: UUID
    role: str


@lru_cache(maxsize=8)
def _jwk_client(url: str) -> PyJWKClient:
    return PyJWKClient(url, cache_keys=True)


def decode_supabase_jwt(token: str, settings: Settings) -> dict:
    try:
        signing_key = _jwk_client(settings.jwks_url).get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience=settings.supabase_jwt_audience,
            issuer=settings.jwt_issuer,
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    claims = decode_supabase_jwt(credentials.credentials, settings)
    try:
        user_id = UUID(str(claims["sub"]))
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Token subject is invalid") from exc
    return CurrentUser(user_id=user_id, token=credentials.credentials, email=claims.get("email"))


async def get_tenant_context(
    user: CurrentUser = Depends(get_current_user),
    organization_id: UUID | None = Header(default=None, alias="X-Organization-ID"),
    settings: Settings = Depends(get_settings),
) -> TenantContext:
    from .supabase import SupabaseGateway

    gateway = SupabaseGateway(settings)
    memberships = await gateway.memberships_for(user)
    active = [row for row in memberships if row.get("status", "active") == "active"]
    if organization_id is not None:
        active = [row for row in active if str(row.get("org_id")) == str(organization_id)]
    if not active:
        raise HTTPException(status_code=403, detail="No active membership for this organization")
    if organization_id is None and len(active) != 1:
        raise HTTPException(status_code=400, detail="X-Organization-ID is required for multi-organization users")
    row = active[0]
    return TenantContext(user=user, org_id=UUID(str(row["org_id"])), role=str(row["role"]))
