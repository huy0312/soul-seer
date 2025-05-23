
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
