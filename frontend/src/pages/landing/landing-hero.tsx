import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Lock, Users, FileText, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Counter, FloatingOrb } from "@/pages/landing/landing-primitives";

export function LandingHero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0">
        <FloatingOrb className="w-[600px] h-[600px] bg-primary/40 -top-40 -left-40" />
        <FloatingOrb className="w-[500px] h-[500px] bg-accent/30 top-20 right-[-10%]" delay={2} />
        <FloatingOrb className="w-[400px] h-[400px] bg-info/25 bottom-0 left-1/3" delay={4} />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-20 lg:pb-32 relative w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Badge
              variant="outline"
              className="gap-2 px-4 py-1.5 border-primary/20 bg-primary/10 text-primary font-medium backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Trusted by 10,000+ educators worldwide
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]"
          >
            Create, manage, and{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-primary to-info bg-clip-text text-transparent">grade exams</span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-info rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                style={{ originX: 0 }}
              />
            </span>{" "}
            online effortlessly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            An all-in-one platform for teachers to create tests, monitor exams, and analyze student performance — saving hours every week.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="rounded-full px-8 h-13 text-base gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 group"
              >
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-13 text-base gap-2 bg-background/50 backdrop-blur-sm border-border/80 hover:bg-muted/80 hover:scale-[1.02] transition-all duration-300"
            >
              <Play className="w-4 h-4" /> Watch demo
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-5 text-xs text-muted-foreground flex items-center justify-center gap-4"
          >
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-accent" /> No credit card
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-accent" /> Free forever plan
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-accent" /> SOC 2 compliant
            </span>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 max-w-5xl mx-auto perspective-[2000px]"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-info/20 rounded-3xl blur-2xl opacity-60" />

            <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/50 bg-muted/30 backdrop-blur-sm">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/50 hover:bg-destructive transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-warning/50 hover:bg-warning transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-accent/50 hover:bg-accent transition-colors" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background/80 border border-border/50 text-xs text-muted-foreground backdrop-blur-sm">
                    <Lock className="w-3 h-3 text-accent" />
                    app.eduflow.com/dashboard
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-gradient-to-b from-muted/20 to-background/50">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Students", val: 1248, icon: <Users className="w-4 h-4" />, color: "text-primary" },
                    { label: "Exams", val: 86, icon: <FileText className="w-4 h-4" />, color: "text-info" },
                    { label: "Submissions", val: 143, icon: <CheckCircle className="w-4 h-4" />, color: "text-accent" },
                    { label: "Avg Score", val: 72, icon: <BarChart3 className="w-4 h-4" />, color: "text-warning" },
                  ].map((s, idx) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + idx * 0.1 }}
                      className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4 hover:bg-card/90 transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <span className={`${s.color} group-hover:scale-110 transition-transform`}>{s.icon}</span>
                        <span className="text-xs">{s.label}</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        <Counter target={s.val} suffix={s.label === "Avg Score" ? "%" : ""} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 h-36">
                    <div className="text-xs text-muted-foreground mb-3 font-medium">Weekly Submissions</div>
                    <div className="flex items-end gap-1.5 h-20 w-full">
                      {[40, 55, 48, 72, 65, 85, 60].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary/60"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: 1.2 + i * 0.08, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 h-36 flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground mb-3 font-medium">Pass Rate</div>
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="88"
                          initial={{ strokeDashoffset: 88 }}
                          animate={{ strokeDashoffset: 88 * 0.06 }}
                          transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">94%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
