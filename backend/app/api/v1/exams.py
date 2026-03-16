from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Role, User
from app.models.exam import Exam, Question, AnswerOption, QuestionType
from app.schemas.exam_schema import (
    ExamCreate,
    ExamUpdate,
    ExamResponse,
    ExamDetail,
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    AnswerOptionResponse,
)
from app.api.deps import get_current_user, require_role
from app.services.exam_service import can_edit_exam, can_access_exam

router = APIRouter(prefix="/exams", tags=["exams"])


def _exam_owner_or_admin(current_user: User, exam: Exam) -> None:
    if not can_access_exam(current_user, exam):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to access this exam")


def _exam_editable(exam: Exam) -> None:
    if not can_edit_exam(exam):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot edit exam that is not draft")


def _question_response(question: Question) -> QuestionResponse:
    return QuestionResponse(
        id=question.id,
        exam_id=question.exam_id,
        order_index=question.order_index,
        question_type=question.question_type,
        text=question.text,
        options=[AnswerOptionResponse.model_validate(o) for o in question.options],
    )


@router.post("", response_model=ExamDetail, status_code=status.HTTP_201_CREATED)
def create_exam(
    body: ExamCreate,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = Exam(
        title=body.title,
        description=body.description,
        created_by=current_user.id,
        is_draft=body.is_draft,
    )
    db.add(exam)
    db.flush()
    if body.questions:
        for q in body.questions:
            question = Question(
                exam_id=exam.id,
                order_index=q.order_index,
                question_type=q.question_type,
                text=q.text,
            )
            db.add(question)
            db.flush()
            for i, opt in enumerate(q.options):
                db.add(
                    AnswerOption(
                        question_id=question.id,
                        order_index=opt.order_index,
                        text=opt.text,
                        is_correct=opt.is_correct,
                    )
                )
    db.commit()
    db.refresh(exam)
    db.refresh(exam)  # load questions
    for q in exam.questions:
        db.refresh(q)
        for o in q.options:
            db.refresh(o)
    return ExamDetail(
        id=exam.id,
        title=exam.title,
        description=exam.description,
        created_by=exam.created_by,
        is_draft=exam.is_draft,
        created_at=exam.created_at,
        updated_at=exam.updated_at,
        questions=[_question_response(q) for q in exam.questions],
    )


@router.get("", response_model=list[ExamResponse])
def list_exams(
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    q = db.query(Exam).filter(Exam.created_by == current_user.id)
    return q.order_by(Exam.id).all()


@router.get("/{exam_id}", response_model=ExamDetail)
def get_exam(
    exam_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    _exam_owner_or_admin(current_user, exam)
    return ExamDetail(
        id=exam.id,
        title=exam.title,
        description=exam.description,
        created_by=exam.created_by,
        is_draft=exam.is_draft,
        created_at=exam.created_at,
        updated_at=exam.updated_at,
        questions=[_question_response(q) for q in exam.questions],
    )


@router.put("/{exam_id}", response_model=ExamResponse)
def update_exam(
  exam_id: int,
  body: ExamUpdate,
  current_user: Annotated[User, Depends(require_role(Role.teacher))],
  db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    _exam_owner_or_admin(current_user, exam)
    _exam_editable(exam)
    if body.title is not None:
        exam.title = body.title
    if body.description is not None:
        exam.description = body.description
    if body.is_draft is not None:
        exam.is_draft = body.is_draft
    db.commit()
    db.refresh(exam)
    return exam


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(
    exam_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    _exam_owner_or_admin(current_user, exam)
    _exam_editable(exam)
    db.delete(exam)
    db.commit()
    return None


@router.post("/{exam_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def add_question(
    exam_id: int,
    body: QuestionCreate,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    _exam_owner_or_admin(current_user, exam)
    _exam_editable(exam)
    question = Question(
        exam_id=exam_id,
        order_index=body.order_index,
        question_type=body.question_type,
        text=body.text,
    )
    db.add(question)
    db.flush()
    for opt in body.options:
        db.add(
            AnswerOption(
                question_id=question.id,
                order_index=opt.order_index,
                text=opt.text,
                is_correct=opt.is_correct,
            )
        )
    db.commit()
    db.refresh(question)
    for o in question.options:
        db.refresh(o)
    return _question_response(question)


@router.put("/{exam_id}/questions/{question_id}", response_model=QuestionResponse)
def update_question(
    exam_id: int,
    question_id: int,
    body: QuestionUpdate,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    _exam_owner_or_admin(current_user, exam)
    _exam_editable(exam)
    question = db.query(Question).filter(Question.id == question_id, Question.exam_id == exam_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    if body.order_index is not None:
        question.order_index = body.order_index
    if body.question_type is not None:
        question.question_type = body.question_type
    if body.text is not None:
        question.text = body.text
    if body.options is not None:
        for o in question.options:
            db.delete(o)
        for i, opt in enumerate(body.options):
            db.add(
                AnswerOption(
                    question_id=question.id,
                    order_index=opt.order_index,
                    text=opt.text,
                    is_correct=opt.is_correct,
                )
            )
    db.commit()
    db.refresh(question)
    for o in question.options:
        db.refresh(o)
    return _question_response(question)


@router.delete("/{exam_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    exam_id: int,
    question_id: int,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
    db: Session = Depends(get_db),
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    _exam_owner_or_admin(current_user, exam)
    _exam_editable(exam)
    question = db.query(Question).filter(Question.id == question_id, Question.exam_id == exam_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    db.delete(question)
    db.commit()
    return None
