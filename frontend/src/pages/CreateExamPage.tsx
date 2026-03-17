import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";

const steps = ["Basic Info", "Questions", "Settings", "Publish"];

const CreateExamPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/exams")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Exam</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Set up a new exam for your class.
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                    i < currentStep
                      ? "bg-success text-success-foreground"
                      : i === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    i === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 mx-2 ${i < currentStep ? "bg-success" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="glass-card p-6">
          {currentStep === 0 && <StepBasicInfo />}
          {currentStep === 1 && <StepQuestions />}
          {currentStep === 2 && <StepSettings />}
          {currentStep === 3 && <StepPublish />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="gap-1.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="gap-1.5 rounded-lg"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="gap-1.5 rounded-lg bg-success hover:bg-success/90">
              <Check className="w-4 h-4" /> Publish Exam
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

function StepBasicInfo() {
  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Exam Title
        </label>
        <input
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="e.g. Math Final Exam"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Class
          </label>
          <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option>Class 10A</option>
            <option>Class 11B</option>
            <option>Class 12A</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Subject
          </label>
          <select className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>English</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Description
        </label>
        <textarea
          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
          placeholder="Brief description of the exam..."
        />
      </div>
    </div>
  );
}

function StepQuestions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add questions to your exam
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 rounded-lg text-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Question
        </Button>
      </div>
      {[1, 2, 3].map((q) => (
        <div
          key={q}
          className="p-4 rounded-lg border border-border bg-background/50 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Question {q}
            </span>
            <div className="flex items-center gap-2">
              <span className="badge-info">Multiple Choice</span>
              <button className="p-1 rounded hover:bg-secondary">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            What is the value of x in the equation 2x + 5 = 15?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["A. x = 5", "B. x = 10", "C. x = 3", "D. x = 7"].map((opt) => (
              <div
                key={opt}
                className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary/30 cursor-pointer transition-colors"
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepSettings() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Duration (minutes)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            defaultValue={90}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Max Attempts
          </label>
          <input
            type="number"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            defaultValue={1}
          />
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Anti-Cheating</h4>
        {[
          {
            label: "Tab switching detection",
            desc: "Alert when student switches browser tabs",
          },
          { label: "Webcam monitoring", desc: "Enable webcam during exam" },
          {
            label: "Shuffle questions",
            desc: "Randomize question order for each student",
          },
          { label: "Disable copy/paste", desc: "Prevent copying exam content" },
        ].map((item) => (
          <label
            key={item.label}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              className="mt-0.5 rounded border-input accent-primary"
            />
            <div>
              <span className="text-sm font-medium text-foreground">
                {item.label}
              </span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function StepPublish() {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-success" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Ready to Publish
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Your exam is ready. Review the details below and publish when you're
        ready.
      </p>
      <div className="glass-card p-4 max-w-sm mx-auto text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Title</span>
          <span className="text-foreground font-medium">Math Final Exam</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Class</span>
          <span className="text-foreground">Class 10A</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Questions</span>
          <span className="text-foreground">3</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="text-foreground">90 min</span>
        </div>
      </div>
    </div>
  );
}

export default CreateExamPage;
