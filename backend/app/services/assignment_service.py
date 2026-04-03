import random
from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.models.assignment import Assignment, Submission
from app.models.class_model import Class, ClassMember
from app.models.exam import Exam
from app.models.user import User


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
