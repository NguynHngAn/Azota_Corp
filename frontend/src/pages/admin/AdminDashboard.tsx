import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  Users,
  GraduationCap,
  FileText,
  School,
  Search,
  MoreHorizontal,
  Shield,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mockUsers = [
  {
    id: 1,
    name: "Nguyen Van A",
    email: "a@school.edu",
    role: "teacher",
    school: "Ha Noi HS",
    status: "active",
    joined: "2025-01-15",
  },
  {
    id: 2,
    name: "Tran Thi B",
    email: "b@school.edu",
    role: "student",
    school: "Ha Noi HS",
    status: "active",
    joined: "2025-02-20",
  },
  {
    id: 3,
    name: "Le Van C",
    email: "c@school.edu",
    role: "teacher",
    school: "HCMC Academy",
    status: "active",
    joined: "2025-03-01",
  },
  {
    id: 4,
    name: "Pham Thi D",
    email: "d@school.edu",
    role: "student",
    school: "Ha Noi HS",
    status: "inactive",
    joined: "2025-01-10",
  },
  {
    id: 5,
    name: "Hoang Van E",
    email: "e@school.edu",
    role: "admin",
    school: "System",
    status: "active",
    joined: "2024-12-01",
  },
  {
    id: 6,
    name: "Vo Thi F",
    email: "f@school.edu",
    role: "student",
    school: "Da Nang School",
    status: "active",
    joined: "2025-03-10",
  },
  {
    id: 7,
    name: "Do Van G",
    email: "g@school.edu",
    role: "teacher",
    school: "HCMC Academy",
    status: "active",
    joined: "2025-02-15",
  },
  {
    id: 8,
    name: "Bui Thi H",
    email: "h@school.edu",
    role: "student",
    school: "Da Nang School",
    status: "active",
    joined: "2025-03-05",
  },
];

const roleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
          Admin
        </span>
      );
    case "teacher":
      return <span className="badge-info">Teacher</span>;
    case "student":
      return <span className="badge-success">Student</span>;
    default:
      return null;
  }
};

const AdminDashboard = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = mockUsers.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (
      search &&
      !u.name.toLowerCase().includes(search.toLowerCase()) &&
      !u.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform overview and user management.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value="1,842"
            change="+15%"
            trend="up"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Teachers"
            value="156"
            change="+8%"
            trend="up"
            icon={<GraduationCap className="w-5 h-5" />}
          />
          <StatCard
            title="Active Exams"
            value="342"
            change="+22%"
            trend="up"
            icon={<FileText className="w-5 h-5" />}
          />
          <StatCard
            title="Schools"
            value="24"
            change="+3"
            trend="up"
            icon={<School className="w-5 h-5" />}
          />
        </div>

        {/* User management */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            User Management
          </h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="search-input flex-1 max-w-sm">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {["all", "admin", "teacher", "student"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    roleFilter === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    School
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(-2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {user.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{roleBadge(user.role)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      {user.school}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {user.status === "active" ? (
                        <span className="badge-success">Active</span>
                      ) : (
                        <span className="badge-neutral">Inactive</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {user.joined}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
