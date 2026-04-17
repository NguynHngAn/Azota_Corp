# backend/app/services/assignment_timeout_worker.py
from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.assignment import Submission
from app.models.anti_cheat import AntiCheatEvent
from app.services.assignment_service import finalize_submission

def finalize_expired_submissions(db: Session, batch_size: int = 200) -> int:
    now = datetime.now(timezone.utc)
    heartbeat_missed_threshold = timedelta(seconds=30)
    created_events = False

    subs = (
        db.query(Submission)
        .filter(Submission.submitted_at.is_(None))
        .filter(Submission.started_at.is_not(None))
        .filter(Submission.deadline_at.is_not(None))
        .filter(Submission.deadline_at <= now)
        .with_for_update(skip_locked=True)
        .limit(batch_size)
        .all()
    )

    finalized = 0
    for submission in subs:
        if (
            submission.last_heartbeat_at is not None
            and now - submission.last_heartbeat_at > heartbeat_missed_threshold
        ):
            try:
                with db.begin_nested():
                    db.add(
                        AntiCheatEvent(
                            assignment_id=submission.assignment_id,
                            submission_id=submission.id,
                            user_id=submission.user_id,
                            event_type="HEARTBEAT_MISSED",
                            meta={"source": "timeout_worker"},
                        )
                    )
                created_events = True
            except IntegrityError:
                # Another worker already inserted HEARTBEAT_MISSED for this submission.
                pass
        did_finalize = finalize_submission(
            db,
            submission=submission,
            submit_reason="window_ended_background",
            auto_submitted=True,
        )
        if did_finalize:
            finalized += 1

    if finalized > 0 or created_events:
        db.commit()
    return finalized