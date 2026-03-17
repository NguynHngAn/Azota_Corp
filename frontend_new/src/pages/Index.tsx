import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import SocialProof from "@/components/landing/SocialProof";
import AudienceSection from "@/components/landing/AudienceSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import DashboardPreview from "@/components/landing/DashboardPreview";
import AntiCheatSection from "@/components/landing/AntiCheatSection";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <SocialProof />
      <AudienceSection />
      <FeaturesGrid />
      <FeatureShowcase />
      <DashboardPreview />
      <AntiCheatSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
