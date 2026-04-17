import json
import time
from urllib import error, parse, request

from fastapi import HTTPException, status

from app.config import settings
from app.models.exam import QuestionType
from app.schemas.question_bank_schema import BankAnswerOptionCreate, BankQuestionCreate
from app.schemas.teacher_ai_schema import AssignmentInsightResponse, TeacherAIQuestionRequest


_GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _is_gemini_unavailable(detail_text: str) -> bool:
    normalized = (detail_text or "").upper()
    return '"STATUS": "UNAVAILABLE"' in normalized or '"CODE": 503' in normalized


def _is_gemini_quota_limited(detail_text: str) -> bool:
    normalized = (detail_text or "").upper()
    return '"CODE": 429' in normalized or "QUOTA" in normalized or "RATE LIMIT" in normalized


def _request_gemini_json(req: request.Request, *, timeout: int = 90) -> dict:
    """
    Retry short transient Gemini outages before failing with a user-friendly message.
    """
    retries = 2
    backoffs = [0.6, 1.2]
    last_http_error: error.HTTPError | None = None

    for attempt in range(retries + 1):
        try:
            with request.urlopen(req, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            last_http_error = exc
            retryable = exc.code == 503 or _is_gemini_unavailable(detail)
            if retryable and attempt < retries:
                time.sleep(backoffs[attempt])
                continue
            if retryable:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Gemini is temporarily overloaded. Please retry in a few moments.",
                )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini request failed: {detail or exc.reason}",
            )
        except error.URLError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini connection failed: {exc.reason}",
            )

    if last_http_error is not None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini is temporarily overloaded. Please retry in a few moments.",
        )
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Gemini request failed unexpectedly",
    )


def _normalize_tags(tags: list[str]) -> list[str]:
    normalized: list[str] = []
    for tag in tags:
        value = (tag or "").strip()
        if not value or value in normalized:
            continue
        normalized.append(value[:64])
    return normalized[:10]


def _extract_topic(payload: TeacherAIQuestionRequest) -> str:
    raw = (
        payload.source_question_text
        if payload.task == "suggest_similar_questions" and (payload.source_question_text or "").strip()
        else payload.prompt
    )
    cleaned = " ".join((raw or "").strip().split())
    return cleaned[:120] or "the requested topic"


def _build_local_fallback_items(payload: TeacherAIQuestionRequest) -> list[BankQuestionCreate]:
    topic = _extract_topic(payload)
    normalized_tags = _normalize_tags(payload.tags)
    requested_type = payload.question_type or QuestionType.single_choice
    items: list[BankQuestionCreate] = []

    for idx in range(payload.count):
        question_type = requested_type
        if payload.question_type is None and idx % 3 == 2:
            question_type = QuestionType.multiple_choice

        if payload.task == "suggest_similar_questions":
            text = f"Similar practice question {idx + 1} about: {topic}"
        else:
            text = f"Practice question {idx + 1} about: {topic}"

        if question_type == QuestionType.single_choice:
            options = [
                BankAnswerOptionCreate(order_index=0, text=f"Core idea related to {topic}", is_correct=True),
                BankAnswerOptionCreate(order_index=1, text=f"Common misconception about {topic}", is_correct=False),
                BankAnswerOptionCreate(order_index=2, text=f"Unrelated detail for {topic}", is_correct=False),
                BankAnswerOptionCreate(order_index=3, text=f"Too broad statement about {topic}", is_correct=False),
            ]
        else:
            options = [
                BankAnswerOptionCreate(order_index=0, text=f"Correct aspect A of {topic}", is_correct=True),
                BankAnswerOptionCreate(order_index=1, text=f"Correct aspect B of {topic}", is_correct=True),
                BankAnswerOptionCreate(order_index=2, text=f"Incorrect aspect of {topic}", is_correct=False),
                BankAnswerOptionCreate(order_index=3, text=f"Another incorrect aspect of {topic}", is_correct=False),
            ]

        items.append(
            BankQuestionCreate(
                question_type=question_type,
                text=text,
                explanation=f"Local fallback question generated for teacher workflow continuity about {topic}.",
                difficulty=payload.difficulty,
                is_active=True,
                options=options,
                tags=normalized_tags,
            )
        )

    return items


def _build_system_prompt() -> str:
    return (
        "You are an AI assistant for teachers building question banks. "
        "Return ONLY valid JSON (no markdown fences, no extra text). "
        "Output MUST be an object with a single key: \"items\". "
        "\"items\" MUST be an array of question items. "
        "Each question item MUST include exactly these keys: "
        "\"question_type\", \"text\", \"explanation\", \"difficulty\", \"is_active\", \"tags\", \"options\". "
        "Allowed values: "
        "\"question_type\" in [\"single_choice\",\"multiple_choice\"]. "
        "\"difficulty\" in [\"easy\",\"medium\",\"hard\"]. "
        "\"is_active\" must be true. "
        "\"tags\" must be an array of strings (can be empty). "
        "Each option MUST include exactly these keys: \"order_index\", \"text\", \"is_correct\". "
        "\"order_index\" must be an integer starting from 0. "
        "\"options\" length must be at least 2. "
        "For single_choice: exactly 1 option has is_correct=true. "
        "For multiple_choice: at least 1 option has is_correct=true. "
        "Ensure answer key matches the question."
    )


def _build_user_prompt(payload: TeacherAIQuestionRequest) -> str:
    type_hint = payload.question_type.value if payload.question_type else "single_choice or multiple_choice"
    shared = (
        f"Language: {payload.language}\n"
        f"Count: {payload.count}\n"
        f"Preferred difficulty: {payload.difficulty.value}\n"
        f"Allowed question type: {type_hint}\n"
        f"Preferred tags: {', '.join(payload.tags) if payload.tags else 'none'}\n"
        "Return JSON in this shape: "
        '{"items":[{"question_type":"single_choice","text":"...","explanation":"...","difficulty":"medium","is_active":true,'
        '"tags":["..."],"options":[{"order_index":0,"text":"...","is_correct":true},{"order_index":1,"text":"...","is_correct":false}]}]}\n'
    )
    if payload.task == "generate_questions":
        return (
            f"{shared}"
            "Task: generate new question bank items from the teacher prompt below.\n"
            f"Teacher prompt: {payload.prompt.strip()}"
        )
    return (
        f"{shared}"
        "Task: create similar but not identical question bank items based on the source question.\n"
        f"Teacher prompt: {payload.prompt.strip()}\n"
        f"Source question: {(payload.source_question_text or '').strip()}"
    )


def _extract_text(response_payload: dict) -> str:
    candidates = response_payload.get("candidates") or []
    if not candidates:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Gemini returned no candidates")
    parts = (((candidates[0] or {}).get("content") or {}).get("parts")) or []
    texts = [part.get("text", "") for part in parts if isinstance(part, dict)]
    text = "\n".join(t for t in texts if t).strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Gemini returned empty content")
    return text


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    # Remove markdown fences if Gemini still wraps JSON in them.
    if "```" in cleaned:
        fence_start = cleaned.find("```")
        fence_end = cleaned.find("```", fence_start + 3)
        if fence_end > fence_start:
            cleaned = cleaned[fence_start + 3 : fence_end].strip()
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to repair common JSON issues (e.g., trailing commas).
        import re

        # Remove trailing commas before closing braces/brackets.
        # Example: {"a":1,} -> {"a":1} or [1,2,] -> [1,2]
        repaired = re.sub(r",\s*([}\]])", r"\1", cleaned)
        try:
            return json.loads(repaired)
        except json.JSONDecodeError:
            pass

        # Try to extract the first balanced JSON object/array from the content.
        def _extract_balanced_json_candidate(src: str) -> str | None:
            first_obj = src.find("{")
            first_arr = src.find("[")
            if first_obj == -1 and first_arr == -1:
                return None
            start = first_obj if (first_arr == -1 or first_obj != -1 and first_obj < first_arr) else first_arr
            stack: list[str] = []
            in_string = False
            escape = False
            open_to_close = {"{": "}", "[": "]"}
            close_to_open = {"}": "{", "]": "["}
            for i in range(start, len(src)):
                ch = src[i]
                if in_string:
                    if escape:
                        escape = False
                        continue
                    if ch == "\\":
                        escape = True
                        continue
                    if ch == '"':
                        in_string = False
                    continue

                if ch == '"':
                    in_string = True
                    continue

                if ch in open_to_close:
                    stack.append(open_to_close[ch])
                    continue

                if ch in close_to_open:
                    if not stack:
                        continue
                    expected = stack[-1]
                    if ch == expected:
                        stack.pop()
                        if not stack:
                            return src[start : i + 1].strip()
                    continue

            return None

        candidate = _extract_balanced_json_candidate(repaired) or _extract_balanced_json_candidate(cleaned)
        if candidate:
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                # If the API returns only an array, wrap it into {items:[...]}.
                try:
                    arr = json.loads(candidate)
                    if isinstance(arr, list):
                        return {"items": arr}
                except Exception:
                    pass

        snippet = repaired[:200] if len(repaired) >= 200 else repaired
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini did not return valid JSON. Snippet: {snippet}",
        )


def _normalize_generated_item(item: dict, fallback: TeacherAIQuestionRequest) -> BankQuestionCreate:
    raw_type = str(item.get("question_type") or fallback.question_type or QuestionType.single_choice.value).strip()
    question_type = QuestionType(raw_type)
    raw_options = item.get("options") or []
    options: list[BankAnswerOptionCreate] = []
    for index, raw_option in enumerate(raw_options):
        if not isinstance(raw_option, dict):
            continue
        text = str(raw_option.get("text") or "").strip()
        if not text:
            continue
        options.append(
            BankAnswerOptionCreate(
                order_index=index,
                text=text,
                is_correct=bool(raw_option.get("is_correct")),
            )
        )
    if len(options) < 2:
        raise ValueError("Each generated question must contain at least 2 options")
    tags = item.get("tags")
    normalized_tags = _normalize_tags(tags if isinstance(tags, list) else fallback.tags)
    return BankQuestionCreate(
        question_type=question_type,
        text=str(item.get("text") or "").strip(),
        explanation=str(item.get("explanation") or "").strip() or None,
        difficulty=item.get("difficulty") or fallback.difficulty,
        is_active=True,
        options=options,
        tags=normalized_tags,
    )


def generate_teacher_ai_questions(payload: TeacherAIQuestionRequest) -> tuple[list[BankQuestionCreate], str, str | None]:
    api_key = (settings.gemini_api_key or "").strip()
    model = (settings.gemini_model or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_API_KEY is not configured on the backend",
        )
    if not model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_MODEL is not configured on the backend",
        )

    endpoint = f"{_GEMINI_API_BASE}/{parse.quote(model, safe='')}:generateContent?key={parse.quote(api_key, safe='')}"
    # Estimate tokens needed roughly grows with number of questions.
    # Hard-coding too low can truncate JSON => invalid JSON parse errors.
    effectiveCount = max(1, min(int(payload.count), 20))
    estimatedTokens = 800 + effectiveCount * 350
    # Higher cap reduces the chance that Gemini truncates JSON mid-object.
    maxOutputTokens = min(9000, max(900, estimatedTokens))
    request_body = {
        "system_instruction": {"parts": [{"text": _build_system_prompt()}]},
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
            "maxOutputTokens": maxOutputTokens,
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": _build_user_prompt(payload)}],
            }
        ],
    }
    req = request.Request(
        endpoint,
        data=json.dumps(request_body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        response_payload = _request_gemini_json(req, timeout=90)
    except HTTPException as exc:
        detail_text = str(exc.detail)
        if exc.status_code in (
            status.HTTP_503_SERVICE_UNAVAILABLE,
            status.HTTP_502_BAD_GATEWAY,
        ) and (
            "temporarily overloaded" in detail_text.lower()
            or _is_gemini_quota_limited(detail_text)
            or "quota" in detail_text.lower()
        ):
            return (
                _build_local_fallback_items(payload),
                "local-fallback",
                "Gemini was unavailable or quota-limited, so locally generated practice questions were returned.",
            )
        raise

    content_text = _extract_text(response_payload)
    parsed = _extract_json(content_text)
    raw_items = parsed.get("items")
    if not isinstance(raw_items, list) or not raw_items:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini did not return any question items",
        )

    items: list[BankQuestionCreate] = []
    for raw_item in raw_items[: payload.count]:
        if not isinstance(raw_item, dict):
            continue
        try:
            items.append(_normalize_generated_item(raw_item, payload))
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))
    if not items:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini did not return any valid question items",
        )
    return items, "gemini", None


def _build_assignment_insight_system_prompt() -> str:
    return (
        "You are an assistant helping teachers interpret assignment statistics. "
        "Return ONLY valid JSON (no markdown fences, no extra text). "
        "Output MUST be an object with exactly these keys: "
        "\"summary\" (string: 2-4 sentences in Vietnamese), "
        "\"strengths\" (array of 0-3 short bullet strings in Vietnamese; empty if none), "
        "\"concerns\" (array of 0-3 short bullet strings in Vietnamese; empty if none), "
        "\"suggestions\" (array of 2-5 concrete teaching or review suggestions in Vietnamese). "
        "Use ONLY the numbers and facts from the input JSON. Do not invent scores, names, or class details. "
        "If data is very sparse, say so briefly in summary and keep suggestions modest."
    )


def _normalize_insight_payload(data: dict) -> AssignmentInsightResponse:
    summary = str(data.get("summary") or "").strip()
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Gemini did not return a summary for assignment insight",
        )

    def _str_list(key: str, max_items: int) -> list[str]:
        raw = data.get(key)
        if not isinstance(raw, list):
            return []
        out: list[str] = []
        for item in raw[:max_items]:
            text = str(item).strip()
            if text:
                out.append(text)
        return out

    return AssignmentInsightResponse(
        model="",
        provider="gemini",
        summary=summary,
        strengths=_str_list("strengths", 5),
        concerns=_str_list("concerns", 5),
        suggestions=_str_list("suggestions", 8),
    )


def generate_assignment_insight(stats: dict) -> AssignmentInsightResponse:
    """Build Vietnamese teacher-facing commentary from aggregated assignment stats (no PII)."""
    api_key = (settings.gemini_api_key or "").strip()
    model = (settings.gemini_model or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_API_KEY is not configured on the backend",
        )
    if not model:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_MODEL is not configured on the backend",
        )

    endpoint = f"{_GEMINI_API_BASE}/{parse.quote(model, safe='')}:generateContent?key={parse.quote(api_key, safe='')}"
    user_text = (
        "Analyze the following assignment statistics and produce the JSON response.\n"
        f"Statistics JSON:\n{json.dumps(stats, ensure_ascii=False)}"
    )
    request_body = {
        "system_instruction": {"parts": [{"text": _build_assignment_insight_system_prompt()}]},
        "generationConfig": {
            "temperature": 0.25,
            "responseMimeType": "application/json",
            "maxOutputTokens": 2048,
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_text}],
            }
        ],
    }
    req = request.Request(
        endpoint,
        data=json.dumps(request_body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    response_payload = _request_gemini_json(req, timeout=90)

    content_text = _extract_text(response_payload)
    parsed = _extract_json(content_text)
    if not isinstance(parsed, dict):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Gemini returned invalid insight payload")
    insight = _normalize_insight_payload(parsed)
    insight.model = model
    return insight
