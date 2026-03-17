import { motion } from "framer-motion";
import { User, BookOpen, School, Globe, Briefcase } from "lucide-react";

const audiences = [
  {
    icon: User,
    title: "Giáo viên cá nhân",
    benefits: ["Tạo đề nhanh chỉ vài phút", "Giao bài & chấm tự động", "Theo dõi kết quả học sinh"],
    bg: "card-blue",
  },
  {
    icon: BookOpen,
    title: "Trung tâm luyện thi",
    benefits: ["Quản lý ngân hàng đề", "Phân quyền giáo viên", "Báo cáo chi tiết theo lớp"],
    bg: "card-mint",
  },
  {
    icon: School,
    title: "Trường học",
    benefits: ["Tổ chức thi quy mô lớn", "Tích hợp LMS toàn trường", "Chống gian lận nghiêm ngặt"],
    bg: "card-violet",
  },
  {
    icon: Globe,
    title: "Trung tâm ngoại ngữ",
    benefits: ["Đề thi nghe, đọc, viết", "Hỗ trợ đa ngôn ngữ", "Chấm điểm tự luận bằng AI"],
    bg: "card-amber",
  },
  {
    icon: Briefcase,
    title: "Doanh nghiệp",
    benefits: ["Đào tạo nội bộ", "Đánh giá năng lực nhân sự", "Báo cáo tổng hợp cho HR"],
    bg: "card-coral",
  },
];

const AudienceSection = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
            Phù hợp cho mọi đối tượng
          </h2>
          <p className="text-lg text-muted-foreground">
            Từ giáo viên cá nhân đến tổ chức lớn, EduTest đáp ứng mọi nhu cầu kiểm tra đánh giá.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {audiences.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group rounded-2xl p-6 ${a.bg} shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1`}
            >
              <a.icon size={32} className="mb-4 text-primary" />
              <h3 className="mb-3 text-lg font-bold text-foreground">{a.title}</h3>
              <ul className="space-y-2">
                {a.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
