import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  Users,
  FileText,
  CheckCircle,
  BarChart3,
  TrendingUp,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const monthlyData = [
  { month: "Jan", students: 980, exams: 45, submissions: 2100 },
  { month: "Feb", students: 1020, exams: 52, submissions: 2450 },
  { month: "Mar", students: 1050, exams: 48, submissions: 2300 },
  { month: "Apr", students: 1100, exams: 61, submissions: 2800 },
  { month: "May", students: 1150, exams: 58, submissions: 2650 },
  { month: "Jun", students: 1200, exams: 72, submissions: 3100 },
  { month: "Jul", students: 1180, exams: 40, submissions: 1800 },
  { month: "Aug", students: 1220, exams: 55, submissions: 2500 },
  { month: "Sep", students: 1248, exams: 68, submissions: 3200 },
];

const subjectPerformance = [
  { subject: "Math", avg: 72 },
  { subject: "Physics", avg: 68 },
  { subject: "Chemistry", avg: 75 },
  { subject: "English", avg: 81 },
  { subject: "Biology", avg: 70 },
  { subject: "History", avg: 77 },
];

const examCompletion = [
  { name: "Completed", value: 68 },
  { name: "In Progress", value: 18 },
  { name: "Not Started", value: 14 },
];

const COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(221, 83%, 53%)",
  "hsl(215, 16%, 47%)",
];

const activityByHour = [
  { hour: "8am", active: 45 },
  { hour: "9am", active: 120 },
  { hour: "10am", active: 180 },
  { hour: "11am", active: 150 },
  { hour: "12pm", active: 80 },
  { hour: "1pm", active: 95 },
  { hour: "2pm", active: 200 },
  { hour: "3pm", active: 170 },
  { hour: "4pm", active: 130 },
  { hour: "5pm", active: 60 },
];

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(214, 32%, 91%)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  fontSize: "12px",
};

const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance overview and insights.
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
            title="Exams Created"
            value="86"
            change="+18%"
            trend="up"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Total Submissions"
            value="24,500"
            change="+8%"
            trend="up"
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <StatCard
            title="Avg Pass Rate"
            value="78%"
            change="+3%"
            trend="up"
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Growth + Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Growth Overview
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient
                    id="colorStudents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                  <linearGradient
                    id="colorSubmissions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(142, 71%, 45%)"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(142, 71%, 45%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 32%, 91%)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(215, 16%, 47%)"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStudents)"
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSubmissions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Exam Completion
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={examCompletion}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {examCompletion.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {examCompletion.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Performance + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Subject Performance (Avg Score)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 32%, 91%)"
                />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(215, 16%, 47%)"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="hsl(215, 16%, 47%)"
                  domain={[0, 100]}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="avg"
                  fill="hsl(221, 83%, 53%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Student Activity by Hour
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityByHour}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 32%, 91%)"
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(215, 16%, 47%)"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(221, 83%, 53%)", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
