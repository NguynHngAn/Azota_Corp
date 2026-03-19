from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.user import Role, User
from app.models.assignment import Assignment, Submission, SubmissionAnswer
from app.models.class_model import Class, ClassMember
from app.models.exam import Exam
from app.schemas.assignment_schema import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentDetail,
    SubmissionStartResponse,
    SubmitPayload,
    SubmissionResponse,
    SubmissionResultResponse,
    QuestionResultItem,
    QuestionResultDetail,
    OptionResultItem,
    MySubmissionSummary,
    MyAssignmentSubmissionResponse,
    AssignmentReportResponse,
    AdminOverviewReportResponse,
    ScoreBucket,
)
from app.api.deps import get_current_user, require_role
from app.services.assignment_service import can_manage_assignment, is_in_class, exam_questions_for_student
from app.services.grading_service import grade_submission
from app.services.ai_explanation_service import generate_explanations_for_submission

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/submissions/my", response_model=list[MySubmissionSummary])
def list_my_submissions(
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    # Return submitted submissions only, newest first
    rows = (
        db.query(Submission, Assignment, Class, Exam)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Class, Assignment.class_id == Class.id)
        .join(Exam, Assignment.exam_id == Exam.id)
        .filter(Submission.user_id == current_user.id, Submission.submitted_at.is_not(None))
        .order_by(Submission.submitted_at.desc())
        .all()
    )
    return [
        MySubmissionSummary(
            submission_id=s.id,
            assignment_id=s.assignment_id,
            exam_title=exam.title,
            class_name=class_.name,
            submitted_at=s.submitted_at,  # type: ignore[arg-type]
            score=s.score,
        )
        for (s, _a, class_, exam) in rows
    ]


@router.get("/{assignment_id}/my-submission", response_model=MyAssignmentSubmissionResponse)
def get_my_submission_for_assignment(
    assignment_id: int,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if not is_in_class(db, assignment.class_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in this class")
    submission = (
        db.query(Submission)
        .filter(
            Submission.assignment_id == assignment_id,
            Submission.user_id == current_user.id,
            Submission.submitted_at.is_not(None),
        )
        .first()
    )
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No submitted submission")
    return MyAssignmentSubmissionResponse(
        submission_id=submission.id,
        assignment_id=assignment_id,
        exam_title=assignment.exam.title,
        submitted_at=submission.submitted_at,  # type: ignore[arg-type]
        score=submission.score,
    )


@router.post("/submissions/{submission_id}/submit", response_model=SubmissionResponse)
def submit_submission(
    submission_id: int,
    body: SubmitPayload,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your submission")
    if submission.submitted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already submitted")
    assignment = submission.assignment
    exam_question_ids = {q.id for q in assignment.exam.questions}
    for item in body.answers:
        if item.question_id not in exam_question_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid question_id {item.question_id}")
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
    submission.submitted_at = datetime.now(timezone.utc)
    db.flush()
    db.refresh(submission)
    exam = assignment.exam
    for q in exam.questions:
        _ = q.options
    score, _ = grade_submission(submission, exam)
    submission.score = score
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/submissions/{submission_id}/result", response_model=SubmissionResultResponse)
def get_submission_result(
    submission_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.user_id != current_user.id and current_user.role != Role.teacher and current_user.role != Role.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    if current_user.role == Role.teacher and submission.assignment.exam.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")
    if not submission.submitted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not submitted yet")
    db.refresh(submission)
    exam = submission.assignment.exam
    for q in exam.questions:
        _ = q.options
    _, question_results = grade_submission(submission, exam)
    explanations = generate_explanations_for_submission(submission, exam)
    results_by_q = {qid: correct for qid, correct in question_results}
    answers_by_q = {a.question_id: (a.chosen_option_ids or []) for a in submission.answers}
    question_details = []
    for q in sorted(exam.questions, key=lambda x: x.order_index):
        chosen = answers_by_q.get(q.id, [])
        question_details.append(
            QuestionResultDetail(
                question_id=q.id,
                question_text=q.text,
                correct=results_by_q.get(q.id, False),
                chosen_option_ids=chosen,
                options=[OptionResultItem(id=o.id, text=o.text, is_correct=o.is_correct) for o in q.options],
                ai_explanation=explanations.get(q.id),
            )
        )
    return SubmissionResultResponse(
        id=submission.id,
        assignment_id=submission.assignment_id,
        user_id=submission.user_id,
        started_at=submission.started_at,
        submitted_at=submission.submitted_at,
        score=submission.score,
        exam_title=exam.title,
        question_results=[QuestionResultItem(question_id=qid, correct=correct) for qid, correct in question_results],
        question_details=question_details,
    )


def _build_score_buckets(scores: list[float]) -> list[ScoreBucket]:
    buckets_def = [
        (0.0, 20.0, "0-19"),
        (20.0, 40.0, "20-39"),
        (40.0, 60.0, "40-59"),
        (60.0, 80.0, "60-79"),
        (80.0, 101.0, "80-100"),
    ]
    counts = [0 for _ in buckets_def]
    for s in scores:
        for idx, (start, end, _label) in enumerate(buckets_def):
            if start <= s < end:
                counts[idx] += 1
                break
    return [
        ScoreBucket(label=label, min_score=start, max_score=end, count=counts[idx])
        for idx, (start, end, label) in enumerate(buckets_def)
    ]


@router.get("/{assignment_id}/report", response_model=AssignmentReportResponse)
def get_assignment_report(
    assignment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    # Only owner teacher or admin can view
    if current_user.role == Role.teacher and not can_manage_assignment(current_user, assignment):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")
    if current_user.role not in (Role.teacher, Role.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    total_students = (
        db.query(func.count(ClassMember.id)).filter(ClassMember.class_id == assignment.class_id).scalar() or 0
    )
    submitted_count = (
        db.query(func.count(Submission.id))
        .filter(Submission.assignment_id == assignment_id, Submission.submitted_at.is_not(None))
        .scalar()
        or 0
    )
    not_submitted_count = max(total_students - submitted_count, 0)

    score_rows = (
        db.query(Submission.score)
        .filter(Submission.assignment_id == assignment_id, Submission.submitted_at.is_not(None))
        .all()
    )
    scores = [row[0] for row in score_rows if row[0] is not None]
    if scores:
        average_score = round(sum(scores) / len(scores), 2)
        min_score = min(scores)
        max_score = max(scores)
    else:
        average_score = None
        min_score = None
        max_score = None

    score_buckets = _build_score_buckets(scores)

    exam = assignment.exam
    class_ = assignment.class_
    return AssignmentReportResponse(
        assignment_id=assignment.id,
        exam_id=assignment.exam_id,
        class_id=assignment.class_id,
        exam_title=exam.title,
        class_name=class_.name,
        total_students=total_students,
        submitted_count=submitted_count,
        not_submitted_count=not_submitted_count,
        average_score=average_score,
        min_score=min_score,
        max_score=max_score,
        score_buckets=score_buckets,
    )


@router.get("/reports/overview", response_model=AdminOverviewReportResponse)
def get_admin_overview_report(
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    # Total assignments
    total_assignments = db.query(func.count(Assignment.id)).scalar() or 0

    # Total "assigned students" = total class_members joined to assignments
    # (mỗi assignment tính riêng, có thể trùng user giữa assignments khác nhau)
    total_assigned_students = (
        db.query(func.count(ClassMember.id))
        .select_from(ClassMember)
        .join(Class, ClassMember.class_id == Class.id)
        .join(Assignment, Assignment.class_id == Class.id)
        .scalar()
        or 0
    )

    total_submissions = db.query(func.count(Submission.id)).scalar() or 0
    total_submitted = (
        db.query(func.count(Submission.id)).filter(Submission.submitted_at.is_not(None)).scalar() or 0
    )

    score_rows = db.query(Submission.score).filter(Submission.submitted_at.is_not(None)).all()
    scores = [row[0] for row in score_rows if row[0] is not None]
    if scores:
        average_score = round(sum(scores) / len(scores), 2)
    else:
        average_score = None
    score_buckets = _build_score_buckets(scores)

    return AdminOverviewReportResponse(
        total_assignments=total_assignments,
        total_assigned_students=int(total_assigned_students),
        total_submissions=total_submissions,
        total_submitted=total_submitted,
        average_score=average_score,
        score_buckets=score_buckets,
    )


@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_assignment(
    body: AssignmentCreate,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == body.exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    if exam.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your exam")
    cls = db.query(Class).filter(Class.id == body.class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if cls.created_by != current_user.id and current_user.role != Role.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your class")
    if body.start_time >= body.end_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_time must be before end_time")
    exam.is_draft = False
    assignment = Assignment(
        exam_id=body.exam_id,
        class_id=body.class_id,
        start_time=body.start_time,
        end_time=body.end_time,
        duration_minutes=body.duration_minutes,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("", response_model=list[AssignmentDetail])
def list_assignments(
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    q = db.query(Assignment).join(Exam).filter(Exam.created_by == current_user.id)
    assignments = q.order_by(Assignment.id).all()
    return [
        AssignmentDetail(
            id=a.id,
            exam_id=a.exam_id,
            class_id=a.class_id,
            start_time=a.start_time,
            end_time=a.end_time,
            duration_minutes=a.duration_minutes,
            created_at=a.created_at,
            exam_title=a.exam.title,
            class_name=a.class_.name,
        )
        for a in assignments
    ]


@router.get("/my", response_model=list[AssignmentDetail])
def list_my_assignments(
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    memberships = db.query(ClassMember).filter(ClassMember.user_id == current_user.id).all()
    class_ids = [m.class_id for m in memberships]
    if not class_ids:
        return []
    q = db.query(Assignment).filter(Assignment.class_id.in_(class_ids))
    assignments = q.order_by(Assignment.start_time.desc()).all()
    return [
        AssignmentDetail(
            id=a.id,
            exam_id=a.exam_id,
            class_id=a.class_id,
            start_time=a.start_time,
            end_time=a.end_time,
            duration_minutes=a.duration_minutes,
            created_at=a.created_at,
            exam_title=a.exam.title,
            class_name=a.class_.name,
        )
        for a in assignments
    ]


@router.post("/{assignment_id}/start", response_model=SubmissionStartResponse)
def start_assignment(
    assignment_id: int,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if not is_in_class(db, assignment.class_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in this class")
    submission = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.user_id == current_user.id,
    ).first()
    if not submission:
        try:
            submission = Submission(assignment_id=assignment_id, user_id=current_user.id)
            db.add(submission)
            db.commit()
            db.refresh(submission)
        except IntegrityError:
            # Another request created the submission concurrently; reuse existing one
            db.rollback()
            submission = db.query(Submission).filter(
                Submission.assignment_id == assignment_id,
                Submission.user_id == current_user.id,
            ).first()
            if not submission:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create submission")
    if submission.submitted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already submitted")
    questions = exam_questions_for_student(assignment.exam)
    return SubmissionStartResponse(
        submission_id=submission.id,
        assignment_id=assignment_id,
        started_at=submission.started_at,
        duration_minutes=assignment.duration_minutes,
        exam_title=assignment.exam.title,
        questions=questions,
    )


