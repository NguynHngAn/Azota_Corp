import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp, staggerContainer } from "@/pages/landing/landing-motion";

export function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="text-center max-w-2xl mx-auto mb-16"
    >
      <motion.p variants={fadeUp} className="text-sm font-semibold text-primary mb-3 tracking-wide uppercase">
        {badge}
      </motion.p>
      <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

export function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}
