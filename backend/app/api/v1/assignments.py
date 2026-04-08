from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
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
    AutosaveAnswersResponse,
    ExamRoomQuestion,
    SubmissionAnswerPayload,
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
from app.schemas.teacher_ai_schema import AssignmentInsightResponse
from app.services.teacher_ai_service import generate_assignment_insight
from app.api.deps import get_current_user, require_role
from app.services.assignment_service import (
    can_manage_assignment,
    exam_questions_for_student,
    get_submission_deadline,
    is_in_class,
    is_submission_expired,
    upsert_submission_answers_only,
)
from app.services.class_service import can_manage_class
from app.services.anti_cheat_service import submit_submission_now
from app.services.grading_service import grade_submission
from app.services.ai_explanation_service import generate_explanations_for_submission
from app.services.reporting_service import build_top_missed_questions

from sqlalchemy.exc import OperationalError
router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("/submissions/my", response_model=list[MySubmissionSummary])
def list_my_submissions(
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
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
    try:
        submission = (
        db.query(Submission)
        .filter(Submission.id == submission_id)
        .with_for_update(nowait=True)
        .first()
        )
    except OperationalError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Submission is being processed, please retry")
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your submission")
    if submission.submitted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already submitted")
    if is_submission_expired(submission):
        submit_submission_now(
            db,
            submission,
            submit_reason="time_limit_reached",
            auto_submitted=True,
        )
        db.commit()
        db.refresh(submission)
        return submission
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
    submit_reason = body.submit_reason or ("time_limit_reached" if is_submission_expired(submission) else "manual_submit")
    submit_submission_now(
        db,
        submission,
        submit_reason=submit_reason,
        auto_submitted=submit_reason != "manual_submit",
    )
    db.flush()
    db.refresh(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.post("/submissions/{submission_id}/answers", response_model=AutosaveAnswersResponse)
def autosave_submission_answers(
    submission_id: int,
    body: SubmitPayload,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    submission = (
        db.query(Submission)
        .filter(
            Submission.id == submission_id,
            Submission.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if submission.submitted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already submitted")
    if submission.started_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission not started")
    assignment = submission.assignment
    now = datetime.now(timezone.utc)
    if now > assignment.end_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignment window ended")
    submit_deadline = submission.started_at + timedelta(minutes=assignment.duration_minutes)
    if now > submit_deadline:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Time limit exceeded")
    exam_question_ids = {q.id for q in assignment.exam.questions}
    for item in body.answers:
        if item.question_id not in exam_question_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid question_id {item.question_id}")
    upsert_submission_answers_only(db, submission.id, body)
    db.commit()
    return AutosaveAnswersResponse()


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
    snapshot_by_question_id = {
        int(item["question_id"]): item for item in (submission.question_snapshot or [])
    }
    sorted_questions = sorted(
        exam.questions,
        key=lambda question: snapshot_by_question_id.get(question.id, {}).get("order_index", question.order_index),
    )
    for q in sorted_questions:
        chosen = answers_by_q.get(q.id, [])
        snapshot_options = snapshot_by_question_id.get(q.id, {}).get("options", [])
        option_order = {
            int(item["id"]): item.get("order_index", index)
            for index, item in enumerate(snapshot_options)
        }
        ordered_options = sorted(q.options, key=lambda option: option_order.get(option.id, option.order_index))
        question_details.append(
            QuestionResultDetail(
                question_id=q.id,
                question_text=q.text,
                correct=results_by_q.get(q.id, False),
                chosen_option_ids=chosen,
                options=[OptionResultItem(id=o.id, text=o.text, is_correct=o.is_correct) for o in ordered_options],
                ai_explanation=explanations.get(q.id),
                order_index=snapshot_by_question_id.get(q.id, {}).get("order_index", q.order_index),
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


def _compute_assignment_report_response(db: Session, assignment: Assignment) -> AssignmentReportResponse:
    assignment_id = assignment.id
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
    top_missed_questions = build_top_missed_questions(assignment)

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
        top_missed_questions=top_missed_questions,
    )


def _assignment_report_to_ai_stats(report: AssignmentReportResponse) -> dict:
    truncated: list[dict] = []
    for q in report.top_missed_questions:
        text = q.question_text
        if len(text) > 450:
            text = text[:450] + "…"
        truncated.append(
            {
                "question_id": q.question_id,
                "question_text": text,
                "incorrect_rate": q.incorrect_rate,
                "incorrect_count": q.incorrect_count,
                "correct_count": q.correct_count,
                "total_answers": q.total_answers,
            }
        )
    return {
        "exam_title": report.exam_title,
        "class_name": report.class_name,
        "totals": {
            "total_students": report.total_students,
            "submitted_count": report.submitted_count,
            "not_submitted_count": report.not_submitted_count,
        },
        "scores": {
            "average": report.average_score,
            "min": report.min_score,
            "max": report.max_score,
        },
        "score_distribution": [{"label": b.label, "count": b.count} for b in report.score_buckets],
        "top_missed_questions": truncated,
    }


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
    if not assignment or assignment.deleted_at is not None or assignment.exam.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if current_user.role == Role.teacher and not can_manage_assignment(current_user, assignment):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")
    if current_user.role not in (Role.teacher, Role.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    return _compute_assignment_report_response(db, assignment)


@router.post("/{assignment_id}/report/ai-insight", response_model=AssignmentInsightResponse)
def post_assignment_report_ai_insight(
    assignment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment or assignment.deleted_at is not None or assignment.exam.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if current_user.role == Role.teacher and not can_manage_assignment(current_user, assignment):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")
    if current_user.role not in (Role.teacher, Role.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    report = _compute_assignment_report_response(db, assignment)
    if report.submitted_count < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No submitted assignments yet; AI insight needs at least one submission.",
        )

    stats = _assignment_report_to_ai_stats(report)
    return generate_assignment_insight(stats)


@router.get("/reports/overview", response_model=AdminOverviewReportResponse)
def get_admin_overview_report(
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    total_assignments = db.query(func.count(Assignment.id)).scalar() or 0

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
    current_user: Annotated[User, Depends(require_role(Role.admin, Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == body.exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    if exam.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    if current_user.role != Role.admin and exam.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your exam")
    cls = db.query(Class).filter(Class.id == body.class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if cls.is_archived:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot assign to an archived class")
    if not can_manage_class(db, current_user, cls):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to manage this class")
    if body.start_time >= body.end_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="start_time must be before end_time")
    exam.is_draft = False
    assignment = Assignment(
        exam_id=body.exam_id,
        class_id=body.class_id,
        start_time=body.start_time,
        end_time=body.end_time,
        duration_minutes=body.duration_minutes,
        shuffle_questions=body.shuffle_questions or exam.shuffle_questions,
        shuffle_options=body.shuffle_options or exam.shuffle_options,
        max_violations=body.max_violations,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("", response_model=list[AssignmentDetail])
def list_assignments(
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
    include_deleted: bool = Query(default=False),
):
    q = db.query(Assignment).join(Exam).filter(Exam.created_by == current_user.id)
    if not include_deleted:
        q = q.filter(Assignment.deleted_at.is_(None), Exam.deleted_at.is_(None))
    # Newest (latest start) first
    assignments = q.order_by(Assignment.start_time.desc()).all()
    return [
        AssignmentDetail(
            id=a.id,
            exam_id=a.exam_id,
            class_id=a.class_id,
            start_time=a.start_time,
            end_time=a.end_time,
            duration_minutes=a.duration_minutes,
            shuffle_questions=a.shuffle_questions,
            shuffle_options=a.shuffle_options,
            max_violations=a.max_violations,
            created_at=a.created_at,
            deleted_at=a.deleted_at,
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
    rows = (
        db.query(Assignment, Submission.score)
        .join(Exam, Assignment.exam_id == Exam.id)
        .outerjoin(
            Submission,
            (Submission.assignment_id == Assignment.id)
            & (Submission.user_id == current_user.id)
            & (Submission.submitted_at.is_not(None)),
        )
        .filter(
            Assignment.class_id.in_(class_ids),
            Assignment.deleted_at.is_(None),
            Exam.deleted_at.is_(None),
        )
        .order_by(Assignment.start_time.desc())
        .all()
    )
    return [
        AssignmentDetail(
            id=a.id,
            exam_id=a.exam_id,
            class_id=a.class_id,
            start_time=a.start_time,
            end_time=a.end_time,
            duration_minutes=a.duration_minutes,
            shuffle_questions=a.shuffle_questions,
            shuffle_options=a.shuffle_options,
            max_violations=a.max_violations,
            created_at=a.created_at,
            exam_title=a.exam.title,
            class_name=a.class_.name,
            score=float(score) if score is not None else None,
        )
        for (a, score) in rows
    ]


@router.post("/{assignment_id}/start", response_model=SubmissionStartResponse)
def start_assignment(
    assignment_id: int,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    # 1. Get assignment
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment or assignment.deleted_at is not None or assignment.exam.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    
    # 2. Check class membership
    if not is_in_class(db, assignment.class_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in this class")
    now = datetime.now(timezone.utc)

    # 3. Find or create submission (IMPORTANT)
    submission = db.query(Submission).filter(
        Submission.assignment_id == assignment_id,
        Submission.user_id == current_user.id,
    ).first()
    if not submission:
        # Entry window rule: student must start within [start_time, end_time].
        if now < assignment.start_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignment has not started yet")
        if now > assignment.end_time:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignment entry window is closed")
        try:
            submission = Submission(assignment_id=assignment_id, user_id=current_user.id)
            db.add(submission)
            db.commit()
            db.refresh(submission)
        except IntegrityError:
            db.rollback()
            submission = db.query(Submission).filter(
                Submission.assignment_id == assignment_id,
                Submission.user_id == current_user.id,
            ).first()
            if not submission:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create submission")
            
    # 4. Already submitted        
    if submission.submitted_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already submitted")
    
    # 5. Expired → auto submit
    if is_submission_expired(submission):
        submit_submission_now(
            db,
            submission,
            submit_reason="time_limit_reached",
            auto_submitted=True,
        )
        db.commit()
        db.refresh(submission)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Time limit reached")
    
    # 6. Load questions
    raw_questions = exam_questions_for_student(submission)
    questions = [ExamRoomQuestion(**q) for q in raw_questions]  # Convert dicts to objects

    # 7. Load saved answers (HEAD giữ lại là đúng)
    saved_rows = db.query(SubmissionAnswer).filter(SubmissionAnswer.submission_id == submission.id).all()
    saved_answers = [
        SubmissionAnswerPayload(question_id=r.question_id, chosen_option_ids=list(r.chosen_option_ids or []))
        for r in saved_rows
    ]

    # 8. Deadline (SINGLE SOURCE OF TRUTH)
    deadline_at = get_submission_deadline(submission)

    db.commit()
    db.refresh(submission)

    return SubmissionStartResponse(
        submission_id=submission.id,
        assignment_id=assignment_id,
        started_at=submission.started_at,
        deadline_at=deadline_at,
        duration_minutes=assignment.duration_minutes,
        exam_title=assignment.exam.title,
        max_violations=assignment.max_violations,
        violation_count=submission.violation_count,
        questions=questions,
        saved_answers=saved_answers,
        server_now=now,
    )


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment or assignment.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if not can_manage_assignment(current_user, assignment) and current_user.role != Role.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")
    assignment.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None


@router.post("/{assignment_id}/restore", response_model=AssignmentResponse)
def restore_assignment(
    assignment_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if not can_manage_assignment(current_user, assignment) and current_user.role != Role.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")
    assignment.deleted_at = None
    db.commit()
    db.refresh(assignment)
    return assignment


