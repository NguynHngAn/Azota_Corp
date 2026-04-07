from datetime import datetime

from pydantic import BaseModel, Field

from app.models.exam import QuestionType


class ExamRoomOption(BaseModel):
    id: int
    order_index: int
    text: str


class ExamRoomQuestion(BaseModel):
    id: int
    order_index: int
    question_type: QuestionType
    text: str
    options: list[ExamRoomOption]



class AssignmentCreate(BaseModel):
    exam_id: int = Field(..., gt=0)
    class_id: int = Field(..., gt=0)
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0, le=600)
    shuffle_questions: bool = False
    shuffle_options: bool = False
    max_violations: int = Field(default=3, ge=1, le=20)


class AssignmentResponse(BaseModel):
    id: int
    exam_id: int
    class_id: int
    start_time: datetime
    end_time: datetime
    duration_minutes: int
    shuffle_questions: bool
    shuffle_options: bool
    max_violations: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AssignmentDetail(AssignmentResponse):
    exam_title: str = ""
    class_name: str = ""
    # Student's latest submitted score (0–100), when list_my_assignments includes submission row.
    score: float | None = None


class SubmissionAnswerPayload(BaseModel):
    question_id: int = Field(..., gt=0)
    chosen_option_ids: list[int] = Field(..., min_length=0)


class SubmissionStartResponse(BaseModel):
    submission_id: int
    assignment_id: int
    started_at: datetime
    duration_minutes: int
    exam_title: str
    max_violations: int
    # violation_count: int = 0
    # questions: list[dict]
    # saved_answers: list[SubmissionAnswerPayload] = Field(default_factory=list)
    violation_count: int
    questions: list[ExamRoomQuestion]
    saved_answers: list[SubmissionAnswerPayload] = []
    # backward-compatible additive fields
    server_now: datetime | None = None
    deadline_at: datetime | None = None



class SubmitPayload(BaseModel):
    answers: list[SubmissionAnswerPayload]
    submit_reason: str | None = None


class AutosaveAnswersResponse(BaseModel):
    saved: bool = True


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    user_id: int
    started_at: datetime
    submitted_at: datetime | None
    score: float | None = None
    auto_submitted: bool = False
    submit_reason: str | None = None
    violation_count: int = 0

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
    order_index: int = 0


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


class QuestionAnalyticsItem(BaseModel):
    question_id: int
    question_text: str
    incorrect_count: int
    correct_count: int
    total_answers: int
    incorrect_rate: float


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
    top_missed_questions: list[QuestionAnalyticsItem] = []


class AdminOverviewReportResponse(BaseModel):
    total_assignments: int
    total_assigned_students: int
    total_submissions: int
    total_submitted: int

    average_score: float | None = None
    score_buckets: list[ScoreBucket]
