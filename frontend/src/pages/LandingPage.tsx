import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100">
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
            A
          </div>
          <span className="text-base font-semibold text-slate-900">Azota Basic</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-slate-700 hover:text-slate-900">
            Đăng nhập
          </Link>
          <Button>
            <Link to="/login" className="text-white">
              Dùng thử miễn phí
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            Nền tảng thi & kiểm tra online
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-900">
            Thi online,{" "}
            <span className="text-indigo-600">giao bài thông minh</span>
            <br />
            chấm điểm tự động
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-xl">
            Tạo đề thi nhanh chóng, giao bài dễ dàng, chấm điểm tự động, báo cáo trực quan và chống gian lận
            cơ bản. Tất cả trong một nền tảng duy nhất.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Link to="/login" className="text-white">
                Bắt đầu ngay
              </Link>
            </Button>
            <Button variant="secondary">
              <Link to="/login" className="text-slate-800">
                Xem dashboard
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative animate-float-soft">
          <div className="absolute inset-0 bg-indigo-200/60 blur-3xl rounded-full -z-10" />
          <div className="rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden h-[320px] md:h-[360px]">
            <img
              src="/dashboard-preview.png"
              alt="Exam analytics preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </main>
    </div>
  );
}


