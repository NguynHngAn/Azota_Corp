import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Users, Shield, Zap } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";

const badges = [
  { icon: Users, text: "50,000+ giáo viên tin dùng" },
  { icon: Shield, text: "Chống gian lận thông minh" },
  { icon: Zap, text: "Chấm điểm tức thì" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden gradient-hero-soft">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-40 h-96 w-96 rounded-full bg-violet/5 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-4 w-4 rounded-full bg-amber animate-pulse-soft" />
      <div className="pointer-events-none absolute top-1/4 right-1/3 h-3 w-3 rounded-full bg-mint animate-float" />

      <div className="container relative py-16 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap size={14} /> Nền tảng thi & kiểm tra #1 Việt Nam
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Thi online,{" "}
              <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
                giao bài thông minh
              </span>
              <br />
              chấm điểm tự động
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Tạo đề thi nhanh chóng, giao bài dễ dàng, chấm điểm tự động,
              báo cáo trực quan và chống gian lận bằng AI. Tất cả trong một nền
              tảng duy nhất.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <Button size="lg" className="gradient-cta shadow-button border-0 text-primary-foreground text-base px-8">
                Dùng thử ngay <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/20 text-foreground text-base px-8">
                <Play size={18} className="mr-2" /> Xem demo
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              {badges.map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-card"
                >
                  <b.icon size={14} className="text-primary" />
                  {b.text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <img
              src={heroDashboard}
              alt="EduTest Dashboard"
              className="w-full animate-float"
              loading="eager"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
