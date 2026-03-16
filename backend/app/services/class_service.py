import secrets

from sqlalchemy.orm import Session

from app.models.class_model import Class, ClassMember
from app.models.user import User


def generate_invite_code() -> str:
    return secrets.token_urlsafe(8)[:10].replace("-", "x").replace("_", "y")


def can_manage_class(current_user: User, cls: Class) -> bool:
    if current_user.role.value == "admin":
        return True
    return cls.created_by == current_user.id


def is_member(db: Session, class_id: int, user_id: int) -> bool:
    return db.query(ClassMember).filter(ClassMember.class_id == class_id, ClassMember.user_id == user_id).first() is not None
