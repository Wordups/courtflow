from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .auth import TenantContext, get_tenant_context
from .config import Settings, get_settings
from .models import CoachRequest, CoachResponse, ConfirmGame
from .providers import ProviderService
from .supabase import SupabaseGateway
from .uploads import read_validated_image, safe_storage_key


def get_gateway(settings: Settings = Depends(get_settings)) -> SupabaseGateway:
    return SupabaseGateway(settings)


def get_providers(settings: Settings = Depends(get_settings)) -> ProviderService:
    return ProviderService(settings)


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    api = FastAPI(title="CourtFlow API", version=app_settings.app_version)
    api.state.settings = app_settings
    api.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "X-Organization-ID"],
    )

    @api.get("/")
    async def root() -> dict:
        return {"service": "courtflow-api", "health": "/health", "docs": "/docs"}

    @api.get("/health")
    async def health() -> dict:
        return {"status": "ok", "service": "courtflow-api", "version": app_settings.app_version}

    @api.get("/api/programs")
    async def list_programs(
        context: TenantContext = Depends(get_tenant_context),
        gateway: SupabaseGateway = Depends(get_gateway),
    ) -> list[dict]:
        return await gateway.list_programs(context)

    @api.get("/api/programs/{program_id}/roster")
    async def roster(
        program_id: UUID,
        context: TenantContext = Depends(get_tenant_context),
        gateway: SupabaseGateway = Depends(get_gateway),
    ) -> list[dict]:
        return await gateway.program_rows(context, program_id, "players")

    @api.get("/api/programs/{program_id}/games")
    async def games(
        program_id: UUID,
        context: TenantContext = Depends(get_tenant_context),
        gateway: SupabaseGateway = Depends(get_gateway),
    ) -> list[dict]:
        return await gateway.program_rows(context, program_id, "games")

    @api.post("/api/uploads/box-scores")
    async def upload_box_score(
        file: UploadFile = File(...),
        program_id: UUID | None = Form(default=None),
        context: TenantContext = Depends(get_tenant_context),
        gateway: SupabaseGateway = Depends(get_gateway),
        providers: ProviderService = Depends(get_providers),
        request_settings: Settings = Depends(get_settings),
    ) -> dict:
        data, mime_type, extension = await read_validated_image(file, request_settings)
        upload_id = uuid4()
        storage_key = safe_storage_key(context.org_id, upload_id, extension)
        upload = await gateway.create_upload(
            context, upload_id, program_id, storage_key, mime_type, data
        )
        try:
            parsed = await providers.parse_box_score(data, mime_type)
        except HTTPException as exc:
            await gateway.update_upload(context, upload_id, {"status": "error", "error": exc.detail})
            raise
        await gateway.update_upload(context, upload_id, {"status": "parsed", "parsed_json": parsed})
        return {"upload": upload, "draft": parsed}

    @api.post("/api/games/confirm")
    async def confirm_game(
        payload: ConfirmGame,
        idempotency_key: str = Header(alias="Idempotency-Key", min_length=8, max_length=200),
        context: TenantContext = Depends(get_tenant_context),
        gateway: SupabaseGateway = Depends(get_gateway),
    ) -> dict:
        await gateway.assert_program(context, payload.program_id)
        return await gateway.confirm_game(
            context,
            payload.model_dump(mode="json", exclude_none=True),
            idempotency_key,
        )

    @api.post("/api/ai/coach", response_model=CoachResponse)
    async def coach(
        payload: CoachRequest,
        _context: TenantContext = Depends(get_tenant_context),
        providers: ProviderService = Depends(get_providers),
    ) -> CoachResponse:
        return CoachResponse(reply=await providers.coach(payload))

    return api


app = create_app()
