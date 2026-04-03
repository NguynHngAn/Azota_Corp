from datetime import datetime

from pydantic import BaseModel, Field


class AntiCheatEventCreate(BaseModel):
    assignment_id: int = Field(..., gt=0)
    submission_id: int | None = Field(default=None, gt=0)
    event_type: str = Field(..., min_length=1, max_length=64)
    meta: dict = Field(default_factory=dict)


class AntiCheatEventResponse(BaseModel):
    id: int
    assignment_id: int
    submission_id: int | None
    user_id: int
    event_type: str
    meta: dict
    created_at: datetime
    violation_count: int | None = None
    auto_submitted: bool | None = None

    model_config = {"from_attributes": True}


class AntiCheatMonitorRow(BaseModel):
    user_id: int
    full_name: str
    email: str
    class_id: int
    class_name: str
    assignment_id: int
    exam_title: str
    submission_id: int | None
    started_at: datetime | None
    submitted_at: datetime | None
    events_total: int
    last_event_type: str | None
    last_event_at: datetime | None
    suspicious: bool
    violation_count: int = 0
    auto_submitted: bool = False
    submit_reason: str | None = None


class AntiCheatMonitorSummary(BaseModel):
    total_students: int
    active_now: int
    submitted: int
    suspicious: int


class AntiCheatMonitorResponse(BaseModel):
    summary: AntiCheatMonitorSummary
    rows: list[AntiCheatMonitorRow]

