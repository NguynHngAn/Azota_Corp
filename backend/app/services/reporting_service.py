from app.models.assignment import Assignment, Submission
from app.schemas.assignment_schema import QuestionAnalyticsItem
from app.services.grading_service import question_correctness_map


def build_top_missed_questions(assignment: Assignment) -> list[QuestionAnalyticsItem]:
    stats = {
        question.id: {
            "question_text": question.text,
            "correct_count": 0,
            "incorrect_count": 0,
            "total_answers": 0,
        }
        for question in assignment.exam.questions
    }

    submissions = [submission for submission in assignment.submissions if submission.submitted_at]
    for submission in submissions:
        correctness = question_correctness_map(submission, assignment.exam)
        for question_id, is_correct in correctness.items():
            row = stats.get(question_id)
            if not row:
                continue
            row["total_answers"] += 1
            if is_correct:
                row["correct_count"] += 1
            else:
                row["incorrect_count"] += 1

    items: list[QuestionAnalyticsItem] = []
    for question_id, row in stats.items():
        total_answers = int(row["total_answers"])
        incorrect_count = int(row["incorrect_count"])
        correct_count = int(row["correct_count"])
        incorrect_rate = round((incorrect_count / total_answers) * 100, 2) if total_answers else 0.0
        items.append(
            QuestionAnalyticsItem(
                question_id=question_id,
                question_text=str(row["question_text"]),
                incorrect_count=incorrect_count,
                correct_count=correct_count,
                total_answers=total_answers,
                incorrect_rate=incorrect_rate,
            )
        )
    items.sort(key=lambda item: (-item.incorrect_rate, -item.incorrect_count, item.question_id))
    return items[:5]
