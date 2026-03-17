import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const barData = [
  { name: "Lớp 10A", score: 7.8 },
  { name: "Lớp 10B", score: 6.5 },
  { name: "Lớp 11A", score: 8.2 },
  { name: "Lớp 11B", score: 7.1 },
  { name: "Lớp 12A", score: 8.9 },
  { name: "Lớp 12B", score: 7.4 },
];

const pieData = [
  { name: "Giỏi", value: 35 },
  { name: "Khá", value: 40 },
  { name: "TB", value: 20 },
  { name: "Yếu", value: 5 },
];
const COLORS = ["hsl(235,70%,55%)", "hsl(165,55%,48%)", "hsl(40,95%,55%)", "hsl(15,85%,60%)"];

const statusRows = [
  { name: "Nguyễn Văn A", status: "Đã nộp", score: "8.5", time: "25 phút" },
  { name: "Trần Thị B", status: "Đã nộp", score: "9.0", time: "22 phút" },
  { name: "Lê Văn C", status: "Đang làm", score: "—", time: "—" },
  { name: "Phạm Thị D", status: "Chưa bắt đầu", score: "—", time: "—" },
];

const DashboardPreview = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-foreground md:text-4xl">
            Báo cáo & Dashboard trực quan
          </h2>
          <p className="text-lg text-muted-foreground">
            Quản lý kết quả học tập chi tiết, theo dõi tiến độ và đưa ra quyết định dựa trên dữ liệu.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h4 className="mb-4 text-sm font-bold text-foreground">Điểm trung bình theo lớp</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="hsl(235,70%,55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h4 className="mb-4 text-sm font-bold text-foreground">Phân loại học lực</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h4 className="mb-4 text-sm font-bold text-foreground">Trạng thái nộp bài</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Học sinh</th>
                  <th className="pb-2 font-medium">Trạng thái</th>
                  <th className="pb-2 font-medium">Điểm</th>
                </tr>
              </thead>
              <tbody>
                {statusRows.map((r) => (
                  <tr key={r.name} className="border-b border-border/50">
                    <td className="py-2.5 font-medium text-foreground">{r.name}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.status === "Đã nộp"
                            ? "bg-accent/10 text-accent"
                            : r.status === "Đang làm"
                            ? "bg-amber/10 text-amber"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold text-foreground">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
