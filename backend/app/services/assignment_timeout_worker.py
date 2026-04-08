# backend/app/services/assignment_timeout_worker.py
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.assignment import Assignment, Submission
from app.services.anti_cheat_service import submit_submission_now
from sqlalchemy import func

def finalize_expired_submissions(db: Session, batch_size: int = 200) -> int:
    now = datetime.now(timezone.utc)

    deadline = func.least(
        Submission.started_at + func.make_interval(mins=Assignment.duration_minutes),
        Assignment.end_time,
    )

    subs = (
        db.query(Submission)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .filter(Submission.submitted_at.is_(None))
        .filter(Submission.started_at.is_not(None))
        .filter(deadline <= now)
        .with_for_update(skip_locked=True)
        .limit(batch_size)
        .all()
    )

    finalized = 0
    for submission in subs:
        submit_submission_now(
            db,
            submission,
            submit_reason="window_ended_background",
            auto_submitted=True,
        )
        finalized += 1

    if finalized:
        db.commit()
    return finalized