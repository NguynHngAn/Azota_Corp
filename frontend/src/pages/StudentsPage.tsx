import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";

const studentsList = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "a.nguyen@school.edu",
    class: "Class 10A",
    avgScore: 85,
    examsCompleted: 12,
    trend: "up" as const,
    status: "active",
  },
  {
    id: 2,
    name: "Tran Thi B",
    email: "b.tran@school.edu",
    class: "Class 11B",
    avgScore: 92,
    examsCompleted: 10,
    trend: "up" as const,
    status: "active",
  },
  {
    id: 3,
    name: "Le Van C",
    email: "c.le@school.edu",
    class: "Class 10A",
    avgScore: 68,
    examsCompleted: 11,
    trend: "down" as const,
    status: "active",
  },
  {
    id: 4,
    name: "Pham Thi D",
    email: "d.pham@school.edu",
    class: "Class 12A",
    avgScore: 78,
    examsCompleted: 8,
    trend: "up" as const,
    status: "active",
  },
  {
    id: 5,
    name: "Hoang Van E",
    email: "e.hoang@school.edu",
    class: "Class 9C",
    avgScore: 55,
    examsCompleted: 14,
    trend: "down" as const,
    status: "inactive",
  },
  {
    id: 6,
    name: "Vo Thi F",
    email: "f.vo@school.edu",
    class: "Class 11A",
    avgScore: 91,
    examsCompleted: 9,
    trend: "up" as const,
    status: "active",
  },
  {
    id: 7,
    name: "Do Van G",
    email: "g.do@school.edu",
    class: "Class 10B",
    avgScore: 74,
    examsCompleted: 7,
    trend: "up" as const,
    status: "active",
  },
  {
    id: 8,
    name: "Bui Thi H",
    email: "h.bui@school.edu",
    class: "Class 12A",
    avgScore: 88,
    examsCompleted: 10,
    trend: "up" as const,
    status: "active",
  },
];

const scoreColor = (score: number) => {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-warning";
  return "text-destructive";
};

const StudentsPage = () => {
  const [search, setSearch] = useState("");

  const filtered = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {studentsList.length} students enrolled across all classes.
            </p>
          </div>
          <Button className="gap-1.5 rounded-lg">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>

        {/* Search */}
        <div className="search-input max-w-sm">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Student
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Class
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Exams
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(-2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {student.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                    {student.class}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold ${scoreColor(student.avgScore)}`}
                      >
                        {student.avgScore}
                      </span>
                      {student.trend === "up" ? (
                        <TrendingUp className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {student.examsCompleted}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    {student.status === "active" ? (
                      <span className="badge-success">Active</span>
                    ) : (
                      <span className="badge-neutral">Inactive</span>
                    )}
                  </td>
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

export default StudentsPage;
