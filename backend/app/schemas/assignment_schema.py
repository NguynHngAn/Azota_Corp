from datetime import datetime

from pydantic import BaseModel, Field


class AssignmentCreate(BaseModel):
    exam_id: int = Field(..., gt=0)
    class_id: int = Field(..., gt=0)
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0, le=600)


class AssignmentResponse(BaseModel):
    id: int
    exam_id: int
    class_id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AssignmentDetail(AssignmentResponse):
    exam_title: str = ""
    class_name: str = ""


class SubmissionStartResponse(BaseModel):
    submission_id: int
    assignment_id: int
    started_at: datetime
    duration_minutes: int
    exam_title: str
    questions: list[dict]


class SubmissionAnswerPayload(BaseModel):
    question_id: int = Field(..., gt=0)
    chosen_option_ids: list[int] = Field(..., min_length=0)


class SubmitPayload(BaseModel):
    answers: list[SubmissionAnswerPayload]


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    user_id: int
    started_at: datetime
    submitted_at: datetime | None
    score: float | None = None

    model_config = {"from_attributes": True}


class QuestionResultItem(BaseModel):
    question_id: int
    correct: bool


class OptionResultItem(BaseModel):
    id: int
    text: str
    is_correct: bool


class QuestionResultDetail(BaseModel):
    question_id: int
    question_text: str
    correct: bool
    chosen_option_ids: list[int] = []
    options: list[OptionResultItem] = []
    ai_explanation: str | None = None


class SubmissionResultResponse(BaseModel):
    id: int
    assignment_id: int
    user_id: int
    started_at: datetime
    submitted_at: datetime | None
    score: float | None
    exam_title: str = ""
    question_results: list[QuestionResultItem] = []
    question_details: list[QuestionResultDetail] = []

    model_config = {"from_attributes": True}


class MySubmissionSummary(BaseModel):
    submission_id: int
    assignment_id: int
    exam_title: str
    class_name: str
    submitted_at: datetime
    score: float | None = None


class MyAssignmentSubmissionResponse(BaseModel):
    submission_id: int
    assignment_id: int
    exam_title: str
    submitted_at: datetime
    score: float | None = None


class SubmissionAnswerResponse(BaseModel):
    id: int
    submission_id: int
    question_id: int
    chosen_option_ids: list[int]

    model_config = {"from_attributes": True}


class ScoreBucket(BaseModel):
    label: str
    min_score: float
    max_score: float
    count: int


class AssignmentReportResponse(BaseModel):
    assignment_id: int
    exam_id: int
    class_id: int
    exam_title: str
    class_name: str

    total_students: int
    submitted_count: int
    not_submitted_count: int

    average_score: float | None = None
    min_score: float | None = None
    max_score: float | None = None
    score_buckets: list[ScoreBucket]


class AdminOverviewReportResponse(BaseModel):
    total_assignments: int
    total_assigned_students: int
    total_submissions: int
    total_submitted: int

    average_score: float | None = None
    score_buckets: list[ScoreBucket]

