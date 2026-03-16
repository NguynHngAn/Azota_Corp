from app.models.exam import Exam
from app.models.user import User


def can_edit_exam(exam: Exam) -> bool:
    return exam.is_draft


def can_access_exam(current_user: User, exam: Exam) -> bool:
    if current_user.role.value == "admin":
        return True
    return exam.created_by == current_user.id
