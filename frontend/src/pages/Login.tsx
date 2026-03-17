import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "teacher") navigate("/teacher", { replace: true });
      else navigate("/student", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-semibold shadow-lg shadow-indigo-400/40">
              A
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Đăng nhập</h1>
            <p className="mt-1 text-sm text-slate-500">Chào mừng bạn quay lại Azota Basic</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full mt-2">
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-4 text-xs text-slate-400 text-center">
            Đây là hệ thống thi online nội bộ. Tài khoản do quản trị viên cung cấp.
          </p>
        </Card>
      </div>
    </div>
  );
}
