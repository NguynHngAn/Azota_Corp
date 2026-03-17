import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Cô Nguyễn Thị Hoa",
    role: "Giáo viên Toán – THPT Lê Quý Đôn",
    text: "EduTest giúp tôi tiết kiệm hàng giờ soạn đề và chấm bài. Học sinh cũng thích thú hơn khi làm bài trên nền tảng.",
    avatar: "H",
    color: "bg-primary",
  },
  {
    name: "Thầy Trần Minh Đức",
    role: "Quản lý – Trung tâm IELTS Master",
    text: "Tính năng ngân hàng câu hỏi và chống gian lận rất mạnh. Chúng tôi đã tổ chức hơn 500 kỳ thi mà không gặp sự cố nào.",
    avatar: "Đ",
    color: "bg-mint",
  },
  {
    name: "Em Lê Phương Anh",
    role: "Học sinh lớp 12 – Trường THPT Nguyễn Du",
    text: "Giao diện dễ dùng, làm bài mượt mà. Em thích nhất là được xem kết quả và phân tích điểm yếu ngay sau khi nộp bài.",
    avatar: "A",
    color: "bg-violet",
  },
  {
    name: "Anh Phạm Văn Khoa",
    role: "Giám đốc đào tạo – Công ty ABC Tech",
    text: "EduTest giúp chúng tôi đánh giá năng lực nhân viên nhanh chóng. Báo cáo chi tiết hỗ trợ rất nhiều cho bộ phận HR.",
    avatar: "K",
    color: "bg-amber",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
            Người dùng nói gì?
          </h2>
          <p className="text-lg text-muted-foreground">
            Hàng nghìn giáo viên, trung tâm và học sinh đã tin tưởng sử dụng EduTest.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="mb-3 flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-amber text-amber" />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground ${t.color}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
