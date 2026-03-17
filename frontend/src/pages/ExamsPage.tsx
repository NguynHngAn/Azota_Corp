import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, FileText, MoreHorizontal } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

const exams = [
  {
    id: 1,
    name: "Math Final Exam",
    class: "Class 10A",
    subject: "Mathematics",
    questions: 40,
    duration: "90 min",
    status: "active",
  },
  {
    id: 2,
    name: "Physics Quiz #3",
    class: "Class 11B",
    subject: "Physics",
    questions: 20,
    duration: "30 min",
    status: "completed",
  },
  {
    id: 3,
    name: "English Essay",
    class: "Class 9C",
    subject: "English",
    questions: 5,
    duration: "60 min",
    status: "draft",
  },
  {
    id: 4,
    name: "Chemistry Mid-term",
    class: "Class 12A",
    subject: "Chemistry",
    questions: 50,
    duration: "120 min",
    status: "active",
  },
  {
    id: 5,
    name: "Biology Test",
    class: "Class 10B",
    subject: "Biology",
    questions: 30,
    duration: "45 min",
    status: "completed",
  },
  {
    id: 6,
    name: "History Exam",
    class: "Class 11A",
    subject: "History",
    questions: 25,
    duration: "60 min",
    status: "draft",
  },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <span className="badge-success">Active</span>;
    case "completed":
      return <span className="badge-info">Completed</span>;
    case "draft":
      return <span className="badge-neutral">Draft</span>;
    default:
      return null;
  }
};

const ExamsPage = () => {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all" ? exams : exams.filter((e) => e.status === filter);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Exams</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and create exams for your classes.
            </p>
          </div>
          <Link to="/exams/create">
            <Button className="gap-1.5 rounded-lg">
              <Plus className="w-4 h-4" /> Create Exam
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="search-input flex-1 max-w-sm">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search exams..."
              className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {["all", "active", "completed", "draft"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Exam Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Class
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Subject
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Questions
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Duration
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exam) => (
                <tr
                  key={exam.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {exam.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {exam.class}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    {exam.subject}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {exam.questions}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {exam.duration}
                  </td>
                  <td className="py-3 px-4">{statusBadge(exam.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExamsPage;
