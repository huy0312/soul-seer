
import { Button } from '@/components/ui/button';
import { Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Stars Background */}
      <div className="stars"></div>
      
      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/lovable-uploads/f2a0fcc4-ee53-4dbf-b3ac-219dcb1f6745.png" 
              alt="Soul Seer Logo" 
              className="w-24 h-24 mx-auto animate-glow rounded-full"
            />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-purple-300 via-amber-300 to-cyan-300 bg-clip-text text-transparent animate-pulse">
              Soul Seer
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-slate-200 font-serif">
            Tarot AI Huyền Bí
          </h2>

          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-sans">
            Khám phá vận mệnh qua bộ bài Smith Waite cổ điển với sức mạnh AI Gemini. 
            Trải nghiệm bói bài tình cảm, công việc và cuộc sống với độ chính xác cao.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/tarot-reading">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-full text-lg animate-glow transform hover:scale-105 transition-all duration-300 font-sans"
              >
                <Star className="w-5 h-5 mr-2" />
                Trải Bài Miễn Phí
              </Button>
            </Link>
            <Link to="/ai-reading">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-slate-900 font-semibold px-8 py-4 rounded-full text-lg backdrop-blur-sm font-sans"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Bói AI Gemini
              </Button>
            </Link>
          </div>

          {/* Floating Tarot Cards Animation */}
          <div className="relative">
            <div className="flex justify-center space-x-4">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="w-16 h-24 md:w-20 md:h-32 bg-gradient-to-b from-purple-800 to-amber-900 rounded-lg border-2 border-amber-400 shadow-2xl animate-float mystic-card"
                  style={{
                    animationDelay: `${card * 0.5}s`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-amber-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
