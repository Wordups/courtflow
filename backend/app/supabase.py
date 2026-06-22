from typing import Any
from uuid import UUID

import httpx
from fastapi import HTTPException

from .auth import CurrentUser, TenantContext
from .config import Settings


class SupabaseGateway:
    """REST gateway that forwards user JWTs so database RLS remains authoritative."""

    def __init__(self, settings: Settings):
        if not settings.supabase_url or not settings.supabase_anon_key:
            raise HTTPException(status_code=503, detail="Supabase is not configured")
        self.settings = settings
        self.base = settings.supabase_url.rstrip("/")
        self.anon_key = settings.supabase_anon_key.get_secret_value()

    def _headers(self, token: str, **extra: str) -> dict[str, str]:
        return {
            "apikey": self.anon_key,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            **extra,
        }

    def admin_headers(self, context: TenantContext) -> dict[str, str]:
        """Return bypass credentials only after a tenant grant already exists.

        Callers must still constrain every query by ``context.org_id`` because
        the service-role key bypasses RLS. Browser code never receives this key.
        """
        key = self.settings.supabase_service_role_key
        if key is None:
            raise HTTPException(status_code=503, detail="Server administration is not configured")
        secret = key.get_secret_value()
        return {"apikey": secret, "Authorization": f"Bearer {secret}", "Content-Type": "application/json"}

    async def _request(
        self,
        method: str,
        path: str,
        token: str,
        *,
        params: dict[str, str] | None = None,
        json: Any = None,
        content: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> Any:
        request_headers = self._headers(token)
        if headers:
            request_headers.update(headers)
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.request(
                method,
                f"{self.base}{path}",
                params=params,
                json=json,
                content=content,
                headers=request_headers,
            )
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail="Supabase operation failed")
        if not response.content:
            return None
        return response.json()

    async def memberships_for(self, user: CurrentUser) -> list[dict]:
        result = await self._request(
            "GET",
            "/rest/v1/memberships",
            user.token,
            params={"select": "org_id,role,status", "user_id": f"eq.{user.user_id}"},
        )
        return list(result or [])

    async def assert_program(self, context: TenantContext, program_id: UUID) -> dict:
        rows = await self._request(
            "GET",
            "/rest/v1/programs",
            context.user.token,
            params={
                "select": "id,org_id,name,code",
                "id": f"eq.{program_id}",
                "org_id": f"eq.{context.org_id}",
                "limit": "1",
            },
        )
        if not rows:
            raise HTTPException(status_code=404, detail="Program not found")
        return rows[0]

    async def list_programs(self, context: TenantContext) -> list[dict]:
        return list(await self._request(
            "GET", "/rest/v1/programs", context.user.token,
            params={"select": "*", "org_id": f"eq.{context.org_id}", "order": "sort_order,name"},
        ) or [])

    async def program_rows(self, context: TenantContext, program_id: UUID, resource: str) -> list[dict]:
        await self.assert_program(context, program_id)
        if resource not in {"players", "games"}:
            raise ValueError("Unsupported program resource")
        order = "name" if resource == "players" else "game_date.desc"
        return list(await self._request(
            "GET", f"/rest/v1/{resource}", context.user.token,
            params={"select": "*", "org_id": f"eq.{context.org_id}", "program_id": f"eq.{program_id}", "order": order},
        ) or [])

    async def create_upload(
        self,
        context: TenantContext,
        upload_id: UUID,
        program_id: UUID | None,
        storage_key: str,
        mime_type: str,
        data: bytes,
    ) -> dict:
        if program_id:
            await self.assert_program(context, program_id)
        await self._request(
            "POST",
            f"/storage/v1/object/{self.settings.storage_bucket}/{storage_key}",
            context.user.token,
            content=data,
            headers={"Content-Type": mime_type, "x-upsert": "false"},
        )
        rows = await self._request(
            "POST", "/rest/v1/uploads", context.user.token,
            json={
                "id": str(upload_id), "org_id": str(context.org_id),
                "program_id": str(program_id) if program_id else None,
                "storage_key": storage_key, "mime_type": mime_type,
                "byte_size": len(data), "status": "pending",
            },
            headers={"Prefer": "return=representation"},
        )
        return rows[0]

    async def update_upload(self, context: TenantContext, upload_id: UUID, values: dict) -> dict:
        rows = await self._request(
            "PATCH", "/rest/v1/uploads", context.user.token,
            params={"id": f"eq.{upload_id}", "org_id": f"eq.{context.org_id}"},
            json=values, headers={"Prefer": "return=representation"},
        )
        return rows[0] if rows else {}

    async def confirm_game(self, context: TenantContext, payload: dict, idempotency_key: str) -> dict:
        result = await self._request(
            "POST", "/rest/v1/rpc/confirm_game_from_upload", context.user.token,
            json={
                "p_org_id": str(context.org_id),
                "p_idempotency_key": idempotency_key,
                "p_payload": payload,
            },
        )
        return result or {}
