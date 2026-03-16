from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Role, User
from app.models.class_model import Class, ClassMember
from app.schemas.class_schema import (
    ClassCreate,
    ClassResponse,
    ClassDetail,
    ClassMemberResponse,
    AddMemberRequest,
    JoinClassRequest,
    UpdateClassTeacherRequest,
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, require_role
from app.services.class_service import generate_invite_code, can_manage_class, is_member

router = APIRouter(prefix="/classes", tags=["classes"])


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
    return cls


@router.get("", response_model=list[ClassResponse])
def list_classes(
    current_user: Annotated[User, Depends(require_role(Role.admin, Role.teacher))],
    db: Session = Depends(get_db),
):
    q = db.query(Class)
    if current_user.role == Role.teacher:
        q = q.filter(Class.created_by == current_user.id)
    return q.order_by(Class.id).all()


@router.get("/my", response_model=list[ClassResponse])
def list_my_classes(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    if current_user.role == Role.student:
        memberships = db.query(ClassMember).filter(ClassMember.user_id == current_user.id).all()
        class_ids = [m.class_id for m in memberships]
        return db.query(Class).filter(Class.id.in_(class_ids)).order_by(Class.id).all() if class_ids else []
    q = db.query(Class).filter(Class.created_by == current_user.id)
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
    if not can_manage_class(current_user, cls) and not is_member(db, class_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this class")
    creator = cls.creator
    return ClassDetail(
        id=cls.id,
        name=cls.name,
        description=cls.description,
        created_by=cls.created_by,
        invite_code=cls.invite_code,
        created_at=cls.created_at,
        creator=UserResponse.model_validate(creator) if creator else None,
        member_count=len(cls.members),
    )


@router.get("/{class_id}/members", response_model=list[ClassMemberResponse])
def list_members(
    class_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    if not can_manage_class(current_user, cls) and not is_member(db, class_id, current_user.id):
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
    if not can_manage_class(current_user, cls):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to manage this class")
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
    if not can_manage_class(current_user, cls):
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
    db.commit()
    db.refresh(cls)
    return cls
