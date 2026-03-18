// import { useAuth } from "../context/AuthContext";

// export function StudentDashboard() {
//   const { user, logout } = useAuth();

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
//           <h1 className="text-xl font-semibold">Student Dashboard</h1>
//           <div className="flex items-center gap-4">
//             <span className="text-gray-600">{user?.email}</span>
//             <button
//               onClick={logout}
//               className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>
//       <main className="max-w-7xl mx-auto py-8 px-4">
//         <p className="text-gray-600">Student placeholder. View assigned exams, take exams, see results.</p>
//       </main>
//     </div>
//   );
// }
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuthContext";
import {
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    // Find class by join code
    // const { data: cls, error: findError } = await supabase
    //   .from("classes")
    //   .select("id, name")
    //   .eq("join_code", joinCode.trim())
    //   .single();

    // if (findError || !cls) {
    //   toast.error("Class not found. Check the join code.");
    //   setJoining(false);
    //   return;
    // }

    // const { error } = await supabase.from("class_members").insert({
    //   class_id: cls.id,
    //   student_id: (await supabase.auth.getUser()).data.user!.id,
    // });
    // setJoining(false);
    // if (error) {
    //   if (error.code === "23505") toast.info("You already joined this class");
    //   else toast.error(error.message);
    // } else {
    //   toast.success(`Joined ${cls.name}!`);
    //   setJoinCode("");
    // }
  };

  // Mock data for now
  const upcomingExams = [
    {
      id: 1,
      title: "Math Final Exam",
      class: "Class 10A",
      duration: "90 min",
      date: "Today, 2:00 PM",
    },
    {
      id: 2,
      title: "Physics Quiz #4",
      class: "Class 11B",
      duration: "30 min",
      date: "Tomorrow, 9:00 AM",
    },
  ];

  const recentResults = [
    {
      id: 1,
      title: "English Essay",
      score: 85,
      maxScore: 100,
      date: "2 days ago",
    },
    {
      id: 2,
      title: "Chemistry Mid-term",
      score: 72,
      maxScore: 100,
      date: "1 week ago",
    },
    {
      id: 3,
      title: "Biology Test",
      score: 91,
      maxScore: 100,
      date: "2 weeks ago",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hello, {profile?.display_name || "Student"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's your learning overview.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">4</div>
                <div className="text-xs text-muted-foreground">My Classes</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-xs text-muted-foreground">
                  Exams Completed
                </div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">82.4</div>
                <div className="text-xs text-muted-foreground">
                  Average Score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join class */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Join a Class
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter class join code..."
              className="flex-1 max-w-xs px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <Button
              onClick={handleJoinClass}
              disabled={joining}
              className="gap-1.5 rounded-lg"
              size="sm"
            >
              <Plus className="w-4 h-4" /> {joining ? "Joining..." : "Join"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upcoming exams */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Upcoming Exams
            </h3>
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {exam.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {exam.class} · {exam.duration}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {exam.date}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 text-xs rounded-lg h-7"
                    >
                      Start
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent results */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Recent Results
            </h3>
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {result.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${
                        result.score >= 85
                          ? "text-success"
                          : result.score >= 70
                            ? "text-primary"
                            : "text-warning"
                      }`}
                    >
                      {result.score}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{result.maxScore}
                    </span>
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

export default StudentDashboard;
