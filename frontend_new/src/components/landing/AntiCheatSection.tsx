import { motion } from "framer-motion";
import { Camera, Monitor, Brain, AlertTriangle, Maximize, Eye } from "lucide-react";
import antiCheatImg from "@/assets/anti-cheat.png";

const features = [
  { icon: Camera, title: "Giám sát webcam", desc: "Ghi hình và chụp ảnh tự động trong suốt kỳ thi." },
  { icon: Maximize, title: "Khóa toàn màn hình", desc: "Ngăn học sinh chuyển tab, mở ứng dụng khác." },
  { icon: Brain, title: "AI phân tích hành vi", desc: "Phát hiện hành vi bất thường, cảnh báo theo thời gian thực." },
  { icon: AlertTriangle, title: "Cảnh báo thông minh", desc: "Thông báo tức thì khi phát hiện vi phạm." },
  { icon: Eye, title: "Xem lại phiên thi", desc: "Giáo viên có thể xem lại toàn bộ quá trình làm bài." },
  { icon: Monitor, title: "Kiểm soát trình duyệt", desc: "Chặn copy, paste, chuột phải và phím tắt." },
];

const AntiCheatSection = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-violet-light/30 to-background" />
      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet/10 px-4 py-1.5 text-sm font-medium text-violet">
              <Brain size={14} /> AI & Bảo mật
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
              Chống gian lận thông minh
            </h2>
            <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
              Hệ thống giám sát đa lớp giúp kỳ thi diễn ra nghiêm túc, công bằng mà vẫn thân thiện với thí sinh.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{f.title}</h4>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <img src={antiCheatImg} alt="Chống gian lận AI" className="max-w-md w-full" loading="lazy" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AntiCheatSection;
