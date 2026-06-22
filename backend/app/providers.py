import base64
import json
from typing import Any

import httpx
from fastapi import HTTPException

from .config import Settings
from .models import CoachRequest
from .parser import EXTRACTION_PROMPT, parse_provider_json


def _anthropic_text(payload: dict) -> str:
    return "".join(block.get("text", "") for block in payload.get("content", []) if block.get("type") == "text").strip()


class ProviderService:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def _anthropic(self, api_key: str, model: str, messages: list[dict], max_tokens: int) -> str:
        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key": api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                json={"model": model, "max_tokens": max_tokens, "messages": messages},
            )
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail="AI provider request failed")
        text = _anthropic_text(response.json())
        if not text:
            raise HTTPException(status_code=502, detail="AI provider returned no text")
        return text

    async def coach(self, request: CoachRequest) -> str:
        if self.settings.ai_provider != "anthropic" or self.settings.ai_api_key is None:
            raise HTTPException(status_code=503, detail="AI coach provider is not configured")
        context = request.context.model_dump(by_alias=True)
        system = (
            f"You are {request.assistant_name}, a concise {request.sport} development coach. "
            "Use only the supplied context, avoid medical claims, and give practical coaching steps."
        )
        history = [message.model_dump() for message in request.messages[-8:]]
        history.append({"role": "user", "content": f"Context: {json.dumps(context, separators=(',', ':'))}\n\nRequest: {request.message}"})
        messages = [{"role": "user", "content": system}, {"role": "assistant", "content": "Understood."}, *history]
        return await self._anthropic(
            self.settings.ai_api_key.get_secret_value(), self.settings.ai_model, messages, 1800
        )

    async def parse_box_score(self, data: bytes, mime_type: str) -> dict[str, Any]:
        if self.settings.box_score_provider != "anthropic" or self.settings.box_score_api_key is None:
            raise HTTPException(status_code=503, detail="Box-score provider is not configured")
        encoded = base64.standard_b64encode(data).decode("ascii")
        content = [
            {"type": "image", "source": {"type": "base64", "media_type": mime_type, "data": encoded}},
            {"type": "text", "text": EXTRACTION_PROMPT},
        ]
        text = await self._anthropic(
            self.settings.box_score_api_key.get_secret_value(),
            self.settings.box_score_model,
            [{"role": "user", "content": content}],
            4000,
        )
        try:
            return parse_provider_json(text)
        except (ValueError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=422, detail="Box-score provider returned invalid data") from exc
