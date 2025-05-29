
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, Briefcase, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: Heart,
    title: "Tình Cảm",
    description: "Khám phá vận mệnh tình yêu, tìm hiểu về người ấy và tương lai của mối quan hệ.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Calendar,
    title: "Tarot Hàng Ngày",
    description: "Nhận lời khuyên và hướng dẫn cho ngày mới với lá bài tarot đặc biệt.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Briefcase,
    title: "Công Việc",
    description: "Tìm hiểu về con đường sự nghiệp, cơ hội thăng tiến và hướng phát triển.",
    color: "from-amber-500 to-yellow-500"
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-slate-900 to-purple-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-glow font-serif">
            <span className="bg-gradient-to-r from-purple-300 via-amber-300 to-cyan-300 bg-clip-text text-transparent">
              Dịch Vụ Trải Bài Tarot
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-sans">
            Khám phá tương lai qua 3 lĩnh vực chính của cuộc sống với bộ bài Smith Waite cổ điển
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm group cursor-pointer transform hover:scale-105 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${service.color} rounded-full flex items-center justify-center mb-4 group-hover:animate-pulse`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mb-2 font-serif">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm leading-relaxed font-sans">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <Link to="/tarot-reading">
                  <Button className={`w-full bg-gradient-to-r ${service.color} hover:opacity-90 text-white font-semibold py-2 rounded-full transition-all duration-300`}>
                    Trải Bài Ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
