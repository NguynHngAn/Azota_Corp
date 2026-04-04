import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.models.assignment import Assignment, Submission, SubmissionAnswer
from app.models.class_model import Class, ClassMember
from app.models.exam import Exam
from app.models.user import User
from app.schemas.assignment_schema import SubmitPayload, SubmissionAnswerPayload
from app.services.grading_service import grade_submission


def can_manage_assignment(current_user: User, assignment: Assignment) -> bool:
    if current_user.role.value == "admin":
        return True
    return assignment.exam.created_by == current_user.id


def is_in_class(db: Session, class_id: int, user_id: int) -> bool:
    return db.query(ClassMember).filter(ClassMember.class_id == class_id, ClassMember.user_id == user_id).first() is not None


def build_submission_snapshot(submission: Submission, exam: Exam, *, shuffle_questions: bool, shuffle_options: bool) -> list[dict]:
    rng = random.Random(f"{submission.id}:{submission.user_id}:{submission.assignment_id}")
    questions = list(exam.questions)
    if shuffle_questions:
        rng.shuffle(questions)

    snapshot: list[dict] = []
    for q_index, question in enumerate(questions):
        options = list(question.options)
        if shuffle_options:
            rng.shuffle(options)
        snapshot.append(
            {
                "id": question.id,
                "question_id": question.id,
                "order_index": q_index,
                "question_type": question.question_type.value,
                "text": question.text,
                "options": [
                    {
                        "id": option.id,
                        "order_index": option_index,
                        "text": option.text,
                    }
                    for option_index, option in enumerate(options)
                ],
            }
        )
    return snapshot


def get_or_create_submission_snapshot(submission: Submission, exam: Exam) -> list[dict]:
    if submission.question_snapshot:
        return submission.question_snapshot
    snapshot = build_submission_snapshot(
        submission,
        exam,
        shuffle_questions=submission.assignment.shuffle_questions,
        shuffle_options=submission.assignment.shuffle_options,
    )
    submission.question_snapshot = snapshot
    return snapshot


def exam_questions_for_student(submission: Submission) -> list[dict]:
    return get_or_create_submission_snapshot(submission, submission.assignment.exam)


def get_submission_deadline(submission: Submission) -> datetime:
    started_at = submission.started_at
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    time_limit = started_at + timedelta(minutes=submission.assignment.duration_minutes)
    return min(time_limit, submission.assignment.end_time)


def is_submission_expired(submission: Submission, now: datetime | None = None) -> bool:
    current = now or datetime.now(timezone.utc)
    return current >= get_submission_deadline(submission)


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
    If submission is still open and exam window/time limit allow, force finalization with current DB answers.
    Returns True if this call finalized the submission.
    """
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
