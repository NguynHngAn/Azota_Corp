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
    title: "Create exams in minutes",
    desc: "Intuitive drag-and-drop exam builder with multiple question types, auto-save, and templates. Import questions directly from PDF or Word documents.",
    gradient: "from-primary/20 to-info/20",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Question bank management",
    desc: "Organize thousands of questions by subject, difficulty, and tags. Reuse across exams effortlessly.",
    gradient: "from-accent/20 to-primary/20",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Automatic grading",
    desc: "Exams are graded the moment students submit — multiple choice, fill-in-the-blank, and matching questions scored instantly with zero manual effort.",
    gradient: "from-info/20 to-accent/20",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Real-time monitoring",
    desc: "Watch students take exams live. See progress, time remaining, and submission status in real time.",
    gradient: "from-warning/20 to-primary/20",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Anti-cheating technology",
    desc: "Multi-layered exam integrity: tab switch detection flags wandering students, fullscreen mode locks the browser, and optional webcam monitoring ensures identity verification.",
    gradient: "from-destructive/20 to-warning/20",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Advanced analytics",
    desc: "Visualize score distributions, compare class performance side-by-side, and drill into per-question difficulty — all in interactive, exportable dashboards.",
    gradient: "from-primary/20 to-accent/20",
  },
];

export const steps = [
  {
    num: "01",
    title: "Create your exam",
    desc: "Use our intuitive builder to craft exams with multiple question types.",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    num: "02",
    title: "Share with students",
    desc: "Send an exam link or code. Students join with one click.",
    icon: <Globe className="w-6 h-6" />,
  },
  {
    num: "03",
    title: "Students take the exam",
    desc: "Secure, timed testing with anti-cheating features.",
    icon: <MousePointerClick className="w-6 h-6" />,
  },
  {
    num: "04",
    title: "Instant results",
    desc: "Students see their score, correct answers, and detailed feedback the second they submit.",
    icon: <Sparkles className="w-6 h-6" />,
  },
];

export const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For individual teachers getting started.",
    features: ["Up to 30 students", "5 exams per month", "Basic question types", "Auto grading", "Email support"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For teachers who need more power.",
    features: [
      "Unlimited students",
      "Unlimited exams",
      "All question types",
      "Anti-cheating tools",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "School",
    price: "$99",
    period: "/month",
    desc: "For schools and training centers.",
    features: [
      "Everything in Pro",
      "Unlimited teachers",
      "Admin dashboard",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export const testimonials = [
  {
    quote:
      "This platform cut my exam grading time by 90%. I can now focus on actually teaching instead of paper management.",
    name: "Ms. Nguyen Thi Lan",
    role: "Mathematics Teacher, Hanoi",
    avatar: "NL",
  },
  {
    quote:
      "The anti-cheating features give me confidence that exam results are fair. The real-time monitoring is a game changer.",
    name: "Mr. Tran Van Duc",
    role: "Physics Teacher, HCMC",
    avatar: "TD",
  },
  {
    quote: "We deployed this across 12 departments. The admin dashboard makes managing 200+ teachers seamless.",
    name: "Dr. Le Minh Chau",
    role: "Director, ABC Training Center",
    avatar: "LC",
  },
];

export const faqs = [
  { q: "Is there a free plan?", a: "Yes! Our free plan lets you create up to 5 exams per month with 30 students. No credit card required." },
  { q: "Do students need to install anything?", a: "No. Students access exams through any web browser on desktop, tablet, or mobile. No app download needed." },
  {
    q: "How does the anti-cheating system work?",
    a: "We use multiple layers: tab switch detection, fullscreen enforcement, webcam monitoring, copy-paste prevention, and AI-powered behavioral analysis.",
  },
  {
    q: "Can I import existing questions?",
    a: "Yes, you can import questions from Excel, CSV, or Word documents. We also support bulk import with automatic formatting.",
  },
  { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit. We comply with GDPR and maintain SOC 2 certification." },
  {
    q: "Can I customize the exam interface?",
    a: "Pro and School plans include custom branding options — add your logo, colors, and custom domain.",
  },
];

export const trustedLogos = ["University of Science", "Tech Academy", "Global Institute", "Metro School", "EduPrime"];
