import { motion } from "framer-motion";
import {
  Monitor,
  FileText,
  Database,
  CheckSquare,
  ShieldAlert,
  BarChart3,
  Layers,
  Sparkles,
} from "lucide-react";

const features = [
  { icon: Monitor, title: "Thi online & offline", desc: "Tổ chức kỳ thi trực tuyến hoặc thi giấy, linh hoạt mọi tình huống." },
  { icon: FileText, title: "Tạo đề nhanh", desc: "Soạn đề trắc nghiệm, tự luận, điền khuyết chỉ trong vài phút." },
  { icon: Database, title: "Ngân hàng câu hỏi", desc: "Lưu trữ, phân loại, tái sử dụng hàng nghìn câu hỏi dễ dàng." },
  { icon: CheckSquare, title: "Chấm điểm tự động", desc: "Trắc nghiệm chấm tức thì, tự luận hỗ trợ AI rubric." },
  { icon: ShieldAlert, title: "Chống gian lận", desc: "Giám sát webcam, khóa trình duyệt, phát hiện hành vi bất thường." },
  { icon: BarChart3, title: "Báo cáo chi tiết", desc: "Biểu đồ trực quan, phân tích điểm yếu, đề xuất cải thiện." },
  { icon: Layers, title: "Quản lý LMS", desc: "Lớp học, khóa học, bài giảng, quản lý học viên toàn diện." },
  { icon: Sparkles, title: "Hỗ trợ AI", desc: "Tạo đề từ nội dung, chấm tự luận, phân tích dữ liệu thông minh." },
];

const FeaturesGrid = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
            Tính năng toàn diện
          </h2>
          <p className="text-lg text-muted-foreground">
            Mọi thứ bạn cần để tổ chức kiểm tra, đánh giá và quản lý học tập hiệu quả.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:gradient-cta group-hover:text-primary-foreground">
                <f.icon size={24} />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
