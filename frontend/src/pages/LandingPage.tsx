import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  ArrowRight,
  Play,
  FileText,
  Database,
  CheckCircle,
  Shield,
  Eye,
  BarChart3,
  Users,
  Zap,
  Star,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Award,
  MousePointerClick,
  Sparkles,
  Globe,
  Lock,
  Languages,
  Palette,
  Sun,
  Moon,
  Monitor,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";

/* ─── Data ─── */
const features = [
  { icon: <FileText className="w-5 h-5" />, title: "Create exams in minutes", desc: "Intuitive drag-and-drop exam builder with multiple question types, auto-save, and templates. Import questions directly from PDF or Word documents.", gradient: "from-primary/20 to-info/20" },
  { icon: <Database className="w-5 h-5" />, title: "Question bank management", desc: "Organize thousands of questions by subject, difficulty, and tags. Reuse across exams effortlessly.", gradient: "from-accent/20 to-primary/20" },
  { icon: <CheckCircle className="w-5 h-5" />, title: "Automatic grading", desc: "Exams are graded the moment students submit — multiple choice, fill-in-the-blank, and matching questions scored instantly with zero manual effort.", gradient: "from-info/20 to-accent/20" },
  { icon: <Eye className="w-5 h-5" />, title: "Real-time monitoring", desc: "Watch students take exams live. See progress, time remaining, and submission status in real time.", gradient: "from-warning/20 to-primary/20" },
  { icon: <Shield className="w-5 h-5" />, title: "Anti-cheating technology", desc: "Multi-layered exam integrity: tab switch detection flags wandering students, fullscreen mode locks the browser, and optional webcam monitoring ensures identity verification.", gradient: "from-destructive/20 to-warning/20" },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Advanced analytics", desc: "Visualize score distributions, compare class performance side-by-side, and drill into per-question difficulty — all in interactive, exportable dashboards.", gradient: "from-primary/20 to-accent/20" },
];

const steps = [
  { num: "01", title: "Create your exam", desc: "Use our intuitive builder to craft exams with multiple question types.", icon: <FileText className="w-6 h-6" /> },
  { num: "02", title: "Share with students", desc: "Send an exam link or code. Students join with one click.", icon: <Globe className="w-6 h-6" /> },
  { num: "03", title: "Students take the exam", desc: "Secure, timed testing with anti-cheating features.", icon: <MousePointerClick className="w-6 h-6" /> },
  { num: "04", title: "Instant results", desc: "Students see their score, correct answers, and detailed feedback the second they submit.", icon: <Sparkles className="w-6 h-6" /> },
];

const plans = [
  { name: "Free", price: "$0", period: "forever", desc: "For individual teachers getting started.", features: ["Up to 30 students", "5 exams per month", "Basic question types", "Auto grading", "Email support"], cta: "Start free", highlighted: false },
  { name: "Pro", price: "$19", period: "/month", desc: "For teachers who need more power.", features: ["Unlimited students", "Unlimited exams", "All question types", "Anti-cheating tools", "Advanced analytics", "Priority support"], cta: "Start free trial", highlighted: true },
  { name: "School", price: "$99", period: "/month", desc: "For schools and training centers.", features: ["Everything in Pro", "Unlimited teachers", "Admin dashboard", "Custom branding", "API access", "Dedicated support"], cta: "Contact sales", highlighted: false },
];

const testimonials = [
  { quote: "This platform cut my exam grading time by 90%. I can now focus on actually teaching instead of paper management.", name: "Ms. Nguyen Thi Lan", role: "Mathematics Teacher, Hanoi", avatar: "NL" },
  { quote: "The anti-cheating features give me confidence that exam results are fair. The real-time monitoring is a game changer.", name: "Mr. Tran Van Duc", role: "Physics Teacher, HCMC", avatar: "TD" },
  { quote: "We deployed this across 12 departments. The admin dashboard makes managing 200+ teachers seamless.", name: "Dr. Le Minh Chau", role: "Director, ABC Training Center", avatar: "LC" },
];

const faqs = [
  { q: "Is there a free plan?", a: "Yes! Our free plan lets you create up to 5 exams per month with 30 students. No credit card required." },
  { q: "Do students need to install anything?", a: "No. Students access exams through any web browser on desktop, tablet, or mobile. No app download needed." },
  { q: "How does the anti-cheating system work?", a: "We use multiple layers: tab switch detection, fullscreen enforcement, webcam monitoring, copy-paste prevention, and AI-powered behavioral analysis." },
  { q: "Can I import existing questions?", a: "Yes, you can import questions from Excel, CSV, or Word documents. We also support bulk import with automatic formatting." },
  { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit. We comply with GDPR and maintain SOC 2 certification." },
  { q: "Can I customize the exam interface?", a: "Pro and School plans include custom branding options — add your logo, colors, and custom domain." },
];

const trustedLogos = ["University of Science", "Tech Academy", "Global Institute", "Metro School", "EduPrime"];

/* ─── Animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const } }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={staggerContainer} className="text-center max-w-2xl mx-auto mb-16">
      <motion.p variants={fadeUp} className="text-sm font-semibold text-primary mb-3 tracking-wide uppercase">{badge}</motion.p>
      <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">{title}</motion.h2>
      {subtitle && <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">{subtitle}</motion.p>}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
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
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Floating orb for hero background ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─── Main Component ─── */
const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <GraduationCap className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">EduFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {["Features", "How it works", "Pricing", "FAQ"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all duration-200">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Gradient mesh background */}
        <div className="absolute inset-0">
          <FloatingOrb className="w-[600px] h-[600px] bg-primary/40 -top-40 -left-40" />
          <FloatingOrb className="w-[500px] h-[500px] bg-accent/30 top-20 right-[-10%]" delay={2} />
          <FloatingOrb className="w-[400px] h-[400px] bg-info/25 bottom-0 left-1/3" delay={4} />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-20 lg:pb-32 relative w-full">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Trusted by 10,000+ educators worldwide
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
                <Button size="lg" className="rounded-full px-8 h-13 text-base gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 group">
                  Start for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full px-8 h-13 text-base gap-2 bg-background/50 backdrop-blur-sm border-border/80 hover:bg-muted/80 hover:scale-[1.02] transition-all duration-300">
                <Play className="w-4 h-4" /> Watch demo
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-5 text-xs text-muted-foreground flex items-center justify-center gap-4"
            >
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-accent" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-accent" /> Free forever plan</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-accent" /> SOC 2 compliant</span>
            </motion.p>
          </div>

          {/* ─── Hero Mockup (Glassmorphism) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 max-w-5xl mx-auto perspective-[2000px]"
          >
            <div className="relative">
              {/* Glow behind mockup */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-info/20 rounded-3xl blur-2xl opacity-60" />

              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Browser chrome */}
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

                {/* Dashboard content */}
                <div className="p-6 sm:p-8 bg-gradient-to-b from-muted/20 to-background/50">
                  {/* Stat cards */}
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

                  {/* Charts mockup */}
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
                            cx="18" cy="18" r="14" fill="none"
                            stroke="hsl(var(--accent))"
                            strokeWidth="3" strokeLinecap="round"
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

      {/* ─── Trusted By ─── */}
      <section className="border-y border-border/50 bg-muted/20 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-10">Trusted by leading educational institutions</p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6"
          >
            {trustedLogos.map((name, i) => (
              <motion.div key={name} variants={fadeUp} custom={i} className="flex items-center gap-2.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">{name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 lg:py-32 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge="Features" title="Everything you need to run exams online" subtitle="From exam creation to analytics — all the tools teachers need, in one platform." />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-7 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge="How it works" title="Get started in 4 simple steps" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((s, i) => (
              <motion.div key={s.num} variants={fadeUp} className="relative group">
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-7 h-full hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary mb-4 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">Step {s.num}</span>
                  <h3 className="text-base font-semibold text-foreground mt-2 mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-primary/25" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Automatic Grading & Instant Results Showcase ─── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Mockup left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/15 to-info/10 rounded-3xl blur-2xl opacity-60" />
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-accent/5 overflow-hidden">
                {/* Grading mockup header */}
                <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground">Exam Results</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Graded in 0.3s</span>
                </div>
                {/* Score hero */}
                <div className="p-6 text-center border-b border-border/30">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border-4 border-accent/30 flex items-center justify-center mx-auto mb-3"
                  >
                    <span className="text-3xl font-extrabold text-accent">92</span>
                  </motion.div>
                  <p className="text-sm font-medium text-foreground">Excellent Performance!</p>
                  <p className="text-xs text-muted-foreground mt-1">23 of 25 questions correct</p>
                </div>
                {/* Question breakdown */}
                <div className="p-5 space-y-3">
                  {[
                    { q: "Q1. What is photosynthesis?", correct: true },
                    { q: "Q2. Newton's second law states...", correct: true },
                    { q: "Q3. The capital of France is...", correct: true },
                    { q: "Q4. Which element has atomic number 6?", correct: false },
                    { q: "Q5. Solve: 2x + 5 = 15", correct: true },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + idx * 0.08 }}
                      className="flex items-center justify-between rounded-lg bg-muted/30 border border-border/20 px-4 py-2.5"
                    >
                      <span className="text-xs text-foreground truncate flex-1">{item.q}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 ${item.correct ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"}`}>
                        {item.correct ? <CheckCircle className="w-3 h-3" /> : <span className="text-xs font-bold">✕</span>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Copy right */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="order-1 lg:order-2">
              <motion.p variants={fadeUp} className="text-sm font-semibold text-accent mb-3 uppercase tracking-wide">Grading & Results</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
                Auto-grade exams.{" "}
                <span className="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent">Deliver results instantly.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">
                No more hours spent grading papers. The platform scores every submission the moment it's turned in — students see their results, correct answers, and performance breakdown immediately.
              </motion.p>
              <motion.div variants={staggerContainer} className="mt-8 space-y-4">
                {[
                  { text: "Scores calculated in under a second", icon: <Zap className="w-3.5 h-3.5" /> },
                  { text: "Students see results immediately after submitting", icon: <Sparkles className="w-3.5 h-3.5" /> },
                  { text: "Question-by-question breakdown with correct answers", icon: <FileText className="w-3.5 h-3.5" /> },
                  { text: "Teachers get class-wide score summaries automatically", icon: <BarChart3 className="w-3.5 h-3.5" /> },
                ].map((item) => (
                  <motion.div key={item.text} variants={fadeUp} className="flex items-center gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-accent group-hover:bg-accent/30 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} className="mt-10">
                <Link to="/signup">
                  <Button className="rounded-full px-6 gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-shadow group bg-accent text-accent-foreground hover:bg-accent/90">
                    Try automatic grading <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Analytics showcase ─── */}
      <section className="py-24 lg:py-32 relative">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">Analytics & Insights</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
                Data-driven teaching,{" "}
                <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">effortless insights</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">
                Every exam generates rich analytics automatically. Spot struggling students, identify tricky questions, and track class progress over time — all without spreadsheets.
              </motion.p>

              <motion.div variants={staggerContainer} className="mt-10 space-y-6">
                {[
                  {
                    icon: <BarChart3 className="w-5 h-5" />,
                    title: "Score distribution",
                    desc: "See how scores spread across your class with bell-curve visualizations. Instantly identify outliers and adjust grading curves.",
                    color: "bg-primary/15 text-primary",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: "Class performance",
                    desc: "Compare performance across classes and subjects. Track improvement over time with trend lines and cohort analysis.",
                    color: "bg-accent/15 text-accent",
                  },
                  {
                    icon: <Eye className="w-5 h-5" />,
                    title: "Detailed analytics",
                    desc: "Drill into per-question difficulty, time-spent analysis, and student-level breakdowns. Export everything as PDF or CSV.",
                    color: "bg-info/15 text-info",
                  },
                ].map((item) => (
                  <motion.div key={item.title} variants={fadeUp} className="flex gap-4 group">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Analytics mockup — enhanced */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-info/10 rounded-3xl blur-2xl opacity-50" />
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Analytics Dashboard</span>
                  </div>
                  <div className="flex gap-1">
                    {["7D", "30D", "All"].map((period, i) => (
                      <span key={period} className={`text-[10px] px-2.5 py-1 rounded-md cursor-pointer transition-colors ${i === 1 ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                        {period}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Score distribution chart */}
                  <div className="rounded-xl bg-muted/30 border border-border/20 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-muted-foreground font-medium">Score Distribution</div>
                      <div className="text-xs text-muted-foreground">Avg: <span className="text-foreground font-semibold">72.4</span></div>
                    </div>
                    <div className="flex items-end gap-1.5 h-24">
                      {[
                        { h: 8, label: "0-10" }, { h: 12, label: "10-20" }, { h: 20, label: "20-30" },
                        { h: 35, label: "30-40" }, { h: 52, label: "40-50" }, { h: 70, label: "50-60" },
                        { h: 88, label: "60-70" }, { h: 95, label: "70-80" }, { h: 75, label: "80-90" }, { h: 45, label: "90-100" },
                      ].map((bar, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary/50 relative group/bar cursor-pointer hover:from-primary hover:to-primary/70 transition-colors"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${bar.h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.3 + i * 0.04 }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] text-muted-foreground">0</span>
                      <span className="text-[9px] text-muted-foreground">50</span>
                      <span className="text-[9px] text-muted-foreground">100</span>
                    </div>
                  </div>

                  {/* Class performance comparison */}
                  <div className="rounded-xl bg-muted/30 border border-border/20 p-5">
                    <div className="text-xs text-muted-foreground font-medium mb-4">Class Performance</div>
                    <div className="space-y-3">
                      {[
                        { name: "Class 10A", avg: 82, color: "bg-primary" },
                        { name: "Class 11B", avg: 74, color: "bg-info" },
                        { name: "Class 9C", avg: 68, color: "bg-accent" },
                        { name: "Class 12A", avg: 91, color: "bg-warning" },
                      ].map((cls, idx) => (
                        <motion.div
                          key={cls.name}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-[10px] text-muted-foreground w-16 shrink-0">{cls.name}</span>
                          <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${cls.color}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${cls.avg}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: 0.7 + idx * 0.1 }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-foreground w-8 text-right">{cls.avg}%</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: "72.4", label: "Avg Score", color: "text-foreground" },
                      { val: "94%", label: "Pass Rate", color: "text-accent" },
                      { val: "1.2k", label: "Students", color: "text-primary" },
                      { val: "86", label: "Exams", color: "text-info" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-muted/30 border border-border/20 p-3 text-center hover:bg-muted/50 transition-colors">
                        <div className={`text-base font-bold ${stat.color}`}>{stat.val}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Anti-Cheating Showcase ─── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-destructive/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.p variants={fadeUp} className="text-sm font-semibold text-destructive mb-3 uppercase tracking-wide">Exam Integrity</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
                Keep exams{" "}
                <span className="bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">fair and secure</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">
                Three layers of protection work together to ensure every exam is taken honestly — without disrupting the student experience.
              </motion.p>

              <motion.div variants={staggerContainer} className="mt-10 space-y-6">
                {[
                  {
                    icon: <Eye className="w-5 h-5" />,
                    title: "Tab switching detection",
                    desc: "Instantly detects when students navigate away from the exam. Every switch is logged with a timestamp and flagged for teacher review.",
                    color: "bg-warning/15 text-warning",
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    title: "Fullscreen exam mode",
                    desc: "Locks the browser into fullscreen during the exam. Attempts to exit are recorded and can trigger automatic warnings.",
                    color: "bg-destructive/15 text-destructive",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: "Webcam monitoring",
                    desc: "Optional webcam proctoring verifies student identity and flags suspicious behavior like looking away or multiple faces detected.",
                    color: "bg-info/15 text-info",
                  },
                ].map((item) => (
                  <motion.div key={item.title} variants={fadeUp} className="flex gap-4 group">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Monitoring mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-destructive/10 to-warning/10 rounded-3xl blur-2xl opacity-50" />
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-foreground">Live Monitoring</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                    </span>
                    <span className="text-xs text-muted-foreground">28 students active</span>
                  </div>
                </div>

                {/* Student monitoring cards */}
                <div className="p-5 space-y-3">
                  {[
                    { name: "Nguyen Van A", status: "clean", tabs: 0, fullscreen: true, webcam: true, progress: 85 },
                    { name: "Tran Thi B", status: "warning", tabs: 3, fullscreen: true, webcam: true, progress: 62 },
                    { name: "Le Van C", status: "clean", tabs: 0, fullscreen: true, webcam: true, progress: 40 },
                    { name: "Pham Thi D", status: "flagged", tabs: 7, fullscreen: false, webcam: false, progress: 55 },
                  ].map((student, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                        student.status === "flagged"
                          ? "border-destructive/30 bg-destructive/5"
                          : student.status === "warning"
                          ? "border-warning/30 bg-warning/5"
                          : "border-border/30 bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                          {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{student.name}</div>
                          <div className="text-[10px] text-muted-foreground">{student.progress}% complete</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tab switches */}
                        <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${student.tabs > 2 ? "bg-warning/20 text-warning" : "bg-muted/50 text-muted-foreground"}`}>
                          <Eye className="w-2.5 h-2.5" />
                          {student.tabs}
                        </div>
                        {/* Fullscreen */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${student.fullscreen ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"}`}>
                          <Shield className="w-2.5 h-2.5" />
                        </div>
                        {/* Webcam */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${student.webcam ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"}`}>
                          <Users className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary bar */}
                <div className="px-5 py-3 border-t border-border/30 bg-muted/10 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1 text-accent"><span className="w-2 h-2 rounded-full bg-accent" /> 24 Clean</span>
                    <span className="flex items-center gap-1 text-warning"><span className="w-2 h-2 rounded-full bg-warning" /> 3 Warnings</span>
                    <span className="flex items-center gap-1 text-destructive"><span className="w-2 h-2 rounded-full bg-destructive" /> 1 Flagged</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/20 to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge="Pricing" title="Simple, transparent pricing" subtitle="Start free. Upgrade when you need more." />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`rounded-2xl border p-7 flex flex-col backdrop-blur-sm transition-all duration-300 ${
                  plan.highlighted
                    ? "border-primary/40 bg-card/90 shadow-2xl shadow-primary/15 ring-1 ring-primary/20 relative"
                    : "border-border/60 bg-card/80 hover:border-primary/20 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/25">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button
                    className={`w-full rounded-full h-11 transition-all duration-300 ${plan.highlighted ? "shadow-lg shadow-primary/20 hover:shadow-primary/30" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Customization & Preferences ─── */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge="Customization" title="Make it yours — every detail" subtitle="Language switching, theme preferences, and UI settings that let every user feel at home." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mockup */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="order-2 lg:order-1"
            >
              <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 space-y-5">
                {/* Theme selector */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Theme</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Light", icon: <Sun className="w-4 h-4" />, active: false },
                      { label: "Dark", icon: <Moon className="w-4 h-4" />, active: true },
                      { label: "System", icon: <Monitor className="w-4 h-4" />, active: false },
                    ].map((t, i) => (
                      <motion.div
                        key={t.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                          t.active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Language selector */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Languages className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Language</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { lang: "English", flag: "🇺🇸", active: false },
                      { lang: "Tiếng Việt", flag: "🇻🇳", active: true },
                      { lang: "日本語", flag: "🇯🇵", active: false },
                    ].map((l, i) => (
                      <motion.div
                        key={l.lang}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                          l.active
                            ? "bg-primary/10 text-primary font-medium border border-primary/20"
                            : "text-muted-foreground hover:bg-secondary border border-transparent"
                        }`}
                      >
                        <span className="text-base">{l.flag}</span>
                        <span>{l.lang}</span>
                        {l.active && <CheckCircle className="w-3.5 h-3.5 ml-auto" />}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* UI Preferences */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Preferences</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Compact sidebar", on: true },
                      { label: "Show exam timer", on: true },
                      { label: "Sound notifications", on: false },
                    ].map((p, i) => (
                      <motion.div
                        key={p.label}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/40 hover:border-primary/20 transition-colors"
                      >
                        <span className="text-sm text-foreground">{p.label}</span>
                        <div className={`w-9 h-5 rounded-full flex items-center transition-colors ${p.on ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
                          <div className="w-4 h-4 rounded-full bg-primary-foreground mx-0.5 shadow-sm" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Text content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="order-1 lg:order-2 space-y-6"
            >
              {[
                { icon: <Languages className="w-5 h-5" />, title: "Language switching", desc: "Seamlessly switch between Vietnamese, English, Japanese, and more. The entire interface adapts instantly — menus, labels, notifications, and exam content." },
                { icon: <Palette className="w-5 h-5" />, title: "Theme & appearance", desc: "Choose Light, Dark, or System themes. Each theme is carefully crafted for readability and comfort during long grading or exam sessions." },
                { icon: <SlidersHorizontal className="w-5 h-5" />, title: "User UI preferences", desc: "Customize sidebar layout, notification sounds, timer visibility, and display density. Your preferences sync across all devices automatically." },
              ].map((item) => (
                <motion.div key={item.title} variants={fadeUp} className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 lg:py-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge="Testimonials" title="Loved by educators everywhere" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-7 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-7">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge="FAQ" title="Frequently asked questions" />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/20 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5">
                        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-info/80" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)", backgroundSize: "20px 20px" }} />

            <div className="relative p-12 sm:p-20 text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Award className="w-14 h-14 text-primary-foreground/25 mx-auto mb-8" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground tracking-tight">
                Start creating exams today
              </h2>
              <p className="mt-5 text-primary-foreground/70 max-w-lg mx-auto text-lg leading-relaxed">
                Join thousands of educators who save hours every week with EduFlow.
              </p>
              <div className="mt-10">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full px-10 h-13 text-base gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-2xl hover:scale-[1.03] transition-all duration-300 group">
                    Get started free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 py-16 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-base font-bold text-foreground">EduFlow</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Modern online exam and learning management for educators.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog"] },
              { title: "Resources", links: ["Documentation", "Blog", "Tutorials", "API"] },
              { title: "Company", links: ["About", "Careers", "Contact", "Press"] },
              { title: "Legal", links: ["Terms", "Privacy", "Security", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-[0.15em] mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 EduFlow. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
