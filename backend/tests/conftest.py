from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from backend.app.auth import CurrentUser, TenantContext, get_tenant_context
from backend.app.config import Settings, get_settings
from backend.app.main import create_app, get_gateway, get_providers


ORG_ID = UUID("10000000-0000-4000-8000-000000000001")
USER_ID = UUID("30000000-0000-4000-8000-000000000001")
PROGRAM_ID = UUID("20000000-0000-4000-8000-000000000011")


class FakeGateway:
    def __init__(self):
        self.confirmations: dict[str, dict] = {}
        self.uploads: dict[str, dict] = {}

    async def list_programs(self, context):
        return [{"id": str(PROGRAM_ID), "org_id": str(context.org_id), "name": "Varsity Girls"}]

    async def assert_program(self, context, program_id):
        if context.org_id != ORG_ID or program_id != PROGRAM_ID:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Program not found")
        return {"id": str(program_id), "org_id": str(context.org_id)}

    async def program_rows(self, context, program_id, resource):
        await self.assert_program(context, program_id)
        return []

    async def create_upload(self, context, upload_id, program_id, storage_key, mime_type, data):
        if program_id:
            await self.assert_program(context, program_id)
        record = {"id": str(upload_id), "org_id": str(context.org_id), "storage_key": storage_key}
        self.uploads[str(upload_id)] = record
        return record

    async def update_upload(self, context, upload_id, values):
        self.uploads[str(upload_id)].update(values)
        return self.uploads[str(upload_id)]

    async def confirm_game(self, context, payload, idempotency_key):
        if idempotency_key in self.confirmations:
            return {**self.confirmations[idempotency_key], "idempotent_replay": True}
        result = {"game_id": "40000000-0000-4000-8000-000000000001", "stat_lines": len(payload["players"]), "idempotent_replay": False}
        self.confirmations[idempotency_key] = result
        return result


class FakeProviders:
    async def coach(self, payload):
        return f"Plan for {payload.message}"

    async def parse_box_score(self, data, mime_type):
        return {"meta": {}, "teams": [{"name": "Miller", "players": []}, {"name": "Visitor", "players": []}]}


@pytest.fixture
def settings():
    return Settings(
        cors_allowed_origins="https://courtflow.example,http://localhost:5173",
        max_upload_bytes=1024 * 1024,
    )


@pytest.fixture
def gateway():
    return FakeGateway()


@pytest.fixture
def client(settings, gateway):
    app = create_app(settings)
    context = TenantContext(CurrentUser(USER_ID, "test-token"), ORG_ID, "coach")
    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[get_tenant_context] = lambda: context
    app.dependency_overrides[get_gateway] = lambda: gateway
    app.dependency_overrides[get_providers] = FakeProviders
    with TestClient(app) as test_client:
        yield test_client
