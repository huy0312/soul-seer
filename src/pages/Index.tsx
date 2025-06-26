
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import WeeklyHoroscope from '@/components/WeeklyHoroscope';
import BookingSection from '@/components/BookingSection';
import Footer from '@/components/Footer';
import BackgroundMusic from '@/components/BackgroundMusic';
import AdminStats from '@/components/AdminStats';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <WeeklyHoroscope />
      <BookingSection />
      <AdminStats />
      <Footer />
      <BackgroundMusic />
      
      <style>{`
        /* Improve "Bước tiếp theo" text visibility */
        .text-muted-foreground,
        .text-slate-500,
        .text-gray-500 {
          color: rgb(203 213 225) !important; /* slate-300 */
        }
        
        /* Ensure better contrast for next step text */
        [class*="next-step"],
        [class*="step-indicator"] {
          color: rgb(226 232 240) !important; /* slate-200 */
          font-weight: 500;
        }
        
        /* General improvement for hard-to-read text */
        .text-sm.text-muted-foreground {
          color: rgb(203 213 225) !important;
        }
      `}</style>
    </div>
  );
};

export default Index;
