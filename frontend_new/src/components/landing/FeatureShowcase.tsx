import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.png";
import antiCheat from "@/assets/anti-cheat.png";
import dashboardPreview from "@/assets/dashboard-preview.png";

const showcases = [
  {
    title: "Thi online, giao bài & chấm điểm",
    desc: "Tạo kỳ thi trong vài phút, giao bài cho học sinh qua link hoặc mã lớp, và nhận kết quả ngay lập tức.",
    bullets: [
      "Tạo đề trắc nghiệm, tự luận, điền khuyết",
      "Giao bài qua link, QR code hoặc mã lớp",
      "Chấm điểm tự động, trả kết quả tức thì",
      "Hỗ trợ thi theo lịch hoặc bất kỳ lúc nào",
    ],
    image: heroDashboard,
    reverse: false,
    bg: "card-blue",
  },
  {
    title: "AI hỗ trợ & chống gian lận",
    desc: "Đảm bảo kỳ thi nghiêm túc, công bằng với hệ thống giám sát thông minh và AI hỗ trợ toàn diện.",
    bullets: [
      "Giám sát webcam và ghi hình",
      "Khóa trình duyệt, phát hiện chuyển tab",
      "Phân tích hành vi bất thường bằng AI",
      "AI tạo đề, chấm tự luận, phân tích dữ liệu",
    ],
    image: antiCheat,
    reverse: true,
    bg: "card-violet",
  },
  {
    title: "Báo cáo trực quan & phân tích",
    desc: "Theo dõi tiến độ học tập, phân tích điểm mạnh/yếu và đưa ra quyết định dựa trên dữ liệu.",
    bullets: [
      "Biểu đồ cột, tròn, bảng điểm trực quan",
      "Phân tích điểm theo lớp, môn, cá nhân",
      "Theo dõi tiến độ nộp bài theo thời gian thực",
      "Xuất báo cáo PDF, Excel chuyên nghiệp",
    ],
    image: dashboardPreview,
    reverse: false,
    bg: "card-mint",
  },
];

const FeatureShowcase = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container space-y-20">
        <div className="mx-auto mb-4 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
            Khám phá sản phẩm
          </h2>
          <p className="text-lg text-muted-foreground">
            Trải nghiệm sâu các tính năng giúp EduTest trở thành nền tảng hàng đầu.
          </p>
        </div>

        {showcases.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${s.reverse ? "lg:direction-rtl" : ""}`}
          >
            <div className={s.reverse ? "lg:order-2" : ""}>
              <h3 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">{s.title}</h3>
              <p className="mb-6 text-muted-foreground leading-relaxed">{s.desc}</p>
              <ul className="space-y-3">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`rounded-3xl ${s.bg} p-6 ${s.reverse ? "lg:order-1" : ""}`}>
              <img src={s.image} alt={s.title} className="w-full rounded-2xl" loading="lazy" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeatureShowcase;
