from datetime import datetime

from pydantic import BaseModel, Field


class AntiCheatAnalyticsOverview(BaseModel):
    assignment_scope: str = Field(description="'none' | 'single' | 'all_teacher' | 'all_admin'")
    submissions_tracked: int
    suspicious_count: int
    max_weighted_score: float
    total_weighted_score_mass: float


class ScoreDistributionBucket(BaseModel):
    label: str
    min_score: float
    max_score: float | None = None
    count: int


class EventBreakdownRow(BaseModel):
    event_type: str
    count: int
    weighted_contribution: float


class LeaderboardEntry(BaseModel):
    rank: int
    submission_id: int
    assignment_id: int
    user_id: int
    full_name: str
    email: str
    exam_title: str
    weighted_score: float
    suspicious: bool
    submitted_at: datetime | None = None


class AntiCheatAnalyticsDashboardResponse(BaseModel):
    overview: AntiCheatAnalyticsOverview
    suspicious_threshold: float
    distribution: list[ScoreDistributionBucket]
    event_breakdown: list[EventBreakdownRow]
    leaderboard: list[LeaderboardEntry]


class TimelineEventItem(BaseModel):
    id: int
    event_type: str
    meta: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmissionTimelineResponse(BaseModel):
    submission_id: int
    assignment_id: int
    events: list[TimelineEventItem]
