from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.config import settings
from app.database import get_db
from app.models.user import Role, User
from app.models.assignment import Assignment, Submission
from app.models.class_model import Class, ClassMember
from app.models.exam import Exam
from app.models.anti_cheat import AntiCheatEvent
from app.schemas.anti_cheat_schema import (
    AntiCheatEventCreate,
    AntiCheatHeartbeatRequest,
    AntiCheatHeartbeatResponse,
    AntiCheatEventResponse,
    AntiCheatMonitorResponse,
    AntiCheatMonitorRow,
    AntiCheatMonitorSummary,
)
from app.services.assignment_service import (
    can_manage_assignment,
    ensure_submission_deadline,
    finalize_submission,
    is_submission_expired,
    is_in_class,
    try_auto_submit_submission_on_violation_threshold,
)
from app.services.anti_cheat_service import (
    count_recent_events_for_rate_limit,
    submission_violation_metrics,
)

router = APIRouter(prefix="/anti-cheat", tags=["anti-cheat"])


@router.post("/events", response_model=AntiCheatEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    body: AntiCheatEventCreate,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == body.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if not is_in_class(db, assignment.class_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not in this class")

    submission_id = body.submission_id
    submission = (
        db.query(Submission)
        .filter(Submission.id == submission_id)
        .with_for_update()
        .first()
    )
    if (
        not submission
        or submission.assignment_id != assignment.id
        or submission.user_id != current_user.id
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid submission_id")
    if submission.submitted_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission already submitted")

    recent_n = count_recent_events_for_rate_limit(
        db,
        assignment_id=assignment.id,
        user_id=current_user.id,
        submission_id=submission_id,
        window_seconds=settings.anti_cheat_event_rate_window_seconds,
    )
    if recent_n >= settings.anti_cheat_event_rate_max:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Anti-cheat event rate limit exceeded",
        )

    ev = AntiCheatEvent(
        assignment_id=assignment.id,
        submission_id=submission_id,
        user_id=current_user.id,
        event_type=body.event_type.strip(),
        meta=body.meta or {},
    )
    db.add(ev)
    db.flush()
    violation_weighted_score, violation_count = submission_violation_metrics(db, submission_id)
    submission.violation_count = violation_count
    auto_submitted = False
    max_violations = assignment.max_violations or settings.anti_cheat_max_violations
    if (
        settings.anti_cheat_enforce
        and violation_weighted_score >= float(max_violations)
    ):
        auto_submitted = try_auto_submit_submission_on_violation_threshold(
            db, user_id=current_user.id, submission_id=submission_id
        )
    db.commit()
    db.refresh(ev)
    return AntiCheatEventResponse(
        id=ev.id,
        assignment_id=ev.assignment_id,
        submission_id=ev.submission_id,
        user_id=ev.user_id,
        event_type=ev.event_type,
        meta=ev.meta,
        created_at=ev.created_at,
        violation_weighted_score=violation_weighted_score,
        violation_count=violation_count,
        auto_submitted=auto_submitted,
    )


@router.post("/heartbeat", response_model=AntiCheatHeartbeatResponse)
def anti_cheat_heartbeat(
    body: AntiCheatHeartbeatRequest,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == body.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    submission = (
        db.query(Submission)
        .filter(Submission.id == body.submission_id)
        .with_for_update()
        .first()
    )
    if (
        not submission
        or submission.assignment_id != assignment.id
        or submission.user_id != current_user.id
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid submission_id")
    if submission.started_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission not started")
    if submission.submitted_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Submission already submitted")
    ensure_submission_deadline(submission)
    if is_submission_expired(submission):
        finalize_submission(
            db,
            submission=submission,
            submit_reason="time_limit_reached",
            auto_submitted=True,
        )
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Time limit exceeded")
    now = datetime.now(timezone.utc)
    submission.last_heartbeat_at = now
    db.commit()
    return AntiCheatHeartbeatResponse(server_now=now, deadline_at=submission.deadline_at)


@router.get("/monitor", response_model=AntiCheatMonitorResponse)
def teacher_monitor(
    current_user: Annotated[User, Depends(require_role(Role.teacher, Role.admin))],
    db: Session = Depends(get_db),
    assignment_id: int | None = Query(default=None, gt=0),
    suspicious_only: bool = Query(default=False),
    lookback_minutes: int = Query(default=60 * 24, ge=5, le=60 * 24 * 30),
):
    """
    MVP monitor: uses stored anti-cheat events + existing submissions.
    - If assignment_id is provided: monitor that assignment only.
    - Else (teacher): monitors all assignments created by teacher (via exam.created_by).
    """
    since = datetime.now(timezone.utc) - timedelta(minutes=lookback_minutes)

    base_assignments = db.query(Assignment).join(Exam)
    if assignment_id is not None:
        base_assignments = base_assignments.filter(Assignment.id == assignment_id)
    elif current_user.role == Role.teacher:
        base_assignments = base_assignments.filter(Exam.created_by == current_user.id)

    assignment_ids = [a.id for a in base_assignments.all()]
    if not assignment_ids:
        return AntiCheatMonitorResponse(
            summary=AntiCheatMonitorSummary(total_students=0, active_now=0, submitted=0, suspicious=0),
            rows=[],
        )

    if assignment_id is not None and current_user.role == Role.teacher:
        assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
        if not assignment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
        if not can_manage_assignment(current_user, assignment):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")

    class_ids = [row[0] for row in db.query(Assignment.class_id).filter(Assignment.id.in_(assignment_ids)).distinct().all()]
    total_students = (
        db.query(func.count(func.distinct(ClassMember.user_id))).filter(ClassMember.class_id.in_(class_ids)).scalar()
        or 0
    )
    active_now = (
        db.query(func.count(Submission.id))
        .filter(Submission.assignment_id.in_(assignment_ids), Submission.submitted_at.is_(None))
        .scalar()
        or 0
    )
    submitted = (
        db.query(func.count(Submission.id))
        .filter(Submission.assignment_id.in_(assignment_ids), Submission.submitted_at.is_not(None))
        .scalar()
        or 0
    )

    ev_counts = (
        db.query(
            AntiCheatEvent.assignment_id.label("assignment_id"),
            AntiCheatEvent.user_id.label("user_id"),
            func.count(AntiCheatEvent.id).label("events_total"),
            func.max(AntiCheatEvent.created_at).label("last_event_at"),
        )
        .filter(AntiCheatEvent.assignment_id.in_(assignment_ids), AntiCheatEvent.created_at >= since)
        .group_by(AntiCheatEvent.assignment_id, AntiCheatEvent.user_id)
        .subquery()
    )

    last_ev = (
        db.query(AntiCheatEvent.assignment_id, AntiCheatEvent.user_id, AntiCheatEvent.event_type, AntiCheatEvent.created_at)
        .join(
            ev_counts,
            (ev_counts.c.assignment_id == AntiCheatEvent.assignment_id)
            & (ev_counts.c.user_id == AntiCheatEvent.user_id)
            & (ev_counts.c.last_event_at == AntiCheatEvent.created_at),
        )
        .subquery()
    )

    q = (
        db.query(Submission, Assignment, Exam, Class, User, ev_counts.c.events_total, ev_counts.c.last_event_at, last_ev.c.event_type)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Exam, Assignment.exam_id == Exam.id)
        .join(Class, Assignment.class_id == Class.id)
        .join(User, Submission.user_id == User.id)
        .outerjoin(ev_counts, (ev_counts.c.assignment_id == Assignment.id) & (ev_counts.c.user_id == User.id))
        .outerjoin(last_ev, (last_ev.c.assignment_id == Assignment.id) & (last_ev.c.user_id == User.id))
        .filter(Assignment.id.in_(assignment_ids))
        .order_by(Submission.submitted_at.is_not(None), (ev_counts.c.events_total.is_(None)), (ev_counts.c.events_total.desc().nullslast()), Submission.started_at.desc())
    )

    rows_out: list[AntiCheatMonitorRow] = []
    suspicious_count_users: set[int] = set()

    for (sub, a, exam, cls, u, events_total, last_event_at, last_event_type) in q.all():
        total = int(events_total or 0)
        suspicious = total >= 1
        if suspicious:
            suspicious_count_users.add(u.id)
        if suspicious_only and not suspicious:
            continue
        rows_out.append(
            AntiCheatMonitorRow(
                user_id=u.id,
                full_name=u.full_name or "",
                email=u.email or "",
                class_id=cls.id,
                class_name=cls.name,
                assignment_id=a.id,
                exam_title=exam.title,
                submission_id=sub.id,
                started_at=sub.started_at,
                submitted_at=sub.submitted_at,
                events_total=total,
                last_event_type=last_event_type,
                last_event_at=last_event_at,
                suspicious=suspicious,
                violation_count=sub.violation_count,
                auto_submitted=sub.auto_submitted,
                submit_reason=sub.submit_reason,
            )
        )

    return AntiCheatMonitorResponse(
        summary=AntiCheatMonitorSummary(
            total_students=int(total_students),
            active_now=int(active_now),
            submitted=int(submitted),
            suspicious=len(suspicious_count_users),
        ),
        rows=rows_out,
    )
