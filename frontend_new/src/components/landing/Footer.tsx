import { Facebook, Youtube, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-cta">
                <span className="text-sm font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                Edu<span className="text-primary">Test</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nền tảng thi online, giao bài và quản lý học tập toàn diện hàng đầu Việt Nam.
            </p>
          </div>

          {/* Sản phẩm */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-foreground">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Thi online</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Giao bài</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Ngân hàng câu hỏi</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Quản lý LMS</a></li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-foreground">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Điều khoản sử dụng</a></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-foreground">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail size={14} /> support@edutest.vn</li>
              <li className="flex items-center gap-2"><Phone size={14} /> 1900 xxxx</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 EduTest. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
