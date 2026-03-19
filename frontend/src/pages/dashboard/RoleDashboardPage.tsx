import { useAuth } from "@/hooks/useAuthContext";
import TeacherDashboard from "@/pages/dashboard/TeacherDashboardPage";
import StudentDashboard from "@/pages/dashboard/StudentDashboardPage";
import AdminDashboard from "@/pages/dashboard/AdminDashboardPage";

/**
 * Renders the appropriate dashboard based on user role
 */
const RoleDashboard = () => {
  const { role } = useAuth();

  if (role === "student") return <StudentDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <TeacherDashboard />;
};

export default RoleDashboard;
