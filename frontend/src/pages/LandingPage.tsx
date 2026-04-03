import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import {
  ArrowRight,
  FileText,
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
  Sparkles,
  Languages,
  Palette,
  Sun,
  Moon,
  Monitor,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { features, steps, plans, testimonials, faqs, trustedLogos } from "@/pages/landing/landing-data";
import { fadeUp, staggerContainer } from "@/pages/landing/landing-motion";
import { SectionHeader } from "@/pages/landing/landing-primitives";
import { LandingNav } from "@/pages/landing/landing-nav";
import { LandingHero } from "@/pages/landing/landing-hero";
import { t, useLanguage } from "@/i18n";

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const lang = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <LandingHero />

      {/* ─── Trusted By ─── */}
      <section className="border-y border-border/50 bg-muted/20 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-10">{t("landing.trusted.title", lang)}</p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6"
          >
            {trustedLogos.map((nameKey, i) => (
              <motion.div key={nameKey} variants={fadeUp} custom={i} className="flex items-center gap-2.5 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">{t(nameKey as never, lang)}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 lg:py-32 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader badge={t("landing.features.badge", lang)} title={t("landing.features.title", lang)} subtitle={t("landing.features.subtitle", lang)} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.titleKey}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-7 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{t(f.titleKey as never, lang)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey as never, lang)}</p>
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
          <SectionHeader badge={t("landing.how.badge", lang)} title={t("landing.how.title", lang)} />
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
                  <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">{t("landing.how.step", lang)} {s.num}</span>
                  <h3 className="text-base font-semibold text-foreground mt-2 mb-2">{t(s.titleKey as never, lang)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(s.descKey as never, lang)}</p>
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
                    <span className="text-sm font-semibold text-foreground">{t("landing.grading.header", lang)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{t("landing.grading.gradedIn", lang)}</span>
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
                  <p className="text-sm font-medium text-foreground">{t("landing.grading.performance", lang)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("landing.grading.correctCount", lang)}</p>
                </div>
                {/* Question breakdown */}
                <div className="p-5 space-y-3">
                  {[
                    { q: t("landing.grading.sample1", lang), correct: true },
                    { q: t("landing.grading.sample2", lang), correct: true },
                    { q: t("landing.grading.sample3", lang), correct: true },
                    { q: t("landing.grading.sample4", lang), correct: false },
                    { q: t("landing.grading.sample5", lang), correct: true },
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
              <motion.p variants={fadeUp} className="text-sm font-semibold text-accent mb-3 uppercase tracking-wide">{t("landing.grading.badge", lang)}</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
                {t("landing.grading.title", lang)}{" "}
                <span className="bg-gradient-to-r from-accent to-info bg-clip-text text-transparent">{t("landing.grading.titleHighlight", lang)}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">
                {t("landing.grading.subtitle", lang)}
              </motion.p>
              <motion.div variants={staggerContainer} className="mt-8 space-y-4">
                {[
                  { text: t("landing.grading.point1", lang), icon: <Zap className="w-3.5 h-3.5" /> },
                  { text: t("landing.grading.point2", lang), icon: <Sparkles className="w-3.5 h-3.5" /> },
                  { text: t("landing.grading.point3", lang), icon: <FileText className="w-3.5 h-3.5" /> },
                  { text: t("landing.grading.point4", lang), icon: <BarChart3 className="w-3.5 h-3.5" /> },
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
                    {t("landing.grading.cta", lang)} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">{t("landing.analytics.badge", lang)}</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
                {t("landing.analytics.title", lang)}{" "}
                <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">{t("landing.analytics.titleHighlight", lang)}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">
                {t("landing.analytics.subtitle", lang)}
              </motion.p>

              <motion.div variants={staggerContainer} className="mt-10 space-y-6">
                {[
                  {
                    icon: <BarChart3 className="w-5 h-5" />,
                    title: t("landing.analytics.item1.title", lang),
                    desc: t("landing.analytics.item1.desc", lang),
                    color: "bg-primary/15 text-primary",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: t("landing.analytics.item2.title", lang),
                    desc: t("landing.analytics.item2.desc", lang),
                    color: "bg-accent/15 text-accent",
                  },
                  {
                    icon: <Eye className="w-5 h-5" />,
                    title: t("landing.analytics.item3.title", lang),
                    desc: t("landing.analytics.item3.desc", lang),
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
                    <span className="text-sm font-semibold text-foreground">{t("landing.analytics.header", lang)}</span>
                  </div>
                  <div className="flex gap-1">
            {["7D", "30D", t("common.all", lang)].map((period, i) => (
                      <Badge
                        key={period}
                        variant={i === 1 ? "default" : "secondary"}
                        className="cursor-pointer text-[10px] rounded-md px-2.5 py-1 h-auto font-medium"
                      >
                        {period}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Score distribution chart */}
                  <div className="rounded-xl bg-muted/30 border border-border/20 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-muted-foreground font-medium">{t("landing.analytics.item1.title", lang)}</div>
                      <div className="text-xs text-muted-foreground">{t("landing.analytics.average", lang)}: <span className="text-foreground font-semibold">72.4</span></div>
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
                    <div className="text-xs text-muted-foreground font-medium mb-4">{t("landing.analytics.item2.title", lang)}</div>
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
                      { val: "72.4", label: t("landing.analytics.avgScore", lang), color: "text-foreground" },
                      { val: "94%", label: t("landing.analytics.passRate", lang), color: "text-accent" },
                      { val: "1.2k", label: t("landing.analytics.students", lang), color: "text-primary" },
                      { val: "86", label: t("landing.analytics.exams", lang), color: "text-info" },
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
              <motion.p variants={fadeUp} className="text-sm font-semibold text-destructive mb-3 uppercase tracking-wide">{t("landing.integrity.badge", lang)}</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
                {t("landing.integrity.title", lang)}{" "}
                <span className="bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">{t("landing.integrity.titleHighlight", lang)}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted-foreground text-lg leading-relaxed">
                {t("landing.integrity.subtitle", lang)}
              </motion.p>

              <motion.div variants={staggerContainer} className="mt-10 space-y-6">
                {[
                  {
                    icon: <Eye className="w-5 h-5" />,
                    title: t("landing.integrity.item1.title", lang),
                    desc: t("landing.integrity.item1.desc", lang),
                    color: "bg-warning/15 text-warning",
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    title: t("landing.integrity.item2.title", lang),
                    desc: t("landing.integrity.item2.desc", lang),
                    color: "bg-destructive/15 text-destructive",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: t("landing.integrity.item3.title", lang),
                    desc: t("landing.integrity.item3.desc", lang),
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
                    <span className="text-sm font-semibold text-foreground">{t("landing.integrity.header", lang)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                    </span>
                    <span className="text-xs text-muted-foreground">{t("landing.integrity.studentsActive", lang)}</span>
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
                          <div className="text-[10px] text-muted-foreground">{student.progress}% {t("landing.integrity.complete", lang)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tab switches */}
                        <Badge
                          variant={student.tabs > 2 ? "outline" : "secondary"}
                          className={`gap-1 text-[10px] px-2 py-0.5 h-auto font-semibold ${
                            student.tabs > 2
                              ? "border-warning/30 bg-warning/10 text-warning"
                              : "border-transparent bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <Eye className="w-2.5 h-2.5" />
                          {student.tabs}
                        </Badge>
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
                    <span className="flex items-center gap-1 text-accent"><span className="w-2 h-2 rounded-full bg-accent" /> 24 {t("landing.integrity.clean", lang)}</span>
                    <span className="flex items-center gap-1 text-warning"><span className="w-2 h-2 rounded-full bg-warning" /> 3 {t("landing.integrity.warnings", lang)}</span>
                    <span className="flex items-center gap-1 text-destructive"><span className="w-2 h-2 rounded-full bg-destructive" /> 1 {t("landing.integrity.flagged", lang)}</span>
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
          <SectionHeader badge={t("landing.pricing.badge", lang)} title={t("landing.pricing.title", lang)} subtitle={t("landing.pricing.subtitle", lang)} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.nameKey}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`rounded-2xl border p-7 flex flex-col backdrop-blur-sm transition-all duration-300 ${
                  plan.highlighted
                    ? "border-primary/40 bg-card/90 shadow-2xl shadow-primary/15 ring-1 ring-primary/20 relative"
                    : "border-border/60 bg-card/80 hover:border-primary/20 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <Badge
                    variant="default"
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 border-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                  >
                    {t("landing.pricing.popular", lang)}
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground">{t(plan.nameKey as never, lang)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t(plan.descKey as never, lang)}</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{t(plan.periodKey as never, lang)}</span>
                </div>
                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                      {t(featureKey as never, lang)}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button
                    className={`w-full rounded-full h-11 transition-all duration-300 ${plan.highlighted ? "shadow-lg shadow-primary/20 hover:shadow-primary/30" : ""}`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {t(plan.ctaKey as never, lang)}
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
          <SectionHeader badge={t("landing.customization.badge", lang)} title={t("landing.customization.title", lang)} subtitle={t("landing.customization.subtitle", lang)} />

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
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{t("landing.customization.theme", lang)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: t("settings.appearance.theme.light", lang), icon: <Sun className="w-4 h-4" />, active: false },
                      { label: t("settings.appearance.theme.dark", lang), icon: <Moon className="w-4 h-4" />, active: true },
                      { label: t("settings.appearance.theme.system", lang), icon: <Monitor className="w-4 h-4" />, active: false },
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
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{t("settings.tab.language", lang)}</span>
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
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{t("landing.customization.preferences", lang)}</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: t("landing.customization.pref1", lang), on: true },
                      { label: t("landing.customization.pref2", lang), on: true },
                      { label: t("landing.customization.pref3", lang), on: false },
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
              { icon: <Languages className="w-5 h-5" />, title: t("landing.customization.item1.title", lang), desc: t("landing.customization.item1.desc", lang) },
              { icon: <Palette className="w-5 h-5" />, title: t("landing.customization.item2.title", lang), desc: t("landing.customization.item2.desc", lang) },
              { icon: <SlidersHorizontal className="w-5 h-5" />, title: t("landing.customization.item3.title", lang), desc: t("landing.customization.item3.desc", lang) },
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
          <SectionHeader badge={t("landing.testimonials.badge", lang)} title={t("landing.testimonials.title", lang)} />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-7 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-7">"{t(testimonial.quoteKey as never, lang)}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{t(testimonial.roleKey as never, lang)}</div>
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
          <SectionHeader badge={t("landing.faq.badge", lang)} title={t("landing.faq.title", lang)} />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-primary/20 transition-colors"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="h-auto w-full justify-between gap-4 rounded-none p-5 text-left font-normal group hover:bg-transparent"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t(faq.qKey as never, lang)}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.div>
                </Button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5">
                        <p className="text-sm text-muted-foreground leading-relaxed">{t(faq.aKey as never, lang)}</p>
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
                {t("landing.cta.title", lang)}
              </h2>
              <p className="mt-5 text-primary-foreground/70 max-w-lg mx-auto text-lg leading-relaxed">
                {t("landing.cta.subtitle", lang)}
              </p>
              <div className="mt-10">
                <Link to="/signup">
                  <Button size="lg" className="rounded-full px-10 h-13 text-base gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-2xl hover:scale-[1.03] transition-all duration-300 group">
                    {t("landing.cta.button", lang)} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
                <span className="text-base font-bold text-foreground">{t("app.brand", lang)}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("landing.footer.tagline", lang)}</p>
            </div>
            {[
              { title: t("landing.footer.product", lang), links: [t("landing.footer.link.features", lang), t("landing.footer.link.pricing", lang), t("landing.footer.link.integrations", lang), t("landing.footer.link.changelog", lang)] },
              { title: t("landing.footer.resources", lang), links: [t("landing.footer.link.documentation", lang), t("landing.footer.link.blog", lang), t("landing.footer.link.tutorials", lang), t("landing.footer.link.api", lang)] },
              { title: t("landing.footer.company", lang), links: [t("landing.footer.link.about", lang), t("landing.footer.link.careers", lang), t("landing.footer.link.contact", lang), t("landing.footer.link.press", lang)] },
              { title: t("landing.footer.legal", lang), links: [t("landing.footer.link.terms", lang), t("landing.footer.link.privacy", lang), t("landing.footer.link.security", lang), t("landing.footer.link.gdpr", lang)] },
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
            <p className="text-xs text-muted-foreground">{t("landing.footer.copyright", lang)}</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t("landing.footer.link.terms", lang)}</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t("landing.footer.link.privacy", lang)}</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t("landing.footer.link.support", lang)}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
