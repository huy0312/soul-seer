
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users } from "lucide-react";
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const tarotImages = [
    {
      src: "/lovable-uploads/6eca27cb-b928-4990-8a08-e98c20ce32df.png",
      alt: "Arcana Pulse",
      title: "Arcana Pulse"
    },
    {
      src: "/lovable-uploads/5b8a4aad-301c-491c-9474-ebbce98faf73.png",
      alt: "Cosmic Whispers", 
      title: "Cosmic Whispers"
    },
    {
      src: "/lovable-uploads/abaade9c-fb7d-41b1-9d08-e0e58a6748ce.png",
      alt: "Lunar Veil",
      title: "Lunar Veil"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % tarotImages.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/Logo.png')] bg-center bg-no-repeat bg-cover opacity-5"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-serif leading-tight">
                  <span className="bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent text-glow">
                    Soul Seer
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-purple-200 font-light">
                  Khám phá tương lai qua lá bài tarot
                </p>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
                  Với công nghệ AI tiên tiến và kiến thức cổ xưa về tarot, chúng tôi mang đến cho bạn những dự đoán chính xác và sâu sắc về cuộc sống.
                </p>
              </div>

              {/* User count display */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-amber-300">
                <Users className="w-5 h-5" />
                <span className="text-lg font-medium">250+ người đang sử dụng</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/tarot-reading">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Xem Tarot Ngay
                  </Button>
                </Link>
                <Link to="/ai-reading">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-purple-400 text-purple-200 hover:bg-purple-400 hover:text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Tư Vấn AI
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Tarot Cards */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main card display */}
                <Card className="mystic-card w-80 h-96 overflow-hidden">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full">
                      <img 
                        src={tarotImages[currentImageIndex].src}
                        alt={tarotImages[currentImageIndex].alt}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <h3 className="text-white text-xl font-bold text-center">
                          {tarotImages[currentImageIndex].title}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating cards around main card */}
                <div className="absolute -top-8 -left-8 w-16 h-24 bg-gradient-to-br from-purple-500 to-amber-500 rounded-lg opacity-80 animate-float"></div>
                <div className="absolute -bottom-4 -right-4 w-12 h-18 bg-gradient-to-br from-amber-500 to-purple-500 rounded-lg opacity-60 animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 -left-12 w-8 h-12 bg-gradient-to-br from-purple-300 to-amber-300 rounded-lg opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
