import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { toast } from "sonner";

// Mock exam data
const mockExam = {
  title: "Math Final Exam",
  duration: 90,
  questions: [
    {
      id: "q1",
      text: "What is the value of x in 2x + 5 = 15?",
      type: "multiple_choice",
      options: ["x = 5", "x = 10", "x = 3", "x = 7"],
      points: 2,
    },
    {
      id: "q2",
      text: "Simplify: (3x² + 2x) - (x² - 4x)",
      type: "multiple_choice",
      options: ["2x² + 6x", "4x² - 2x", "2x² - 6x", "2x² + 2x"],
      points: 2,
    },
    {
      id: "q3",
      text: "What is the slope of the line y = 3x + 7?",
      type: "multiple_choice",
      options: ["3", "7", "-3", "1/3"],
      points: 2,
    },
    {
      id: "q4",
      text: "Explain the Pythagorean theorem and provide an example.",
      type: "essay",
      options: [],
      points: 5,
    },
    {
      id: "q5",
      text: "Calculate the area of a circle with radius 5.",
      type: "multiple_choice",
      options: ["25π", "10π", "5π", "50π"],
      points: 2,
    },
  ],
};

const TakeExamPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(mockExam.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    toast.success("Exam submitted successfully!");
  };

  const question = mockExam.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft < 300;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-in">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Send className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Exam Submitted!
          </h1>
          <p className="text-muted-foreground">
            You answered {answeredCount} of {mockExam.questions.length}{" "}
            questions.
          </p>
          <Button onClick={() => navigate("/")} className="rounded-lg">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Exam header */}
      <header className="h-14 border-b border-border bg-card sticky top-0 z-30 flex items-center justify-between px-6">
        <div className="font-semibold text-foreground">{mockExam.title}</div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-medium ${
            isUrgent
              ? "bg-destructive/10 text-destructive"
              : "bg-secondary text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
          {isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Question nav sidebar */}
        <div className="w-16 border-r border-border bg-card p-2 space-y-1.5 overflow-y-auto">
          {mockExam.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(i)}
              className={`w-full aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                i === currentQuestion
                  ? "bg-primary text-primary-foreground"
                  : answers[q.id]
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question content */}
        <div className="flex-1 p-6 max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Question {currentQuestion + 1} of {mockExam.questions.length}
              </span>
              <span className="badge-info">{question.points} pts</span>
            </div>

            <h2 className="text-lg font-medium text-foreground">
              {question.text}
            </h2>

            {question.type === "multiple_choice" ? (
              <div className="space-y-3">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(question.id, opt)}
                    className={`w-full text-left p-4 rounded-lg border text-sm transition-all ${
                      answers[question.id] === opt
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                        : "border-border text-foreground hover:border-primary/30 hover:bg-secondary/30"
                    }`}
                  >
                    <span className="font-medium text-muted-foreground mr-3">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[question.id] || ""}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full h-40 px-4 py-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Write your answer here..."
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
                className="gap-1.5 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              {currentQuestion < mockExam.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="gap-1.5 rounded-lg"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="gap-1.5 rounded-lg bg-success hover:bg-success/90"
                >
                  <Send className="w-4 h-4" /> Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExamPage;
