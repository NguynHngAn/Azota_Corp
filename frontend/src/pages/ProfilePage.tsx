import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ProfilePage() {
  const { user } = useAuth();

  const displayName = user?.full_name || user?.email || "";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Hồ sơ tài khoản</p>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Xin chào, {displayName || "Người dùng"}!
            </h1>
            <p className="text-sm text-slate-500">
              Chào mừng bạn quay lại Azota Basic.
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{user?.email}</span>
        </div>
      </header>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Thông tin hồ sơ</h2>
        <p className="text-sm text-slate-500 mb-4">
          Thông tin được lấy từ tài khoản hiện tại trong hệ thống.
        </p>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Tên hiển thị</label>
            <Input value={user?.full_name ?? ""} disabled />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Vai trò</label>
            <Input value={user?.role ?? ""} disabled />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Ngày tạo tài khoản</label>
            <Input value={user?.created_at ?? ""} disabled />
          </div>
        </div>
      </Card>
    </div>
  );
}

