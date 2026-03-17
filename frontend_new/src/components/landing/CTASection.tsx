import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-cta px-8 py-16 text-center md:px-16 md:py-20"
        >
          {/* Decorative */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <h2 className="relative mb-4 text-3xl font-extrabold text-primary-foreground md:text-4xl lg:text-5xl">
            Bắt đầu hành trình dạy & học thông minh
          </h2>
          <p className="relative mx-auto mb-8 max-w-xl text-lg text-primary-foreground/80">
            Đăng ký miễn phí ngay hôm nay. Không cần thẻ tín dụng. Trải nghiệm đầy đủ tính năng trong 14 ngày.
          </p>
          <div className="relative flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base px-8 shadow-lg">
              Dùng thử miễn phí <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
              <MessageCircle size={18} className="mr-2" /> Liên hệ tư vấn
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
