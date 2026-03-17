import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  Users,
  FileText,
  CheckCircle,
  BarChart3,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const submissionData = [
  { day: "Mon", submissions: 45 },
  { day: "Tue", submissions: 62 },
  { day: "Wed", submissions: 58 },
  { day: "Thu", submissions: 80 },
  { day: "Fri", submissions: 74 },
  { day: "Sat", submissions: 32 },
  { day: "Sun", submissions: 18 },
];

const scoreData = [
  { range: "0-20", count: 4 },
  { range: "21-40", count: 12 },
  { range: "41-60", count: 28 },
  { range: "61-80", count: 45 },
  { range: "81-100", count: 31 },
];

const recentExams = [
  {
    name: "Math Final Exam",
    class: "Class 10A",
    questions: 40,
    status: "active",
    submissions: 28,
  },
  {
    name: "Physics Quiz #3",
    class: "Class 11B",
    questions: 20,
    status: "completed",
    submissions: 35,
  },
  {
    name: "English Essay",
    class: "Class 9C",
    questions: 5,
    status: "draft",
    submissions: 0,
  },
  {
    name: "Chemistry Mid-term",
    class: "Class 12A",
    questions: 50,
    status: "active",
    submissions: 15,
  },
];

const activityFeed = [
  { text: "Nguyen Van A submitted Math Final Exam", time: "2 min ago" },
  { text: "Class 11B completed Physics Quiz #3", time: "15 min ago" },
  { text: "New student registered: Tran Thi B", time: "1 hour ago" },
  { text: "Exam 'English Essay' was created", time: "2 hours ago" },
  { text: "Le Van C scored 95/100 on Chemistry", time: "3 hours ago" },
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

const Index = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, Teacher. Here's what's happening today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value="1,248"
            change="+12%"
            trend="up"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Total Exams"
            value="86"
            change="+5%"
            trend="up"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Submissions Today"
            value="143"
            change="+23%"
            trend="up"
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <StatCard
            title="Average Score"
            value="72.4"
            change="-2%"
            trend="down"
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Submissions chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Submissions This Week
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={submissionData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(221, 83%, 53%)"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(221, 83%, 53%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 32%, 91%)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(215, 16%, 47%)"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(214, 32%, 91%)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSub)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Score distribution */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scoreData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 32%, 91%)"
                />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(215, 16%, 47%)"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(214, 32%, 91%)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(142, 71%, 45%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent exams */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Recent Exams
              </h3>
              <a
                href="/exams"
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-3">
              {recentExams.map((exam, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {exam.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {exam.class} · {exam.questions} questions
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {exam.submissions} submissions
                    </span>
                    {statusBadge(exam.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Activity Feed
            </h3>
            <div className="space-y-4">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-sm text-foreground leading-snug">
                      {item.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
