import {
  FileText,
  Database,
  CheckCircle,
  Eye,
  Shield,
  BarChart3,
  Globe,
  MousePointerClick,
  Sparkles,
} from "lucide-react";

export const features = [
  {
    icon: <FileText className="w-5 h-5" />,
    titleKey: "landing.features.items.create.title",
    descKey: "landing.features.items.create.desc",
    gradient: "from-primary/20 to-info/20",
  },
  {
    icon: <Database className="w-5 h-5" />,
    titleKey: "landing.features.items.bank.title",
    descKey: "landing.features.items.bank.desc",
    gradient: "from-accent/20 to-primary/20",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    titleKey: "landing.features.items.grading.title",
    descKey: "landing.features.items.grading.desc",
    gradient: "from-info/20 to-accent/20",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    titleKey: "landing.features.items.monitoring.title",
    descKey: "landing.features.items.monitoring.desc",
    gradient: "from-warning/20 to-primary/20",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    titleKey: "landing.features.items.integrity.title",
    descKey: "landing.features.items.integrity.desc",
    gradient: "from-destructive/20 to-warning/20",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    titleKey: "landing.features.items.analytics.title",
    descKey: "landing.features.items.analytics.desc",
    gradient: "from-primary/20 to-accent/20",
  },
];

export const steps = [
  {
    num: "01",
    titleKey: "landing.how.items.create.title",
    descKey: "landing.how.items.create.desc",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    num: "02",
    titleKey: "landing.how.items.share.title",
    descKey: "landing.how.items.share.desc",
    icon: <Globe className="w-6 h-6" />,
  },
  {
    num: "03",
    titleKey: "landing.how.items.take.title",
    descKey: "landing.how.items.take.desc",
    icon: <MousePointerClick className="w-6 h-6" />,
  },
  {
    num: "04",
    titleKey: "landing.how.items.results.title",
    descKey: "landing.how.items.results.desc",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

export const plans = [
  {
    nameKey: "landing.pricing.free.name",
    price: "$0",
    periodKey: "landing.pricing.free.period",
    descKey: "landing.pricing.free.desc",
    featureKeys: ["landing.pricing.free.feature1", "landing.pricing.free.feature2", "landing.pricing.free.feature3", "landing.pricing.free.feature4", "landing.pricing.free.feature5"],
    ctaKey: "landing.pricing.free.cta",
    highlighted: false,
  },
  {
    nameKey: "landing.pricing.pro.name",
    price: "$19",
    periodKey: "landing.pricing.shared.perMonth",
    descKey: "landing.pricing.pro.desc",
    featureKeys: [
      "landing.pricing.pro.feature1",
      "landing.pricing.pro.feature2",
      "landing.pricing.pro.feature3",
      "landing.pricing.pro.feature4",
      "landing.pricing.pro.feature5",
      "landing.pricing.pro.feature6",
    ],
    ctaKey: "landing.pricing.pro.cta",
    highlighted: true,
  },
  {
    nameKey: "landing.pricing.school.name",
    price: "$99",
    periodKey: "landing.pricing.shared.perMonth",
    descKey: "landing.pricing.school.desc",
    featureKeys: [
      "landing.pricing.school.feature1",
      "landing.pricing.school.feature2",
      "landing.pricing.school.feature3",
      "landing.pricing.school.feature4",
      "landing.pricing.school.feature5",
      "landing.pricing.school.feature6",
    ],
    ctaKey: "landing.pricing.school.cta",
    highlighted: false,
  },
];

export const testimonials = [
  {
    quoteKey: "landing.testimonials.items.1.quote",
    name: "Ms. Nguyen Thi Lan",
    roleKey: "landing.testimonials.items.1.role",
    avatar: "NL",
  },
  {
    quoteKey: "landing.testimonials.items.2.quote",
    name: "Mr. Tran Van Duc",
    roleKey: "landing.testimonials.items.2.role",
    avatar: "TD",
  },
  {
    quoteKey: "landing.testimonials.items.3.quote",
    name: "Dr. Le Minh Chau",
    roleKey: "landing.testimonials.items.3.role",
    avatar: "LC",
  },
];

export const faqs = [
  { qKey: "landing.faq.items.1.q", aKey: "landing.faq.items.1.a" },
  { qKey: "landing.faq.items.2.q", aKey: "landing.faq.items.2.a" },
  {
    qKey: "landing.faq.items.3.q",
    aKey: "landing.faq.items.3.a",
  },
  {
    qKey: "landing.faq.items.4.q",
    aKey: "landing.faq.items.4.a",
  },
  { qKey: "landing.faq.items.5.q", aKey: "landing.faq.items.5.a" },
  {
    qKey: "landing.faq.items.6.q",
    aKey: "landing.faq.items.6.a",
  },
];

export const trustedLogos = [
  "landing.trusted.logo1",
  "landing.trusted.logo2",
  "landing.trusted.logo3",
  "landing.trusted.logo4",
  "landing.trusted.logo5",
];
