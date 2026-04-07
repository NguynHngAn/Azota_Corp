from datetime import datetime

from pydantic import BaseModel, Field

from typing import Literal


AntiCheatEventType = Literal[
    "EXAM_START", "EXAM_SUBMIT", "TAB_HIDDEN", "FULLSCREEN_EXIT", "WINDOW_BLUR",
    "COPY_ATTEMPT", "CUT_ATTEMPT", "PASTE_ATTEMPT", "CONTEXT_MENU", "TEXT_SELECTION", "DEVTOOLS_DETECTED",
    "COPY_BLOCKED",
    "PASTE_BLOCKED",
    "CUT_BLOCKED",
    "CONTEXT_MENU_BLOCKED",
]

class AntiCheatEventCreate(BaseModel):
    assignment_id: int = Field(..., gt=0)
    submission_id: int | None = Field(default=None, gt=0)
    # event_type: AntiCheatEventType = Field(..., min_length=1, max_length=64)
    event_type: AntiCheatEventType 
    meta: dict = Field(default_factory=dict)


class AntiCheatEventResponse(BaseModel):
    id: int
    assignment_id: int
    submission_id: int | None
    user_id: int
    event_type: AntiCheatEventType
    meta: dict
    created_at: datetime
    violation_weighted_score: float = 0.0
    violation_count: int = 0
    auto_submitted: bool = False

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
    last_event_type: AntiCheatEventType | None
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
