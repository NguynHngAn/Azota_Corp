import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Plus, Tag, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  "All",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Biology",
  "History",
];
const tags = [
  "Algebra",
  "Geometry",
  "Mechanics",
  "Organic",
  "Grammar",
  "Calculus",
  "Thermodynamics",
];

const questions = [
  {
    id: 1,
    text: "What is the value of x in 2x + 5 = 15?",
    type: "Multiple Choice",
    category: "Mathematics",
    tags: ["Algebra"],
    difficulty: "Easy",
  },
  {
    id: 2,
    text: "Explain Newton's Third Law of Motion.",
    type: "Essay",
    category: "Physics",
    tags: ["Mechanics"],
    difficulty: "Medium",
  },
  {
    id: 3,
    text: "Balance the equation: H2 + O2 → H2O",
    type: "Multiple Choice",
    category: "Chemistry",
    tags: ["Organic"],
    difficulty: "Easy",
  },
  {
    id: 4,
    text: "Calculate the derivative of f(x) = 3x² + 2x - 1",
    type: "Multiple Choice",
    category: "Mathematics",
    tags: ["Calculus"],
    difficulty: "Hard",
  },
  {
    id: 5,
    text: "Identify the correct use of past participle.",
    type: "Multiple Choice",
    category: "English",
    tags: ["Grammar"],
    difficulty: "Medium",
  },
  {
    id: 6,
    text: "Describe the process of photosynthesis.",
    type: "Essay",
    category: "Biology",
    tags: [],
    difficulty: "Medium",
  },
];

const diffBadge = (d: string) => {
  switch (d) {
    case "Easy":
      return <span className="badge-success">{d}</span>;
    case "Medium":
      return <span className="badge-warning">{d}</span>;
    case "Hard":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          {d}
        </span>
      );
    default:
      return null;
  }
};

const QuestionBankPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filtered = questions.filter((q) => {
    if (selectedCategory !== "All" && q.category !== selectedCategory)
      return false;
    if (
      selectedTags.length > 0 &&
      !selectedTags.some((t) => q.tags.includes(t))
    )
      return false;
    return true;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Question Bank
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {questions.length} questions across {categories.length - 1}{" "}
              subjects
            </p>
          </div>
          <Button className="gap-1.5 rounded-lg">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="search-input max-w-md">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search questions..."
              className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                  selectedTags.includes(t)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="glass-card p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-neutral">{q.type}</span>
                    <span className="badge-info">{q.category}</span>
                    {diffBadge(q.difficulty)}
                    {q.tags.map((t) => (
                      <span key={t} className="text-xs text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuestionBankPage;
