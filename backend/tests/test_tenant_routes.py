from backend.tests.conftest import PROGRAM_ID


def test_program_reads_are_tenant_scoped(client):
    response = client.get("/api/programs")
    assert response.status_code == 200
    assert response.json()[0]["id"] == str(PROGRAM_ID)


def test_cross_tenant_program_identifier_is_rejected(client):
    response = client.get("/api/programs/20000000-0000-4000-8000-000000000099/roster")
    assert response.status_code == 404


def test_confirm_is_idempotent(client):
    payload = {
        "program_id": str(PROGRAM_ID),
        "opponent": "North County",
        "us_score": 58,
        "them_score": 44,
        "players": [],
    }
    headers = {"Idempotency-Key": "game-north-county-2026-01-08"}
    first = client.post("/api/games/confirm", json=payload, headers=headers)
    second = client.post("/api/games/confirm", json=payload, headers=headers)
    assert first.status_code == 200
    assert first.json()["idempotent_replay"] is False
    assert second.json()["idempotent_replay"] is True
