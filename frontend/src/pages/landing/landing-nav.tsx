import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { t, useLanguage } from "@/i18n";

export function LandingNav() {
  const lang = useLanguage();
  return (
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
            <span className="text-lg font-bold text-foreground tracking-tight">{t("app.brand", lang)}</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: t("landing.nav.features", lang), href: "#features" },
              { label: t("landing.nav.how", lang), href: "#how-it-works" },
              { label: t("landing.nav.pricing", lang), href: "#pricing" },
              { label: t("landing.nav.faq", lang), href: "#faq" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                {t("landing.nav.login", lang)}
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                {t("landing.nav.getStarted", lang)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
