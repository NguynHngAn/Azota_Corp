from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.assignment import Assignment, Submission
from app.services.anti_cheat_service import submit_submission_now

def finalize_expired_submissions(db: Session, batch_size: int = 200) -> int:
    now = datetime.now(timezone.utc)
    subs = (
        db.query(Submission)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .filter(Submission.submitted_at.is_(None))
        .filter(Submission.started_at.is_not(None))
        .filter(Assignment.end_time <= now)   # hard window cutoff
        .limit(batch_size)
        .with_for_update(skip_locked=True)
        .all()
    )
    for s in subs:
        submit_submission_now(db, s, submit_reason="window_ended_background", auto_submitted=True)
    db.commit()
    return len(subs)