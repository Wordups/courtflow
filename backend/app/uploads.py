from io import BytesIO
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from .config import Settings


MIME_FORMATS = {
    "image/jpeg": ("JPEG", "jpg"),
    "image/png": ("PNG", "png"),
    "image/webp": ("WEBP", "webp"),
}


async def read_validated_image(file: UploadFile, settings: Settings) -> tuple[bytes, str, str]:
    declared = (file.content_type or "").lower()
    if declared not in settings.allowed_mime_types or declared not in MIME_FORMATS:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are accepted")
    chunks: list[bytes] = []
    total = 0
    while chunk := await file.read(64 * 1024):
        total += len(chunk)
        if total > settings.max_upload_bytes:
            raise HTTPException(status_code=413, detail="Upload exceeds the configured size limit")
        chunks.append(chunk)
    if not chunks:
        raise HTTPException(status_code=400, detail="Upload is empty")
    data = b"".join(chunks)
    expected_format, extension = MIME_FORMATS[declared]
    try:
        with Image.open(BytesIO(data)) as image:
            image.verify()
            actual_format = image.format
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=415, detail="Upload content is not a valid image") from exc
    if actual_format != expected_format:
        raise HTTPException(status_code=415, detail="Declared MIME type does not match the image")
    return data, declared, extension


def safe_storage_key(org_id: UUID, upload_id: UUID, extension: str) -> str:
    if extension not in {"jpg", "png", "webp"}:
        raise ValueError("Unsupported extension")
    return f"orgs/{org_id}/uploads/{upload_id}/original.{extension}"
