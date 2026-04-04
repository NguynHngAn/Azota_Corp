from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.anti_cheat import AntiCheatEvent
from app.models.assignment import Submission
from app.services.grading_service import grade_submission

# Server-side weights for enforcement scoring. Types not listed contribute 0.
EVENT_WEIGHTS: dict[str, float] = {
    "TAB_HIDDEN": 1.0,
    "FULLSCREEN_EXIT": 1.5,
    "WINDOW_BLUR": 1.0,
    "COPY_ATTEMPT": 1.5,
    "CUT_ATTEMPT": 1.5,
    "PASTE_ATTEMPT": 2.0,
    "CONTEXT_MENU": 0.75,
    "TEXT_SELECTION": 0.5,
    "DEVTOOLS_DETECTED": 3.0,
}

VIOLATION_EVENT_TYPES: frozenset[str] = frozenset(EVENT_WEIGHTS.keys())


def submission_violation_metrics(db: Session, submission_id: int) -> tuple[float, int]:
    """Return (weighted_score, count of events that carry a positive weight)."""
    rows = db.query(AntiCheatEvent.event_type).filter(AntiCheatEvent.submission_id == submission_id).all()
    score = 0.0
    scoring_n = 0
    for (et,) in rows:
        w = EVENT_WEIGHTS.get(et, 0.0)
        score += w
        if w > 0:
            scoring_n += 1
    return round(score, 2), scoring_n


def count_recent_events_for_rate_limit(
    db: Session,
    *,
    assignment_id: int,
    user_id: int,
    submission_id: int | None,
    window_seconds: int,
) -> int:
    since = datetime.now(timezone.utc) - timedelta(seconds=window_seconds)
    q = db.query(func.count(AntiCheatEvent.id)).filter(
        AntiCheatEvent.created_at >= since,
        AntiCheatEvent.user_id == user_id,
        AntiCheatEvent.assignment_id == assignment_id,
    )
    if submission_id is not None:
        q = q.filter(AntiCheatEvent.submission_id == submission_id)
    return q.scalar() or 0


def submit_submission_now(
    db: Session,
    submission: Submission,
    *,
    submit_reason: str,
    auto_submitted: bool,
) -> Submission:
    if submission.submitted_at:
        return submission
    submission.submitted_at = datetime.now(timezone.utc)
    submission.auto_submitted = auto_submitted
    submission.submit_reason = submit_reason
    exam = submission.assignment.exam
    for question in exam.questions:
        _ = question.options
    score, _ = grade_submission(submission, exam)
    submission.score = score
    db.flush()
    return submission
