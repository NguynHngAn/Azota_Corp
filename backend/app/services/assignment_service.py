from datetime import datetime, timezone

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


def exam_questions_for_student(exam: Exam) -> list[dict]:
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
