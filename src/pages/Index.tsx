
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import SubscriptionPlans from '@/components/SubscriptionPlans';
import WeeklyHoroscope from '@/components/WeeklyHoroscope';
import AboutSection from '@/components/AboutSection';
import BookingSection from '@/components/BookingSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <ServicesSection />
      <SubscriptionPlans />
      <WeeklyHoroscope />
      <BookingSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
