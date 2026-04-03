from collections.abc import Mapping

from app.config import settings
from app.models.assignment import Submission
from app.models.exam import Exam


def ai_explanations_enabled() -> bool:
    """
    Check whether AI explanations are enabled via config/env.
    """
    # Boolean flag from settings; defaults to False if not set.
    return bool(getattr(settings, "ai_explanation_enabled", False))


def generate_explanations_for_submission(submission: Submission, exam: Exam) -> Mapping[int, str]:
    """
    Generate simple AI-like explanations per question for a submission.
    This function is side-effect free: it does not modify DB or scores.

    Current implementation is heuristic/template-based so that the system
    works without external AI; it can be replaced with a real LLM call later.
    Returns a mapping {question_id: explanation_text}.
    """
    if not ai_explanations_enabled():
        return {}

    try:
        explanations: dict[int, str] = {}
        for q in exam.questions:
            correct_options = [o.text for o in q.options if o.is_correct]
            if not correct_options:
                continue
            joined = "; ".join(correct_options)
            explanations[q.id] = (
                "The correct answer is based on the options that best match the requirement of the question. "
                f"For this question, the correct option(s) are: {joined}. "
                "These options were marked as correct when the exam was created, "
                "so other choices are considered incorrect."
            )
        return explanations
    except Exception:
        # Fail closed: if anything goes wrong, just return no explanations.
        return {}

