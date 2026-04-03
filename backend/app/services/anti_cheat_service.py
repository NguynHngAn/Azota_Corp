from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.anti_cheat import AntiCheatEvent
from app.models.assignment import Submission
from app.services.assignment_service import is_submission_expired
from app.services.grading_service import grade_submission

VIOLATION_EVENT_TYPES = {
    "FULLSCREEN_EXIT",
    "TAB_HIDDEN",
    "WINDOW_BLUR",
    "COPY_BLOCKED",
    "PASTE_BLOCKED",
    "CUT_BLOCKED",
    "CONTEXT_MENU_BLOCKED",
}


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


def register_violation_and_maybe_submit(
    db: Session,
    submission: Submission,
    event: AntiCheatEvent,
) -> tuple[int, bool]:
    if event.event_type not in VIOLATION_EVENT_TYPES:
        return submission.violation_count, False

    submission.violation_count += 1
    auto_submitted = False
    if submission.violation_count >= submission.assignment.max_violations and not submission.submitted_at:
        submit_submission_now(
            db,
            submission,
            submit_reason="anti_cheat_violation_limit",
            auto_submitted=True,
        )
        auto_submitted = True
    elif is_submission_expired(submission) and not submission.submitted_at:
        submit_submission_now(
            db,
            submission,
            submit_reason="time_limit_reached",
            auto_submitted=True,
        )
        auto_submitted = True
    return submission.violation_count, auto_submitted
