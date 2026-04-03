from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.config import settings
from app.database import get_db
from app.models.assignment import Submission
from app.models.user import Role, User
from app.schemas.anti_cheat_analytics_schema import (
    AntiCheatAnalyticsDashboardResponse,
    AntiCheatAnalyticsOverview,
    EventBreakdownRow,
    LeaderboardEntry,
    ScoreDistributionBucket,
    SubmissionTimelineResponse,
    TimelineEventItem,
)
from app.services.anti_cheat_analytics_service import (
    assert_assignment_access,
    assert_submission_accessible,
    assignment_ids_visible_to,
    event_breakdown_rows,
    leaderboard_rows,
    score_distribution_buckets,
    submission_timeline,
    weighted_score_by_submission,
)

router = APIRouter(prefix="/anti-cheat/analytics", tags=["anti-cheat-analytics"])


def _empty_dashboard(threshold: float) -> AntiCheatAnalyticsDashboardResponse:
    return AntiCheatAnalyticsDashboardResponse(
        overview=AntiCheatAnalyticsOverview(
            assignment_scope="none",
            submissions_tracked=0,
            suspicious_count=0,
            max_weighted_score=0.0,
            total_weighted_score_mass=0.0,
        ),
        suspicious_threshold=threshold,
        distribution=[
            ScoreDistributionBucket(label="0–5", min_score=0.0, max_score=5.0, count=0),
            ScoreDistributionBucket(label="5–10", min_score=5.0, max_score=10.0, count=0),
            ScoreDistributionBucket(label="10–15", min_score=10.0, max_score=15.0, count=0),
            ScoreDistributionBucket(label="15+", min_score=15.0, max_score=None, count=0),
        ],
        event_breakdown=[],
        leaderboard=[],
    )


@router.get("/dashboard", response_model=AntiCheatAnalyticsDashboardResponse)
def get_analytics_dashboard(
    current_user: Annotated[User, Depends(require_role(Role.teacher, Role.admin))],
    db: Session = Depends(get_db),
    assignment_id: int | None = Query(default=None, gt=0),
    leaderboard_limit: int = Query(default=50, ge=1, le=200),
):
    threshold = float(settings.anti_cheat_max_violations)

    if assignment_id is not None and current_user.role == Role.teacher:
        assert_assignment_access(db, current_user, assignment_id)

    ids = assignment_ids_visible_to(db, current_user, assignment_id)
    if not ids:
        return _empty_dashboard(threshold)

    scope = "single" if assignment_id is not None else ("all_admin" if current_user.role == Role.admin else "all_teacher")

    score_by_sub = weighted_score_by_submission(db, ids)
    all_sub_ids = [r[0] for r in db.query(Submission.id).filter(Submission.assignment_id.in_(ids)).all()]
    scores = [score_by_sub.get(sid, 0.0) for sid in all_sub_ids]
    suspicious_count = sum(1 for s in scores if s >= threshold)
    max_score = max(scores) if scores else 0.0
    mass = sum(score_by_sub.values())

    overview = AntiCheatAnalyticsOverview(
        assignment_scope=scope,
        submissions_tracked=len(all_sub_ids),
        suspicious_count=suspicious_count,
        max_weighted_score=round(max_score, 2),
        total_weighted_score_mass=round(mass, 2),
    )

    dist_raw = score_distribution_buckets(scores)
    distribution = [ScoreDistributionBucket(**b) for b in dist_raw]

    eb = event_breakdown_rows(db, ids)
    event_breakdown = [EventBreakdownRow(event_type=et, count=c, weighted_contribution=w) for et, c, w in eb]

    lb_raw = leaderboard_rows(db, ids, score_by_sub, leaderboard_limit, threshold)
    leaderboard = [LeaderboardEntry(rank=i + 1, **row) for i, row in enumerate(lb_raw)]

    return AntiCheatAnalyticsDashboardResponse(
        overview=overview,
        suspicious_threshold=threshold,
        distribution=distribution,
        event_breakdown=event_breakdown,
        leaderboard=leaderboard,
    )


@router.get("/submissions/{submission_id}/timeline", response_model=SubmissionTimelineResponse)
def get_submission_timeline(
    submission_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher, Role.admin))],
    db: Session = Depends(get_db),
    assignment_id: int | None = Query(default=None, gt=0),
):
    if assignment_id is not None and current_user.role == Role.teacher:
        assert_assignment_access(db, current_user, assignment_id)

    ids = assignment_ids_visible_to(db, current_user, assignment_id)
    sub = assert_submission_accessible(db, submission_id, ids)
    events = submission_timeline(db, submission_id)
    return SubmissionTimelineResponse(
        submission_id=sub.id,
        assignment_id=sub.assignment_id,
        events=[
            TimelineEventItem(
                id=e.id,
                event_type=e.event_type,
                meta=e.meta or {},
                created_at=e.created_at,
            )
            for e in events
        ],
    )
