import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles: _allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/landing" replace />;

  return <>{children}</>;
}
