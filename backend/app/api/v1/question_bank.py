from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.database import get_db
from app.models.exam import Exam, Question, AnswerOption
from app.models.question_bank import BankQuestion, BankAnswerOption, BankTag
from app.models.user import Role, User
from app.schemas.question_bank_schema import (
    AddFromBankRequest,
    AddFromBankResponse,
    BankQuestionCreate,
    BankQuestionListItem,
    BankQuestionListResponse,
    BankQuestionResponse,
    BankQuestionUpdate,
    BankAnswerOptionResponse,
)
from app.services.exam_service import can_access_exam, can_edit_exam

router = APIRouter(prefix="/question-bank", tags=["question-bank"])


def _normalize_tags(tags: list[str]) -> list[str]:
    out: list[str] = []
    for t in tags:
        name = (t or "").strip()
        if not name:
            continue
        if len(name) > 64:
            name = name[:64]
        if name not in out:
            out.append(name)
    return out


def _bank_question_to_response(q: BankQuestion) -> BankQuestionResponse:
    return BankQuestionResponse(
        id=q.id,
        owner_id=q.owner_id,
        question_type=q.question_type,
        text=q.text,
        explanation=q.explanation,
        difficulty=q.difficulty,
        is_active=q.is_active,
        created_at=q.created_at,
        updated_at=q.updated_at,
        options=[BankAnswerOptionResponse.model_validate(o) for o in q.options],
        tags=[t.name for t in q.tags],
    )


@router.get("", response_model=BankQuestionListResponse)
def list_bank_questions(
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, max_length=200),
    tag: str | None = Query(default=None, max_length=64),
    is_active: bool | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(BankQuestion).filter(BankQuestion.owner_id == current_user.id)
    if q:
        query = query.filter(BankQuestion.text.ilike(f"%{q.strip()}%"))
    if is_active is not None:
        query = query.filter(BankQuestion.is_active == is_active)
    if tag:
        query = query.join(BankQuestion.tags).filter(BankTag.name == tag.strip())

    total = query.with_entities(func.count(BankQuestion.id)).scalar() or 0
    rows = query.order_by(BankQuestion.updated_at.desc(), BankQuestion.id.desc()).offset(offset).limit(limit).all()
    items = [
        BankQuestionListItem(
            id=r.id,
            question_type=r.question_type,
            text=r.text,
            difficulty=r.difficulty,
            is_active=r.is_active,
            created_at=r.created_at,
            updated_at=r.updated_at,
            tags=[t.name for t in r.tags],
        )
        for r in rows
    ]
    return BankQuestionListResponse(total=int(total), items=items)


@router.post("", response_model=BankQuestionResponse, status_code=status.HTTP_201_CREATED)
def create_bank_question(
    body: BankQuestionCreate,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    bq = BankQuestion(
        owner_id=current_user.id,
        question_type=body.question_type,
        text=body.text,
        explanation=body.explanation,
        difficulty=body.difficulty,
        is_active=body.is_active,
    )
    db.add(bq)
    db.flush()

    for opt in body.options:
        db.add(
            BankAnswerOption(
                question_id=bq.id,
                order_index=opt.order_index,
                text=opt.text,
                is_correct=opt.is_correct,
            )
        )

    tags = _normalize_tags(body.tags)
    if tags:
        existing = (
            db.query(BankTag)
            .filter(BankTag.owner_id == current_user.id, BankTag.name.in_(tags))
            .all()
        )
        by_name = {t.name: t for t in existing}
        for name in tags:
            t = by_name.get(name)
            if not t:
                t = BankTag(owner_id=current_user.id, name=name)
                db.add(t)
                db.flush()
                by_name[name] = t
            bq.tags.append(t)

    db.commit()
    db.refresh(bq)
    for o in bq.options:
        db.refresh(o)
    return _bank_question_to_response(bq)


@router.get("/{bank_question_id}", response_model=BankQuestionResponse)
def get_bank_question(
    bank_question_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    bq = db.query(BankQuestion).filter(BankQuestion.id == bank_question_id).first()
    if not bq or bq.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return _bank_question_to_response(bq)


@router.put("/{bank_question_id}", response_model=BankQuestionResponse)
def update_bank_question(
    bank_question_id: int,
    body: BankQuestionUpdate,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    bq = db.query(BankQuestion).filter(BankQuestion.id == bank_question_id).first()
    if not bq or bq.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    if body.question_type is not None:
        bq.question_type = body.question_type
    if body.text is not None:
        bq.text = body.text
    if body.explanation is not None:
        bq.explanation = body.explanation
    if body.difficulty is not None:
        bq.difficulty = body.difficulty
    if body.is_active is not None:
        bq.is_active = body.is_active

    if body.options is not None:
        for o in list(bq.options):
            db.delete(o)
        for opt in body.options:
            db.add(
                BankAnswerOption(
                    question_id=bq.id,
                    order_index=opt.order_index,
                    text=opt.text,
                    is_correct=opt.is_correct,
                )
            )

    if body.tags is not None:
        bq.tags.clear()
        tags = _normalize_tags(body.tags)
        if tags:
            existing = (
                db.query(BankTag)
                .filter(BankTag.owner_id == current_user.id, BankTag.name.in_(tags))
                .all()
            )
            by_name = {t.name: t for t in existing}
            for name in tags:
                t = by_name.get(name)
                if not t:
                    t = BankTag(owner_id=current_user.id, name=name)
                    db.add(t)
                    db.flush()
                    by_name[name] = t
                bq.tags.append(t)

    db.commit()
    db.refresh(bq)
    for o in bq.options:
        db.refresh(o)
    return _bank_question_to_response(bq)


@router.delete("/{bank_question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bank_question(
    bank_question_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    bq = db.query(BankQuestion).filter(BankQuestion.id == bank_question_id).first()
    if not bq or bq.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    db.delete(bq)
    db.commit()
    return None


@router.post("/exams/{exam_id}/add", response_model=AddFromBankResponse)
def add_from_bank_to_exam(
    exam_id: int,
    body: AddFromBankRequest,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    if not can_access_exam(current_user, exam):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to access this exam")
    if not can_edit_exam(exam):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot edit exam that is not draft")

    ids = [int(x) for x in body.bank_question_ids if int(x) > 0]
    if not ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No bank_question_ids")

    bank_questions = (
        db.query(BankQuestion)
        .filter(BankQuestion.owner_id == current_user.id, BankQuestion.id.in_(ids))
        .all()
    )
    if not bank_questions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No questions found")

    # Append after last order index.
    last_order = (
        db.query(func.max(Question.order_index))
        .filter(Question.exam_id == exam_id)
        .scalar()
    )
    next_order = int(last_order or 0) + 1

    new_ids: list[int] = []
    for bq in bank_questions:
        q = Question(
            exam_id=exam_id,
            order_index=next_order,
            question_type=bq.question_type,
            text=bq.text,
        )
        db.add(q)
        db.flush()
        for opt in sorted(bq.options, key=lambda o: o.order_index):
            db.add(
                AnswerOption(
                    question_id=q.id,
                    order_index=opt.order_index,
                    text=opt.text,
                    is_correct=opt.is_correct,
                )
            )
        new_ids.append(q.id)
        next_order += 1

    db.commit()
    return AddFromBankResponse(added=len(new_ids), question_ids=new_ids)

