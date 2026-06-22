from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=8000)


class CoachPlayer(BaseModel):
    id: str
    name: str = Field(max_length=200)
    position: str | None = Field(default=None, max_length=100)
    age: int | None = Field(default=None, ge=3, le=100)
    goal: str | None = Field(default=None, max_length=1000)
    weaknesses: str | None = Field(default=None, max_length=2000)
    skills: dict[str, int] = Field(default_factory=dict)


class CoachDrill(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    title: str = Field(max_length=300)
    category: str | None = Field(default=None, max_length=100)
    attached_to: list[str] = Field(default_factory=list, validation_alias="attachedTo", serialization_alias="attachedTo", max_length=100)


class CoachContext(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    players: list[CoachPlayer] = Field(default_factory=list, max_length=100)
    drill_links: list[CoachDrill] = Field(default_factory=list, validation_alias="drillLinks", serialization_alias="drillLinks", max_length=200)


class CoachRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    sport: str = Field(min_length=1, max_length=50)
    assistant_name: str = Field(validation_alias="assistantName", serialization_alias="assistantName", min_length=1, max_length=50)
    message: str = Field(min_length=1, max_length=8000)
    messages: list[ChatMessage] = Field(default_factory=list, max_length=20)
    context: CoachContext = Field(default_factory=CoachContext)


class CoachResponse(BaseModel):
    reply: str


class ConfirmPlayer(BaseModel):
    player_id: UUID | None = None
    create_as: dict[str, Any] | None = None
    stats: dict[str, int] = Field(default_factory=dict)


class ConfirmGame(BaseModel):
    upload_id: UUID | None = None
    program_id: UUID
    opponent: str = Field(min_length=1, max_length=200)
    game_date: str | None = None
    us_score: int | None = Field(default=None, ge=0)
    them_score: int | None = Field(default=None, ge=0)
    tournament: str | None = Field(default=None, max_length=200)
    players: list[ConfirmPlayer] = Field(default_factory=list, max_length=100)

    @field_validator("game_date")
    @classmethod
    def valid_iso_date(cls, value: str | None) -> str | None:
        if value is None:
            return value
        from datetime import date
        date.fromisoformat(value)
        return value
