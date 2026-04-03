import hashlib
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.assignment import Assignment, Submission, SubmissionAnswer
from app.schemas.assignment_schema import SubmitPayload, SubmissionAnswerPayload
from app.services.grading_service import grade_submission
from app.models.class_model import Class, ClassMember
from app.models.exam import Exam
from app.models.user import User


def _rng_from_seed_key(seed_key: str) -> random.Random:
    digest = hashlib.sha256(seed_key.encode("utf-8")).digest()
    seed_int = int.from_bytes(digest[:8], "big")
    return random.Random(seed_int)


def questions_display_order_for_submission(exam: Exam, submission_id: int):
    """Read-only: copy question list from ORM, shuffle deterministically; do not mutate relationships."""
    questions = list(exam.questions)
    _rng_from_seed_key(f"azota:examshuffle:v1:submission:{submission_id}:questions").shuffle(questions)
    return questions


def options_display_order_for_question(q, submission_id: int):
    """Read-only: copy options list from ORM, shuffle deterministically; do not mutate relationships."""
    opts = list(q.options)
    _rng_from_seed_key(f"azota:examshuffle:v1:submission:{submission_id}:question:{q.id}:options").shuffle(opts)
    return opts


def can_manage_assignment(current_user: User, assignment: Assignment) -> bool:
    if current_user.role.value == "admin":
        return True
    return assignment.exam.created_by == current_user.id


def is_in_class(db: Session, class_id: int, user_id: int) -> bool:
    return db.query(ClassMember).filter(ClassMember.class_id == class_id, ClassMember.user_id == user_id).first() is not None


def upsert_submission_answers_only(db: Session, submission_id: int, body: SubmitPayload) -> None:
    for item in body.answers:
        existing = db.query(SubmissionAnswer).filter(
            SubmissionAnswer.submission_id == submission_id,
            SubmissionAnswer.question_id == item.question_id,
        ).first()
        if existing:
            existing.chosen_option_ids = item.chosen_option_ids
        else:
            db.add(
                SubmissionAnswer(
                    submission_id=submission_id,
                    question_id=item.question_id,
                    chosen_option_ids=item.chosen_option_ids,
                )
            )


def submit_payload_for_finalize_from_db(db: Session, submission: Submission, exam: Exam) -> SubmitPayload:
    rows = db.query(SubmissionAnswer).filter(SubmissionAnswer.submission_id == submission.id).all()
    by_q = {a.question_id: list(a.chosen_option_ids or []) for a in rows}
    return SubmitPayload(
        answers=[SubmissionAnswerPayload(question_id=q.id, chosen_option_ids=by_q.get(q.id, [])) for q in exam.questions],
    )


def apply_submission_answers_and_grade(
    db: Session,
    submission: Submission,
    assignment: Assignment,
    body: SubmitPayload,
) -> None:
    """
    Write answers, set submitted_at, grade in-process. Caller holds submission row lock; caller commits once.
    Preconditions: body answers validated against exam questions (or built only from exam.questions).
    """
    upsert_submission_answers_only(db, submission.id, body)
    submission.submitted_at = datetime.now(timezone.utc)
    db.flush()
    db.refresh(submission)
    exam = assignment.exam
    for q in exam.questions:
        _ = q.options
    score, _ = grade_submission(submission, exam)
    submission.score = score


def try_auto_submit_submission_on_violation_threshold(
    db: Session,
    *,
    user_id: int,
    submission_id: int,
) -> bool:
    """
    If submission is still open and exam window/time limit allow, force finalization with empty answers.
    Returns True if this call finalized the submission. Single-transaction safe with a row lock.
    """
    from app.config import settings

    if not settings.anti_cheat_enforce:
        return False

    submission = (
        db.query(Submission)
        .filter(Submission.id == submission_id, Submission.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not submission or submission.submitted_at is not None or submission.started_at is None:
        return False
    assignment = submission.assignment
    now = datetime.now(timezone.utc)
    if now > assignment.end_time:
        return False
    submit_deadline = submission.started_at + timedelta(minutes=assignment.duration_minutes)
    if now > submit_deadline:
        return False
    exam = assignment.exam
    body = submit_payload_for_finalize_from_db(db, submission, exam)
    apply_submission_answers_and_grade(db, submission, assignment, body)
    return True


def exam_questions_for_student(exam: Exam, submission_id: int | None = None) -> list[dict]:
    if submission_id is None:
        out = []
        for q in exam.questions:
            out.append({
                "id": q.id,
                "order_index": q.order_index,
                "question_type": q.question_type.value,
                "text": q.text,
                "options": [{"id": o.id, "order_index": o.order_index, "text": o.text} for o in q.options],
            })
        return out

    out = []
    for display_q_index, q in enumerate(questions_display_order_for_submission(exam, submission_id)):
        options_ordered = options_display_order_for_question(q, submission_id)
        out.append({
            "id": q.id,
            "order_index": display_q_index,
            "question_type": q.question_type.value,
            "text": q.text,
            "options": [
                {"id": o.id, "order_index": display_opt_index, "text": o.text}
                for display_opt_index, o in enumerate(options_ordered)
            ],
        })
    return out
