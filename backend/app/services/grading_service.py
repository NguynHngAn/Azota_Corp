from app.models.assignment import Submission
from app.models.exam import Exam, QuestionType


def question_correctness_map(submission: Submission, exam: Exam) -> dict[int, bool]:
    answers_by_question = {a.question_id: (a.chosen_option_ids or []) for a in submission.answers}
    question_results: dict[int, bool] = {}
    for question in exam.questions:
        correct_ids = [o.id for o in question.options if o.is_correct]
        chosen = answers_by_question.get(question.id, [])
        set_correct = set(correct_ids)
        set_chosen = set(chosen)
        if question.question_type == QuestionType.single_choice:
            correct = bool(set_correct and set_chosen == set_correct and len(chosen) == 1)
        else:
            correct = set_chosen == set_correct
        question_results[question.id] = correct
    return question_results


def grade_submission(submission: Submission, exam: Exam) -> tuple[float, list[tuple[int, bool]]]:
    """
    Grade a submission: compare chosen_option_ids to correct options per question.
    Single choice: correct iff exactly one option chosen and it is the correct one.
    Multiple choice: correct iff chosen set equals correct set (all and only).
    Return (score_0_100, [(question_id, correct), ...]).
    """
    correctness = question_correctness_map(submission, exam)
    total = 0
    correct_count = 0
    question_results: list[tuple[int, bool]] = []
    for question in exam.questions:
        total += 1
        correct = correctness.get(question.id, False)
        if correct:
            correct_count += 1
        question_results.append((question.id, correct))
    if total == 0:
        return 0.0, []
    score = round((correct_count / total) * 100.0, 2)
    return score, question_results
