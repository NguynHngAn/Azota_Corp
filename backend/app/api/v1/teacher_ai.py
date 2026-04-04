from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import require_role
from app.config import settings
from app.models.user import Role, User
from app.schemas.teacher_ai_schema import TeacherAIQuestionRequest, TeacherAIQuestionResponse
from app.services.teacher_ai_service import generate_teacher_ai_questions

router = APIRouter(prefix="/teacher-ai", tags=["teacher-ai"])


@router.post("/questions", response_model=TeacherAIQuestionResponse)
def generate_questions_with_ai(
    body: TeacherAIQuestionRequest,
    current_user: Annotated[User, Depends(require_role(Role.teacher))],
):
    items, provider, note = generate_teacher_ai_questions(body)
    return TeacherAIQuestionResponse(
        task=body.task,
        model=settings.gemini_model,
        provider=provider,
        note=note,
        items=items,
    )
