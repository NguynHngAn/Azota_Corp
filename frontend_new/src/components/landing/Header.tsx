import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navItems = [
  "Sản phẩm",
  "Tính năng",
  "Đối tượng",
  "Bảng giá",
  "Hướng dẫn",
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between md:h-18">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-cta">
            <span className="text-lg font-bold text-primary-foreground">E</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            Edu<span className="text-primary">Test</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Đăng nhập
          </Button>
          <Button size="sm" className="gradient-cta shadow-button border-0 text-primary-foreground">
            Dùng thử miễn phí
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {item}
              </a>
            ))}
            <hr className="my-2 border-border" />
            <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">
              Đăng nhập
            </Button>
            <Button size="sm" className="gradient-cta shadow-button border-0 text-primary-foreground">
              Dùng thử miễn phí
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
