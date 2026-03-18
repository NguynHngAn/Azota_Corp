import { useAuth } from "@/hooks/useAuthContext";
import Index from "@/pages/Index";
import StudentDashboard from "@/pages/student/StudentDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

/**
 * Renders the appropriate dashboard based on user role
 */
const RoleDashboard = () => {
  const { role } = useAuth();

  if (role === "student") return <StudentDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <Index />;
};

export default RoleDashboard;
