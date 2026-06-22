from fastapi.testclient import TestClient

from backend.app.config import Settings
from backend.app.main import create_app


def test_health_has_no_supabase_dependency():
    client = TestClient(create_app(Settings(supabase_url=None, supabase_anon_key=None)))
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_tenant_route_requires_bearer_token():
    client = TestClient(create_app(Settings()))
    response = client.get("/api/programs")
    assert response.status_code == 401


def test_cors_allows_configured_origin_only(settings):
    client = TestClient(create_app(settings))
    allowed = client.options(
        "/api/programs",
        headers={
            "Origin": "https://courtflow.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    denied = client.options(
        "/api/programs",
        headers={
            "Origin": "https://evil.example",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert allowed.headers["access-control-allow-origin"] == "https://courtflow.example"
    assert "access-control-allow-origin" not in denied.headers
