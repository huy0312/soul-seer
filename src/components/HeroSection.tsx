
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
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
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-glow">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
              Khám Phá Vận Mệnh
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-semibold mb-8 text-purple-200">
            Với Bói Bài Tarot Huyền Bí
          </h2>

          <p className="text-lg md:text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Hãy để những lá bài Tarot cổ xưa dẫn lối bạn khám phá tương lai, tình yêu, sự nghiệp và cuộc sống. 
            Trải nghiệm sự huyền bí và tìm thấy câu trả lời cho những thắc mắc trong tâm hồn.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-full text-lg animate-glow transform hover:scale-105 transition-all duration-300"
            >
              <Star className="w-5 h-5 mr-2" />
              Bói Bài Miễn Phí
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-purple-400 text-purple-300 hover:bg-purple-400 hover:text-purple-900 font-semibold px-8 py-4 rounded-full text-lg backdrop-blur-sm"
            >
              Tìm Hiểu Thêm
            </Button>
          </div>

          {/* Floating Tarot Cards Animation */}
          <div className="relative">
            <div className="flex justify-center space-x-4">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="w-16 h-24 md:w-20 md:h-32 bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg border-2 border-purple-400 shadow-2xl animate-float mystic-card"
                  style={{
                    animationDelay: `${card * 0.5}s`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-purple-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
};

export default HeroSection;
