from sqlalchemy.orm import Session

from app.models.class_model import Class, ClassTeacher
from app.models.user import Role, User


def list_class_teachers(db: Session, class_id: int) -> list[User]:
    rows = (
        db.query(ClassTeacher)
        .filter(ClassTeacher.class_id == class_id)
        .order_by(ClassTeacher.id)
        .all()
    )
    teachers: list[User] = []
    for r in rows:
        if r.teacher:
            teachers.append(r.teacher)
    return teachers


def add_teachers_to_class(db: Session, cls: Class, teacher_ids: list[int]) -> None:
    unique_ids = sorted({int(tid) for tid in teacher_ids if int(tid) > 0})
    if not unique_ids:
        return

    teachers = db.query(User).filter(User.id.in_(unique_ids)).all()
    existing_ids = {t.id for t in teachers}

    missing = [tid for tid in unique_ids if tid not in existing_ids]
    if missing:
        raise ValueError("Teacher not found")

    for t in teachers:
        if t.role != Role.teacher:
            raise ValueError("User is not a teacher")

    already = {
        r.teacher_id
        for r in db.query(ClassTeacher)
        .filter(ClassTeacher.class_id == cls.id, ClassTeacher.teacher_id.in_(unique_ids))
        .all()
    }

    for tid in unique_ids:
        if tid in already:
            continue
        db.add(ClassTeacher(class_id=cls.id, teacher_id=tid))


def ensure_primary_teacher_link(db: Session, cls: Class) -> None:
    # Keep backward compatibility: created_by is the primary teacher.
    # Ensure this teacher also appears in class_teachers.
    exists = (
        db.query(ClassTeacher)
        .filter(ClassTeacher.class_id == cls.id, ClassTeacher.teacher_id == cls.created_by)
        .first()
        is not None
    )
    if not exists:
        db.add(ClassTeacher(class_id=cls.id, teacher_id=cls.created_by))


def remove_teacher_from_class(db: Session, cls: Class, teacher_id: int) -> None:
    if teacher_id == cls.created_by:
        raise ValueError("Cannot remove the primary teacher. Reassign primary teacher first.")

    row = (
        db.query(ClassTeacher)
        .filter(ClassTeacher.class_id == cls.id, ClassTeacher.teacher_id == teacher_id)
        .first()
    )
    if not row:
        raise LookupError("Teacher not in class")
    db.delete(row)
