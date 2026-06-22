from functools import lru_cache
from typing import Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    app_version: str = "0.2.0"
    cors_allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    supabase_url: str | None = None
    supabase_anon_key: SecretStr | None = None
    supabase_service_role_key: SecretStr | None = None
    supabase_jwt_issuer: str | None = None
    supabase_jwt_audience: str = "authenticated"
    storage_bucket: str = "boxscores"

    max_upload_bytes: int = 8 * 1024 * 1024
    allowed_upload_mime: str = "image/jpeg,image/png,image/webp"

    ai_provider: Literal["anthropic", "disabled"] = "disabled"
    ai_model: str = "claude-sonnet-4-20250514"
    ai_api_key: SecretStr | None = None
    box_score_provider: Literal["anthropic", "disabled"] = "disabled"
    box_score_model: str = "claude-sonnet-4-20250514"
    box_score_api_key: SecretStr | None = None

    @property
    def cors_origins(self) -> list[str]:
        return [value.strip() for value in self.cors_allowed_origins.split(",") if value.strip()]

    @property
    def allowed_mime_types(self) -> set[str]:
        return {value.strip().lower() for value in self.allowed_upload_mime.split(",") if value.strip()}

    @property
    def jwt_issuer(self) -> str:
        if self.supabase_jwt_issuer:
            return self.supabase_jwt_issuer.rstrip("/")
        if not self.supabase_url:
            raise RuntimeError("SUPABASE_URL is required")
        return f"{self.supabase_url.rstrip('/')}/auth/v1"

    @property
    def jwks_url(self) -> str:
        return f"{self.jwt_issuer}/.well-known/jwks.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()
