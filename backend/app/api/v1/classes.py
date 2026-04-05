from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Role, User
from app.models.class_model import Class, ClassMember, ClassTeacher
from app.schemas.class_schema import (
    AddClassTeachersRequest,
    AddMemberRequest,
    ClassCreate,
    ClassDetail,
    ClassMemberResponse,
    ClassResponse,
    ClassUpdate,
    JoinClassRequest,
    UpdateClassTeacherRequest,
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, require_role
from app.services.class_service import generate_invite_code, can_manage_class, is_member
from app.services.class_teacher_service import (
    add_teachers_to_class,
    ensure_primary_teacher_link,
    list_class_teachers,
    remove_teacher_from_class,
)

router = APIRouter(prefix="/classes", tags=["classes"])


def _apply_archived_filter(q, include_archived: bool):
    if not include_archived:
        return q.filter(Class.is_archived.is_(False))
    return q


@router.post("", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    body: ClassCreate,
    current_user: Annotated[User, Depends(require_role(Role.admin, Role.teacher))],
    db: Session = Depends(get_db),
):
    code = generate_invite_code()
    while db.query(Class).filter(Class.invite_code == code).first():
        code = generate_invite_code()
    cls = Class(
        name=body.name,
        description=body.description,
        created_by=current_user.id,
        invite_code=code,
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    ensure_primary_teacher_link(db, cls)
    db.commit()
    db.refresh(cls)
    return cls


@router.get("", response_model=list[ClassResponse])
def list_classes(
    current_user: Annotated[User, Depends(require_role(Role.admin, Role.teacher))],
    db: Session = Depends(get_db),
    include_archived: bool = Query(False),
):
    q = db.query(Class)
    if current_user.role == Role.teacher:
        q = (
            q.outerjoin(ClassTeacher, ClassTeacher.class_id == Class.id)
            .filter((Class.created_by == current_user.id) | (ClassTeacher.teacher_id == current_user.id))
            .distinct()
        )
    q = _apply_archived_filter(q, include_archived)
    return q.order_by(Class.id).all()


@router.get("/my", response_model=list[ClassResponse])
def list_my_classes(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    include_archived: bool = Query(False),
):
    if current_user.role == Role.student:
        memberships = db.query(ClassMember).filter(ClassMember.user_id == current_user.id).all()
        class_ids = [m.class_id for m in memberships]
        if not class_ids:
            return []
        q = db.query(Class).filter(Class.id.in_(class_ids))
        q = q.filter(Class.is_archived.is_(False))
        return q.order_by(Class.id).all()
    q = db.query(Class)
    if current_user.role == Role.teacher:
        q = (
            q.outerjoin(ClassTeacher, ClassTeacher.class_id == Class.id)
            .filter((Class.created_by == current_user.id) | (ClassTeacher.teacher_id == current_user.id))
            .distinct()
        )
    else:
        q = q.filter(Class.created_by == current_user.id)
    q = _apply_archived_filter(q, include_archived)
    return q.order_by(Class.id).all()


@router.post("/join", response_model=ClassResponse)
def join_class(
    body: JoinClassRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.invite_code == body.invite_code.strip()).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite code")
    if cls.is_archived:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This class is archived")
    if current_user.role != Role.student:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only students can join via invite code")
    if is_member(db, cls.id, current_user.id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already in this class")
    member = ClassMember(class_id=cls.id, user_id=current_user.id)
    db.add(member)
    db.commit()
    db.refresh(cls)
    return cls


@router.get("/{class_id}", response_model=ClassDetail)
def get_class(
    class_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if not can_manage_class(db, current_user, cls) and not is_member(db, class_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this class")
    creator = cls.creator
    return ClassDetail(
        id=cls.id,
        name=cls.name,
        description=cls.description,
        created_by=cls.created_by,
        invite_code=cls.invite_code,
        created_at=cls.created_at,
        is_archived=cls.is_archived,
        creator=UserResponse.model_validate(creator) if creator else None,
        member_count=len(cls.members),
        can_manage=can_manage_class(db, current_user, cls),
    )


@router.patch("/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    body: ClassUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if not can_manage_class(db, current_user, cls):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to manage this class")
    if body.name is not None:
        cls.name = body.name.strip()
    if body.description is not None:
        cls.description = body.description.strip() or None
    db.commit()
    db.refresh(cls)
    return cls


@router.post("/{class_id}/archive", response_model=ClassResponse)
def archive_class(
    class_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if not can_manage_class(db, current_user, cls):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to manage this class")
    if not cls.is_archived:
        cls.is_archived = True
        db.commit()
        db.refresh(cls)
    return cls


@router.get("/{class_id}/members", response_model=list[ClassMemberResponse])
def list_members(
    class_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if not can_manage_class(db, current_user, cls) and not is_member(db, class_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    members = db.query(ClassMember).filter(ClassMember.class_id == class_id).all()
    return [
        ClassMemberResponse(
            id=m.id,
            class_id=m.class_id,
            user_id=m.user_id,
            joined_at=m.joined_at,
            user=UserResponse.model_validate(m.user) if m.user else None,
        )
        for m in members
    ]


@router.delete("/{class_id}/members/me", status_code=status.HTTP_204_NO_CONTENT)
def leave_class(
    class_id: int,
    current_user: Annotated[User, Depends(require_role(Role.student))],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    member = db.query(ClassMember).filter(ClassMember.class_id == class_id, ClassMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a member of this class")
    db.delete(member)
    db.commit()
    return None


@router.post("/{class_id}/members", response_model=ClassMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(
    class_id: int,
    body: AddMemberRequest,
    current_user: Annotated[User, Depends(require_role(Role.admin, Role.teacher))],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if not can_manage_class(db, current_user, cls):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to manage this class")
    if cls.is_archived:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot add members to an archived class")
    user = db.query(User).filter(User.id == body.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role != Role.student:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only students can be added as members")
    if is_member(db, class_id, body.user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already in class")
    member = ClassMember(class_id=class_id, user_id=body.user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return ClassMemberResponse(
        id=member.id,
        class_id=member.class_id,
        user_id=member.user_id,
        joined_at=member.joined_at,
        user=UserResponse.model_validate(member.user) if member.user else None,
    )


@router.delete("/{class_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    class_id: int,
    user_id: int,
    current_user: Annotated[User, Depends(require_role(Role.admin, Role.teacher))],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if not can_manage_class(db, current_user, cls):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to manage this class")
    member = db.query(ClassMember).filter(ClassMember.class_id == class_id, ClassMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not in class")
    db.delete(member)
    db.commit()
    return None


@router.put("/{class_id}/owner", response_model=ClassResponse)
def update_class_teacher(
    class_id: int,
    body: UpdateClassTeacherRequest,
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    teacher = db.query(User).filter(User.id == body.teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    if teacher.role != Role.teacher:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not a teacher")
    cls.created_by = teacher.id
    ensure_primary_teacher_link(db, cls)
    db.commit()
    db.refresh(cls)
    return cls


@router.get("/{class_id}/teachers", response_model=list[UserResponse])
def get_class_teachers(
    class_id: int,
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return [UserResponse.model_validate(t) for t in list_class_teachers(db, class_id)]


@router.post("/{class_id}/teachers", response_model=list[UserResponse], status_code=status.HTTP_201_CREATED)
def add_class_teachers(
    class_id: int,
    body: AddClassTeachersRequest,
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    try:
        add_teachers_to_class(db, cls, body.teacher_ids)
        ensure_primary_teacher_link(db, cls)
        db.commit()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return [UserResponse.model_validate(t) for t in list_class_teachers(db, class_id)]


@router.delete("/{class_id}/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class_teacher(
    class_id: int,
    teacher_id: int,
    current_user: Annotated[User, Depends(require_role(Role.admin))],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    try:
        remove_teacher_from_class(db, cls, teacher_id)
        db.commit()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return None
