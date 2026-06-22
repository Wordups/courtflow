import base64
from uuid import UUID

from fastapi import UploadFile
from fastapi.testclient import TestClient
from starlette.datastructures import Headers

from backend.app.config import Settings
from backend.app.uploads import read_validated_image, safe_storage_key
from backend.tests.conftest import ORG_ID, PROGRAM_ID


PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


def test_upload_route_validates_and_uses_generated_path(client):
    response = client.post(
        "/api/uploads/box-scores",
        data={"program_id": str(PROGRAM_ID)},
        files={"file": ("../../box.png", PNG, "image/png")},
    )
    assert response.status_code == 200
    key = response.json()["upload"]["storage_key"]
    assert key.startswith(f"orgs/{ORG_ID}/uploads/")
    assert ".." not in key and "box.png" not in key


def test_upload_rejects_unsupported_mime(client):
    response = client.post(
        "/api/uploads/box-scores",
        files={"file": ("box.gif", b"GIF89a", "image/gif")},
    )
    assert response.status_code == 415


def test_safe_storage_path_rejects_extension_injection():
    try:
        safe_storage_key(ORG_ID, UUID("50000000-0000-4000-8000-000000000001"), "../../png")
    except ValueError:
        pass
    else:
        raise AssertionError("unsafe extension was accepted")
