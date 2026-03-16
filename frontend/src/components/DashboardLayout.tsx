import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useExam } from "../context";

interface DashboardLayoutProps {
  title: string;
  navLinks: { to: string; label: string }[];
}

export function DashboardLayout({ title, navLinks }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const exam = useExam();

  const isStudent = user?.role === "student";
  const effectiveNavLinks =
    isStudent && exam.inProgress && exam.assignmentId
      ? [
          {
            to: `/student/assignments/${exam.assignmentId}/exam`,
            label: "Exam in progress",
          },
        ]
      : navLinks;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
        <nav className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto">
            {effectiveNavLinks.map(({ to, label }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`py-2 text-sm border-b-2 ${
                    active
                      ? "border-blue-600 text-blue-700 font-medium"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
