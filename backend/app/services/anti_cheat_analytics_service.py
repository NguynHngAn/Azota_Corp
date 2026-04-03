from collections import defaultdict
from collections.abc import Sequence

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.anti_cheat import AntiCheatEvent
from app.models.assignment import Assignment, Submission
from app.models.exam import Exam
from app.models.user import Role, User
from app.services.anti_cheat_service import EVENT_WEIGHTS
from app.services.assignment_service import can_manage_assignment


def assignment_ids_visible_to(db: Session, current_user: User, assignment_id: int | None) -> list[int]:
    q = db.query(Assignment.id).join(Exam)
    if assignment_id is not None:
        q = q.filter(Assignment.id == assignment_id)
    elif current_user.role == Role.teacher:
        q = q.filter(Exam.created_by == current_user.id)
    return [row[0] for row in q.all()]


def assert_assignment_access(db: Session, current_user: User, assignment_id: int) -> None:
    a = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    if current_user.role == Role.teacher and not can_manage_assignment(current_user, a):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your assignment")


def weighted_score_by_submission(db: Session, assignment_ids: Sequence[int]) -> dict[int, float]:
    if not assignment_ids:
        return {}
    rows = (
        db.query(AntiCheatEvent.submission_id, AntiCheatEvent.event_type)
        .filter(
            AntiCheatEvent.assignment_id.in_(list(assignment_ids)),
            AntiCheatEvent.submission_id.isnot(None),
        )
        .all()
    )
    acc: dict[int, float] = defaultdict(float)
    for sid, et in rows:
        if sid is None:
            continue
        acc[sid] += EVENT_WEIGHTS.get(et, 0.0)
    return {k: round(v, 2) for k, v in acc.items()}


def event_breakdown_rows(db: Session, assignment_ids: Sequence[int]) -> list[tuple[str, int, float]]:
    if not assignment_ids:
        return []
    rows = (
        db.query(AntiCheatEvent.event_type, func.count(AntiCheatEvent.id))
        .filter(AntiCheatEvent.assignment_id.in_(list(assignment_ids)))
        .group_by(AntiCheatEvent.event_type)
        .order_by(func.count(AntiCheatEvent.id).desc())
        .all()
    )
    out: list[tuple[str, int, float]] = []
    for et, cnt in rows:
        w = EVENT_WEIGHTS.get(et, 0.0)
        out.append((et, int(cnt), round(w * cnt, 2)))
    return out


def score_distribution_buckets(scores: Sequence[float]) -> list[dict]:
    defs: list[tuple[str, float, float | None]] = [
        ("0–5", 0.0, 5.0),
        ("5–10", 5.0, 10.0),
        ("10–15", 10.0, 15.0),
        ("15+", 15.0, None),
    ]
    buckets = [
        {"label": lab, "min_score": lo, "max_score": hi, "count": 0}
        for lab, lo, hi in defs
    ]
    for s in scores:
        for i, (_lab, lo, hi) in enumerate(defs):
            if hi is not None:
                if lo <= s < hi:
                    buckets[i]["count"] += 1
                    break
            else:
                if s >= lo:
                    buckets[i]["count"] += 1
                break
    return buckets


def leaderboard_rows(
    db: Session,
    assignment_ids: Sequence[int],
    score_by_sub: dict[int, float],
    limit: int,
    suspicious_threshold: float,
) -> list[dict]:
    if not assignment_ids:
        return []
    q = (
        db.query(Submission, User, Assignment, Exam)
        .join(User, Submission.user_id == User.id)
        .join(Assignment, Submission.assignment_id == Assignment.id)
        .join(Exam, Assignment.exam_id == Exam.id)
        .filter(Submission.assignment_id.in_(list(assignment_ids)))
    )
    rows: list[dict] = []
    for sub, user, assign, exam in q.all():
        w = score_by_sub.get(sub.id, 0.0)
        rows.append(
            {
                "submission_id": sub.id,
                "assignment_id": assign.id,
                "user_id": user.id,
                "full_name": user.full_name or "",
                "email": user.email or "",
                "exam_title": exam.title,
                "weighted_score": w,
                "suspicious": w >= suspicious_threshold,
                "submitted_at": sub.submitted_at,
            }
        )
    rows.sort(key=lambda r: (-r["weighted_score"], r["submission_id"]))
    return rows[:limit]


def submission_timeline(db: Session, submission_id: int) -> list[AntiCheatEvent]:
    return (
        db.query(AntiCheatEvent)
        .filter(AntiCheatEvent.submission_id == submission_id)
        .order_by(AntiCheatEvent.created_at.asc())
        .all()
    )


def assert_submission_accessible(
    db: Session,
    submission_id: int,
    assignment_ids: Sequence[int],
) -> Submission:
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    if not assignment_ids or sub.assignment_id not in assignment_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return sub
