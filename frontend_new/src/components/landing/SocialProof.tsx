import { motion } from "framer-motion";
import { GraduationCap, School, FileCheck, Server } from "lucide-react";

const stats = [
  { icon: GraduationCap, value: "50,000+", label: "Giáo viên sử dụng", color: "text-primary" },
  { icon: School, value: "3,200+", label: "Trường & trung tâm", color: "text-mint" },
  { icon: FileCheck, value: "12M+", label: "Bài kiểm tra đã tạo", color: "text-violet" },
  { icon: Server, value: "99.9%", label: "Uptime ổn định", color: "text-amber" },
];

const logos = [
  "Trường THPT Nguyễn Du",
  "ĐH Bách Khoa",
  "Trung tâm IELTS Pro",
  "Trường Quốc tế ABC",
  "Viện Đào tạo XYZ",
  "Trung tâm Toán học VN",
];

const SocialProof = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        {/* Logos */}
        <p className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Được tin dùng bởi hàng nghìn tổ chức giáo dục
        </p>
        <div className="mb-14 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {logos.map((name) => (
            <div
              key={name}
              className="rounded-xl border border-border bg-muted/40 px-5 py-2.5 text-sm font-semibold text-muted-foreground"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-card transition-shadow hover:shadow-card-hover"
            >
              <s.icon size={28} className={`mx-auto mb-3 ${s.color}`} />
              <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
